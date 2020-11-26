import * as Knex from 'knex'


export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(`
    CREATE TABLE actor_movie (
      actor_id        INT UNSIGNED NOT NULL,
      movie_id        INT UNSIGNED NOT NULL,
      character_name  VARCHAR(50) NOT NULL,
    
      CONSTRAINT PK_actor_movie__actor_id_movie_id PRIMARY KEY (actor_id, movie_id),
      CONSTRAINT FK_actor_movie__actor_id FOREIGN KEY (actor_id) REFERENCES actor(id) ON DELETE CASCADE,
      CONSTRAINT FK_actor_movie__movie_id FOREIGN KEY (movie_id) REFERENCES movie(id) ON DELETE CASCADE
    );`)
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.raw('DROP TABLE actor_movie;')
}

