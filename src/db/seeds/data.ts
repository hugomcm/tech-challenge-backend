import * as Knex from 'knex'

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('genre').del()
  await knex('movie').del()
  await knex('actor').del()
  await knex('actor_movie').del()
  await knex('genre_movie').del()

  
  // id    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  // name  VARCHAR(50),
  await knex('genre').insert([
    { id: 1, name: 'Action' },
    { id: 2, name: 'Adventure' },
    { id: 3, name: 'Comedy' },
    { id: 4, name: 'Crime' },
    { id: 5, name: 'Drama' },
    { id: 6, name: 'Sci-Fi' },
    { id: 7, name: 'Fantasy' },
    { id: 8, name: 'Thriller' },
    { id: 9, name: 'Horror' },
    { id: 10, name: 'Romance' }
  ])

  // id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  // name        VARCHAR(100) NOT NULL,
  // synopsis    TEXT DEFAULT NULL,
  // releasedAt  DATE NOT NULL,
  // runtime     SMALLINT NOT NULL,
  await knex('movie').insert([
    { id: 1, name: 'Transporter', synopsis: null, releasedAt: '2002-11-10', runtime: 92 },
    { id: 2, name: 'The Italian Job', synopsis: null, releasedAt: '2003-05-30', runtime: 111 },
    { id: 3, name: 'Mad Max: Fury Road', synopsis: null, releasedAt: '2015-05-15', runtime: 120 }
  ])

  // id      INT UNSIGNED NOT NULL AUTO_INCREMENT,
  // name    VARCHAR(50) NOT NULL,
  // bio     TEXT NOT NULL,
  // bornAt  DATE NOT NULL,
  await knex('actor').insert([
    { id: 1, name: 'Jason Statham', bio: '*** Bio description goes here ***', bornAt: '1967-07-26' },
    { id: 2, name: 'Mark Wahlberg', bio: '*** Bio description goes here ***', bornAt: '1971-06-05' },
    { id: 3, name: 'Charlize Theron', bio: '*** Bio description goes here ***', bornAt: '1975-08-07' }
  ])

  // actor_id        INT UNSIGNED NOT NULL,
  // movie_id        INT UNSIGNED NOT NULL,
  // character_name  VARCHAR(50) NOT NULL,
  await knex('actor_movie').insert([
    { actor_id: 1, movie_id: 1, character_name: 'Frank Martin' },
    { actor_id: 1, movie_id: 2, character_name: 'Handsome Rob' },
    { actor_id: 2, movie_id: 2, character_name: 'Charlie Croker' },
    { actor_id: 3, movie_id: 2, character_name: 'Stella Bridger' },
    { actor_id: 3, movie_id: 3, character_name: 'Imperator Furiosa' }
  ])

  // genre_id        INT UNSIGNED NOT NULL,
  // movie_id        INT UNSIGNED NOT NULL,
  await knex('genre_movie').insert([
    { movie_id: 1, genre_id: 1 },
    { movie_id: 1, genre_id: 4 },
    { movie_id: 1, genre_id: 8 },

    { movie_id: 2, genre_id: 1 },
    { movie_id: 2, genre_id: 4 },
    { movie_id: 2, genre_id: 8 },

    { movie_id: 3, genre_id: 1 },
    { movie_id: 3, genre_id: 2 },
    { movie_id: 3, genre_id: 6 }
  ])
}
