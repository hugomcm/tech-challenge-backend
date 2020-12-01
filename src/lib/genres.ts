import { knex } from '../util/knex'

export interface Genre {
  id: number
  name: string,
  movies?: number[]
}

export function list(): Promise<Genre[]> {
  return knex.from('genre').select()
}

export function find(id: number): Promise<Genre> {
  return Promise.all([
    knex.from('genre').where({ id }).first(),
    knex.from('genre_movie').where({ genre_id: id }).select('movie_id')
  ])
    .then(([ genre, genreMovies ]) => {
      return (!genre)? genre: { ...genre, movies: genreMovies.map(({ movie_id }) => movie_id) }
    })
}

/** @returns whether the ID was actually found */
export async function remove(id: number): Promise<boolean> {
  const count = await knex.from('genre').where({ id }).delete()
  return count > 0
}

/** @returns the ID that was created */
export async function create(name: string, movies?: number[]): Promise<number> {
  return await knex.transaction(async trx => {    
    const [ id ] = await (trx.into('genre').insert({ name }));
    if(!!movies && movies instanceof Array){
      await trx.into('genre_movie').insert(movies.map(movie_id => ({ genre_id: id, movie_id })))
    }

    return id
  })

}

/** @returns whether the ID was actually found */
export async function update(id: number, name: string, movies?: number[]): Promise<boolean>  {
  // check if genre exists
  const genre = await knex.from('genre').where({ id }).first()
  if(!genre) return genre;

  return await knex.transaction(async trx => { 
    const count = await knex.from('genre').where({ id }).update({ name })

    if(!!movies && movies instanceof Array) {
      await trx.from('genre_movie').where({ genre_id: id }).delete()
      await trx.into('genre_movie').insert(movies.map(movie_id => ({ genre_id: id, movie_id })))
    }

    return count > 0
  })
}
