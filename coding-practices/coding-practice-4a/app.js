const { open } = require("./node_modules/sqlite");
const sqlite3 = require("./node_modules/sqlite3");
const express = require("./node_modules/express");
const path = require("path");
const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initializeDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Web server has started at port 3000");
    });
  } catch (e) {
    console.log(`ERROR: ${e.message}`);
    process.exit(1);
  }
};

initializeDb();

app.get("/players/", async (request, response) => {
  const dbQuery = "SELECT * FROM cricket_team;";
  const bookArray = await db.all(dbQuery);

  const convert = function (object) {
    return {
      playerId: object.player_id,
      playerName: object.player_name,
      jerseyNumber: object.jersey_number,
      role: object.role,
    };
  };

  response.send(bookArray.map((object) => convert(object)));
});

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const dbQuery = `INSERT INTO cricket_team (player_name,jersey_number,role) VALUES('${playerName}',${jerseyNumber},'${role}');`;
  const dbres = await db.run(dbQuery);
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const dbQuery = `SELECT * FROM cricket_team WHERE player_id = ${playerId};`;

  const dbresponse = await db.get(dbQuery);

  const convert = function (object) {
    return {
      playerId: object.player_id,
      playerName: object.player_name,
      jerseyNumber: object.jersey_number,
      role: object.role,
    };
  };
  const [res] = [dbresponse].map((object) => convert(object));
  response.send(res);
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const dbQuery = `UPDATE cricket_team SET player_name='${playerName}',jersey_number=${jerseyNumber},role='${role}' WHERE player_id = ${playerId};`;

  await db.run(dbQuery);

  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const dbQuery = `DELETE FROM cricket_team WHERE player_id = ${playerId};`;

  await db.run(dbQuery);
  response.send("Player Removed");
});

module.exports = app;
