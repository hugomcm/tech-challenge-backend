import { knex } from '../util/knex'

export interface Actor {
  id: number
  name: string,
  bio: string, 
  bornAt: Date,
  movies: MovieRole[]
}
export interface MovieRole {
  movie_id: number,
  character_name: string
}

export function list(): Promise<Actor[]> {
  return knex.from('actor').select()
}

export function find(id: number): Promise<Actor> {
  return Promise.all([
    knex.from('actor').where({ id }).first(),
    knex.from('actor_movie').where({ actor_id: id }).select('movie_id', 'character_name')
  ])
    .then(([ actor, movieRoles ]) => {
      if(!actor) throw(`No actor with id: ${id}`)
      return { ...actor, movies: movieRoles }
    })
    .catch((err) => undefined)
}

/** @returns whether the ID was actually found */
export async function remove(id: number): Promise<boolean> {
  const count = await knex.from('actor').where({ id }).delete()
  return count > 0
}

/** @returns the ID that was created */
export async function create(name: string, bio: string, bornAt: Date, movies: MovieRole[]): Promise<number> {
  return await knex.transaction(async trx => {    
    const [ id ] = await (trx.into('actor').insert({ name, bio, bornAt }));
    if(!!movies && movies instanceof Array){
      await knex.into('actor_movie').insert(movies.map(am => ({ actor_id: id, ...am }))).transacting(trx)
    }

    return id
  })
}

/** @returns whether the ID was actually found */
export async function update(id: number, name: string, bio: string, bornAt: Date, movies: MovieRole[]): Promise<boolean>  {
  return await knex.transaction(async trx => { 
    const count = await knex.from('actor').where({ id }).update({ name, bio, bornAt })

    if(!!movies && movies instanceof Array) {
      await knex.from('actor_movie').where({ actor_id: id }).delete().transacting(trx)
      await knex.into('actor_movie').insert(movies.map(am => ({ actor_id: id, ...am }))).transacting(trx)
    }

    return count > 0
  })
}