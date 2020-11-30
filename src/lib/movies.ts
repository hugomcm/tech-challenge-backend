import { knex } from '../util/knex'

export interface Movie {
  id: number
  name: string,
  synopsis: string, 
  releasedAt: Date, 
  runtime: number
  actors: MovieActor[],
  genres: MovieGenre[]
}

export interface MovieActor {
  actor_id: number,
  character_name: string
}
export interface MovieGenre {
  genre_id: number
}


export function list(): Promise<Movie[]> {
  return knex.from('movie').select()
}

export function find(id: number): Promise<Movie> {
  // return knex.from('movie').where({ id }).first()
  return Promise.all([
    knex.from('movie').where({ id }).first(),
    knex.from('actor_movie').where({ movie_id: id }).select('actor_id', 'character_name'),
    knex.from('genre_movie').where({ movie_id: id }).select('genre_id')
  ])
    .then(([ movie, movieActors, movieGenres ]) => {
      if(!movie) throw(`No movie with id: ${id}`)
      return { ...movie, actors: movieActors, genres: movieGenres }
    })
    .catch((err) => undefined)
}

/** @returns whether the ID was actually found */
export async function remove(id: number): Promise<boolean> {
  const count = await knex.from('movie').where({ id }).delete()
  return count > 0
}

/** @returns the ID that was created */
export async function create(name: string, synopsis: string, releasedAt: Date, runtime: number, actors: MovieActor[], genres: MovieGenre[]): Promise<number> {
  // const [ id ] = await (knex.into('movie').insert({ name, synopsis, releasedAt, runtime }))
  // return id
  return await knex.transaction(async trx => {    
    const [ id ] = await (trx.into('movie').insert({ name, synopsis, releasedAt, runtime }))
    if(!!actors && actors instanceof Array){
      await knex.into('actor_movie').insert(actors.map(aa => ({ movie_id: id, ...aa }))).transacting(trx)
    }
    if(!!genres && genres instanceof Array){
      await knex.into('genre_movie').insert(genres.map(ag => ({ movie_id: id, ...ag }))).transacting(trx)
    }

    return id
  })
}

/** @returns whether the ID was actually found */
export async function update(id: number, name: string, synopsis: string, releasedAt: Date, runtime: number, actors: MovieActor[], genres: MovieGenre[]): Promise<boolean>  {
  // const count = await knex.from('movie').where({ id }).update({ name, synopsis, releasedAt, runtime })
  // return count > 0
  return await knex.transaction(async trx => { 
    const count = await knex.from('movie').where({ id }).update({ name, synopsis, releasedAt, runtime })

    if(!!actors && actors instanceof Array) {
      await knex.from('actor_movie').where({ movie_id: id }).delete().transacting(trx) 
      await knex.into('actor_movie').insert(actors.map(aa => ({ movie_id: id, ...aa }))).transacting(trx)
    }

    if(!!genres && genres instanceof Array){
      await knex.from('genre_movie').where({ movie_id: id }).delete().transacting(trx) 
      await knex.into('genre_movie').insert(genres.map(ag => ({ movie_id: id, ...ag }))).transacting(trx)
    }

    return count > 0
  })
}
