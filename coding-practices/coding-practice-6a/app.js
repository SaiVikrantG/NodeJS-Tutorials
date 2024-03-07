const express = require("./node_modules/express");
const app = express();

app.use(express.json());
let db = null;
const path = require("path");
const { open } = require("./node_modules/sqlite");
const sqlite3 = require("./node_modules/sqlite3");

const init = async () => {
  try {
    db = await open({
      filename: path.join(__dirname, "covid19India.db"),
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

app.get("/states/", async (request, response) => {
  const dbquery = `SELECT * FROM state;`;
  const dbresponse = await db.all(dbquery);

  const convert = (country) => {
    return {
      stateId: country.state_id,
      stateName: country.state_name,
      population: country.population,
    };
  };
  response.send(dbresponse.map((country) => convert(country)));
});

app.get("/districts/", async (request, response) => {
  const dbquery = `SELECT * FROM district;`;
  const dbresponse = await db.all(dbquery);

  response.send(dbresponse);
});

app.get("/states/:stateId", async (request, response) => {
  const { stateId } = request.params;
  const dbquery = `SELECT * FROM state WHERE state_id=${stateId};`;
  const dbresponse = await db.get(dbquery);

  const convert = (country) => {
    return {
      stateId: country.state_id,
      stateName: country.state_name,
      population: country.population,
    };
  };
  response.send(convert(dbresponse));
});

app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;

  const dbquery = `INSERT INTO district (district_name,state_id,cases,cured,active,deaths) VALUES ('${districtName}',${stateId},${cases},${cured},${active},${deaths});`;

  const dbres = await db.run(dbquery);
  response.send("District Successfully Added");
});

app.get("/districts/:districtId", async (request, response) => {
  const { districtId } = request.params;
  const dbquery = `SELECT * FROM district WHERE district_id=${districtId};`;
  const dbresponse = await db.get(dbquery);

  const convert = (country) => {
    return {
      districtId: country.district_id,
      districtName: country.district_name,
      stateId: country.state_id,
      cases: country.cases,
      cured: country.cured,
      active: country.active,
      deaths: country.deaths,
    };
  };
  response.send(convert(dbresponse));
});

app.delete("/districts/:districtId", async (request, response) => {
  const { districtId } = request.params;
  const dbquery = `DELETE FROM district WHERE district_id=${districtId};`;
  const dbresponse = await db.run(dbquery);

  response.send("District Removed");
});

app.put("/districts/:districtId", async (request, response) => {
  const { districtId } = request.params;
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const dbquery = `UPDATE district SET district_name='${districtName}', state_id = ${stateId}, cases = ${cases}, cured = ${cured}, active = ${active}, deaths = ${deaths} WHERE district_id=${districtId};`;
  const dbresponse = await db.run(dbquery);

  response.send("District Details Updated");
});

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const dbquery = `SELECT cases,cured,active,deaths FROM district WHERE district.state_id=${stateId};`;
  const dbresponse = await db.get(dbquery);

  const convert = (country) => {
    return {
      totalCases: country.cases,
      totalCured: country.cured,
      totalActive: country.active,
      totalDeaths: country.deaths,
    };
  };
  response.send(convert(dbresponse));
});

app.get("/districts/:districtId/details", async (request, response) => {
  const { districtId } = request.params;
  const dbquery = `SELECT state_name FROM state WHERE state.state_id = (SELECT state_id FROM district WHERE district_id=${districtId});`;
  const dbresponse = await db.get(dbquery);

  const convert = (country) => {
    return {
      stateName: country.state_name,
    };
  };
  response.send(convert(dbresponse));
});

module.exports = app;
