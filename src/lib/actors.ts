import { knex } from '../util/knex'

import * as movies from './movies';

export interface Actor {
  id: number
  name: string,
  bio: string, 
  bornAt: Date,
  movies: ActorMovie[]
}
export interface ActorMovie {
  movie_id: number,
  character_name: string
}
export interface NrMoviesByGenre {
  id: number,
  name: string,
  moviesQnt: number
}

export function list(): Promise<Actor[]> {
  return knex.from('actor').select()
}

export function find(id: number): Promise<Actor> {
  return Promise.all([
    knex.from('actor').where({ id }).first(),
    knex.from('actor_movie').where({ actor_id: id }).select('movie_id', 'character_name')
  ])
    .then(([ actor, actorMovies ]) => {
      return (!actor)? actor: { ...actor, movies: actorMovies };
    })
}

/** @returns whether the ID was actually found */
export async function remove(id: number): Promise<boolean> {
  const count = await knex.from('actor').where({ id }).delete()
  return count > 0
}

/** @returns the ID that was created */
export async function create(name: string, bio: string, bornAt: Date, actorMovies: ActorMovie[]): Promise<number> {
  return await knex.transaction(async trx => {    
    const [ id ] = await trx.into('actor').insert({ name, bio, bornAt });
    if(!!actorMovies && actorMovies instanceof Array){
      await trx.into('actor_movie').insert(actorMovies.map(am => ({ actor_id: id, ...am })))
    }

    return id
  })
}

/** @returns whether the ID was actually found */
export async function update(id: number, name: string, bio: string, bornAt: Date, actorMovies: ActorMovie[]): Promise<boolean>  {
  // check if actor exists
  const actor = await knex.from('actor').where({ id }).first()
  if(!actor) return actor;

  return await knex.transaction(async trx => { 
    const count = await knex.from('actor').where({ id }).update({ name, bio, bornAt })

    if(!!actorMovies && actorMovies instanceof Array) {
      await trx.from('actor_movie').where({ actor_id: id }).delete()
      await trx.into('actor_movie').insert(actorMovies.map(am => ({ actor_id: id, ...am })))
    }

    return count > 0
  })
}

// MG-0004 View Actor's movie appearances
export async function listMovies(id: number): Promise<movies.Movie[]> {
  // check if actor exists
  const actor = await knex.from('actor').where({ id }).first()
  if(!actor) return actor;

  const actorMovies = await knex.from('actor_movie').where({ actor_id: id }).select()
  const movieIds: number[] = actorMovies.map(({ movie_id }) => movie_id)
  return await movies.listByIds(movieIds);
}

// MG-0005 View Actor's number of Movies in Genres | As a user, I want to get the number of movies by genre on an actor profile page.
export async function countNrMoviesByGenre(id: number): Promise<NrMoviesByGenre[]> {
  // check if actor exists
  const actor = await knex.from('actor').where({ id }).first()
  if(!actor) return actor;
  
  const query = `
    SELECT g.id, g.name, nmbg.moviesQnt FROM 
      (SELECT gm.genre_id, count(am.movie_id) moviesQnt
      FROM movies.actor_movie am 
      INNER JOIN movies.genre_movie gm ON am.movie_id = gm.movie_id 
      WHERE am.actor_id = :id 
      GROUP BY gm.genre_id) nmbg
    INNER JOIN movies.genre g ON g.id = nmbg.genre_id
  `
  const [ nrMoviesByGenre ] = await knex.raw(query, { id })
  return nrMoviesByGenre
}