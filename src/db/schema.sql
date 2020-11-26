DROP TABLE IF EXISTS genre_movie;
DROP TABLE IF EXISTS actor_movie;
DROP TABLE IF EXISTS actor;
DROP TABLE IF EXISTS movie;
DROP TABLE IF EXISTS genre;

CREATE TABLE genre (
	id    INT UNSIGNED NOT NULL AUTO_INCREMENT,
	name  VARCHAR(50),

	CONSTRAINT PK_genre__id PRIMARY KEY (id),
	CONSTRAINT UK_genre__name UNIQUE KEY (name)
);

CREATE TABLE movie (
	id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
	name        VARCHAR(100) NOT NULL,
	synopsis    TEXT DEFAULT NULL,
	releasedAt  DATE NOT NULL,
	runtime     TINYINT NOT NULL,

	CONSTRAINT PK_movie__id PRIMARY KEY (id),
	CONSTRAINT UK_movie__name UNIQUE KEY (name)
);

CREATE TABLE actor (
	id      INT UNSIGNED NOT NULL AUTO_INCREMENT,
	name    VARCHAR(50) NOT NULL,
	bio     TEXT NOT NULL,
	bornAt  DATE NOT NULL,

	CONSTRAINT PK_actor__id PRIMARY KEY (id),
	CONSTRAINT UK_actor__name UNIQUE KEY (name)
);


CREATE TABLE actor_movie (
	actor_id        INT UNSIGNED NOT NULL,
	movie_id        INT UNSIGNED NOT NULL,
	character_name  VARCHAR(50) NOT NULL,

	CONSTRAINT PK_actor_movie__actor_id_movie_id PRIMARY KEY (actor_id, movie_id),
	CONSTRAINT FK_actor_movie__actor_id FOREIGN KEY (actor_id) REFERENCES actor(id) ON DELETE CASCADE,
	CONSTRAINT FK_actor_movie__movie_id FOREIGN KEY (movie_id) REFERENCES movie(id) ON DELETE CASCADE
);

CREATE TABLE genre_movie (
	genre_id        INT UNSIGNED NOT NULL,
	movie_id        INT UNSIGNED NOT NULL,

	CONSTRAINT PK_genre_movie__genre_id_movie_id PRIMARY KEY (genre_id, movie_id),
	CONSTRAINT FK_genre_movie__genre_id FOREIGN KEY (genre_id) REFERENCES genre(id) ON DELETE CASCADE,
	CONSTRAINT FK_genre_movie__movie_id FOREIGN KEY (movie_id) REFERENCES movie(id) ON DELETE CASCADE
);