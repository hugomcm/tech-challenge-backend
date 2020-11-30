import { knex } from '../util/knex'

export interface Movie {
  id: number
  name: string,
  synopsis: string, 
  releasedAt: Date, 
  runtime: number
  actors: MovieActor[],
  genres: number[]
}

export interface MovieActor {
  actor_id: number,
  character_name: string
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
      return { ...movie, actors: movieActors, genres: movieGenres.map(({ genre_id }) => genre_id) }
    })
    .catch((err) => undefined)
}

/** @returns whether the ID was actually found */
export async function remove(id: number): Promise<boolean> {
  const count = await knex.from('movie').where({ id }).delete()
  return count > 0
}

/** @returns the ID that was created */
export async function create(name: string, synopsis: string, releasedAt: Date, runtime: number, actors: MovieActor[], genres: number[]): Promise<number> {
  return await knex.transaction(async trx => {    
    const [ id ] = await (trx.into('movie').insert({ name, synopsis, releasedAt, runtime }))
    if(!!actors && actors instanceof Array){
      await knex.into('actor_movie').insert(actors.map(aa => ({ movie_id: id, ...aa }))).transacting(trx)
    }
    if(!!genres && genres instanceof Array){
      await knex.into('genre_movie').insert(genres.map(genre_id => ({ movie_id: id, genre_id }))).transacting(trx)
    }

    return id
  })
}

/** @returns whether the ID was actually found */
export async function update(id: number, name: string, synopsis: string, releasedAt: Date, runtime: number, actors: MovieActor[], genres: number[]): Promise<boolean>  {
  return await knex.transaction(async trx => { 
    const count = await knex.from('movie').where({ id }).update({ name, synopsis, releasedAt, runtime })

    if(!!actors && actors instanceof Array) {
      await knex.from('actor_movie').where({ movie_id: id }).delete().transacting(trx) 
      await knex.into('actor_movie').insert(actors.map(aa => ({ movie_id: id, ...aa }))).transacting(trx)
    }

    if(!!genres && genres instanceof Array){
      await knex.from('genre_movie').where({ movie_id: id }).delete().transacting(trx) 
      await knex.into('genre_movie').insert(genres.map(genre_id => ({ movie_id: id, genre_id }))).transacting(trx)
    }

    return count > 0
  })
}
