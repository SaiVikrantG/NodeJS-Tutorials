const express = require("./node_modules/express");
const app = express();
const path = require("path");
let db = null;

app.use(express.json());

const { open } = require("./node_modules/sqlite");
const sqlite3 = require("./node_modules/sqlite3");

const init = async () => {
  try {
    db = await open({
      filename: path.join(__dirname, "cricketMatchDetails.db"),
      driver: sqlite3.Database,
    });
  } catch (e) {
    console.log(`ERROR:${e.message}`);
    process.exit(1);
  }
};

init();

app.listen(3000, () => {
  console.log("SERVER HAS STARTED AT PORT 3000");
});

app.get("/players/", async (request, response) => {
  const dbQuery = "SELECT * FROM player_details;";
  const res = await db.all(dbQuery);

  const convert = (object) => {
    return {
      playerId: object.player_id,
      playerName: object.player_name,
    };
  };

  response.send(res.map((object) => convert(object)));
});

app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const dbQuery = `SELECT * FROM player_details WHERE player_id = ${playerId};`;
  const res = await db.get(dbQuery);

  const convert = (object) => {
    return {
      playerId: object.player_id,
      playerName: object.player_name,
    };
  };

  response.send(convert(res));
});

app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const dbQuery = `UPDATE player_details SET player_name = '${playerName}' WHERE player_id = ${playerId};`;
  res = await db.run(dbQuery);

  response.send("Player Details Updated");
});

app.get("/matches/:matchId", async (request, response) => {
  const { matchId } = request.params;
  const dbQuery = `SELECT * FROM match_details WHERE match_id = ${matchId};`;
  const res = await db.get(dbQuery);

  const convert = (object) => {
    return {
      matchId: object.match_id,
      match: object.match,
      year: object.year,
    };
  };

  response.send(convert(res));
});

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const dbQuery = `SELECT * FROM match_details WHERE match_details.match_id in (SELECT match_id from player_match_score WHERE player_id = ${playerId});`;
  const res = await db.all(dbQuery);

  const convert = (object) => {
    return {
      matchId: object.match_id,
      match: object.match,
      year: object.year,
    };
  };

  response.send(res.map((res) => convert(res)));
});

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const dbQuery = `SELECT
	      player_details.player_id AS playerId,
	      player_details.player_name AS playerName
	    FROM player_match_score NATURAL JOIN player_details
        WHERE match_id=${matchId};`;
  const res = await db.all(dbQuery);

  const convert = (object) => {
    return {
      playerId: object.player_id,
      playerName: object.player_name,
    };
  };

  response.send(res);
});

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const dbQuery = `SELECT player_details.player_id as playerId, player_details.player_name as playerName,SUM(player_match_score.score) as totalScore,SUM(player_match_score.fours) as totalFours, SUM(player_match_score.sixes) as totalSixes FROM 
  player_details INNER JOIN player_match_score ON player_details.player_id = player_match_score.player_id WHERE player_details.player_id = ${playerId};`;
  const res = await db.all(dbQuery);

  response.send(res);
});

module.exports = app;
