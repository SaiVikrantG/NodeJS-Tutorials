const express = require("./node_modules/express/");
const { open } = require("./node_modules/sqlite");
const sqlite3 = require("./node_modules/sqlite3");
const path = require("path");
let db = null;
const dbPath = path.join(__dirname, "moviesData.db");

app = express();
app.use(express.json());

let dbinit = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
  } catch (e) {
    console.log(`ERROR:${e.message}`);
    process.exit(1);
  }
};

app.listen(3000, function () {
  console.log("Web server started at port 3000");
});

app.get("/movies/", async (request, response) => {
  const dbQuery = `SELECT movie_name from movie;`;

  const movieArray = await db.all(dbQuery);
  const convert = (movie) => {
    return { movieName: movie.movie_name };
  };

  response.send(movieArray.map((movie) => convert(movie)));
});

app.get("/movie/", async (request, response) => {
  const dbQuery = `SELECT * from movie;`;

  const movieArray = await db.all(dbQuery);

  response.send(movieArray);
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const dbquery = `INSERT INTO movie(director_id,movie_name,lead_actor) VALUES (${directorId},'${movieName}','${leadActor}');`;

  await db.run(dbquery);

  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const dbQuery = `SELECT * FROM movie WHERE movie_id = ${movieId};`;

  const movieArray = await db.get(dbQuery);
  const convert = (movie) => {
    return {
      movieId: movie.movie_id,
      directorId: movie.director_id,
      movieName: movie.movie_name,
      leadActor: movie.lead_actor,
    };
  };

  response.send(convert(movieArray));
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const dbQuery = `UPDATE movie SET director_id = ${directorId}, movie_name = '${movieName}', lead_actor = '${leadActor}' WHERE movie_id = ${movieId};`;

  const res = await db.run(dbQuery);

  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const dbQuery = `DELETE FROM movie WHERE movie_id = ${movieId};`;
  await db.run(dbQuery);

  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const dbQuery = `SELECT * from director;`;

  const movieArray = await db.all(dbQuery);
  const convert = (director) => {
    return {
      directorId: director.director_id,
      directorName: director.director_name,
    };
  };

  response.send(movieArray.map((movie) => convert(movie)));
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const dbQuery = `select movie_name from movie where movie.director_id = ${directorId};`;
  const movieArray = await db.all(dbQuery);
  const convert = (movie) => {
    return { movieName: movie.movie_name };
  };

  response.send(movieArray.map((movie) => convert(movie)));
});

dbinit();

module.exports = app;
