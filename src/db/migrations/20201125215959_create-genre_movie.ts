import * as Knex from 'knex'


export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(`
    CREATE TABLE genre_movie (
      genre_id        INT UNSIGNED NOT NULL,
      movie_id        INT UNSIGNED NOT NULL,
    
      CONSTRAINT PK_genre_movie__genre_id_movie_id PRIMARY KEY (genre_id, movie_id),
      CONSTRAINT FK_genre_movie__genre_id FOREIGN KEY (genre_id) REFERENCES genre(id) ON DELETE CASCADE,
      CONSTRAINT FK_genre_movie__movie_id FOREIGN KEY (movie_id) REFERENCES movie(id) ON DELETE CASCADE
    );`
  )
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.raw('DROP TABLE genre_movie;')
}

