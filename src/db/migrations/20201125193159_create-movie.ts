import * as Knex from 'knex'


export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(`
    CREATE TABLE movie (
      id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
      name        VARCHAR(100) NOT NULL,
      synopsis    TEXT DEFAULT NULL,
      releasedAt  DATE NOT NULL,
      runtime     TINYINT NOT NULL,
    
      CONSTRAINT PK_movie__id PRIMARY KEY (id),
      CONSTRAINT UK_movie__name UNIQUE KEY (name)
    );`)
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.raw('DROP TABLE movie;')
}

