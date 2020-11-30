import * as Knex from 'knex'

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('genre').del()
  await knex('movie').del()
  await knex('actor').del()
  await knex('actor_movie').del()
  await knex('genre_movie').del()
  
  await knex.raw('ALTER TABLE genre AUTO_INCREMENT = 1')
  await knex.raw('ALTER TABLE movie AUTO_INCREMENT = 1')
  await knex.raw('ALTER TABLE actor AUTO_INCREMENT = 1')
}
