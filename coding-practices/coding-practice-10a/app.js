const { open } = require("./node_modules/sqlite");
const sqlite3 = require("./node_modules/sqlite3");
const path = require("path");
const express = require("./node_modules/express");
let db = null;
const app = express();
app.use(express.json());
const bcrypt = require("./node_modules/bcrypt");
const jwt = require("./node_modules/jsonwebtoken");

module.exports = app;

const init = async () => {
  try {
    db = await open({
      filename: path.join(__dirname, "covid19IndiaPortal.db"),
      driver: sqlite3.Database,
    });
  } catch (e) {
    console.log(`ERROR:${e.message}`);
    process.exit(1);
  }
};

init();

app.listen(3010, () => {
  console.log("SERVER HAS STARTED AT PORT 3010");
});

app.post("/login/", async (request, response) => {
  const { username, password } = request.body;

  const dbQuery = `SELECT * FROM user WHERE username = '${username}';`;
  const res = await db.get(dbQuery);

  if (res === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const Compare = await bcrypt.compare(password, res.password);
    if (Compare === false) {
      response.status(400);
      response.send("Invalid password");
    } else {
      const payload = { username: username };
      const jwtToken = jwt.sign(payload, "SecretKey");
      response.send({ jwtToken });
      console.log({ jwtToken });
    }
  }
});

const authenticateToken = (request, response, next) => {
  let authHeader = request.headers["authorization"];
  let jwToken = undefined;
  if (authHeader !== undefined) {
    jwToken = authHeader.split(" ")[1];
  }
  console.log(jwToken);

  if (jwToken === undefined) {
    response.status(401);
    response.send("Invalid JWT Token");
    console.log(2);
  } else {
    jwt.verify(jwToken, "SecretKey", async (error, payload) => {
      if (error) {
        response.status(401);
        response.send("Invalid JWT Token");
      } else {
        console.log(3);
        next();
      }
    });
  }
};

app.get("/states/", authenticateToken, async (request, response) => {
  const dbQuery = "SELECT * FROM state;";
  const res = await db.all(dbQuery);

  const convert = (object) => ({
    stateId: object.state_id,
    stateName: object.state_name,
    population: object.population,
  });

  const respo = res.map(convert);
  response.send(respo);
  console.log(respo);
});

app.get("/states/:stateId/", authenticateToken, async (request, response) => {
  const { stateId } = request.params;
  const query = `SELECT * FROM state WHERE state_id = ${stateId};`;

  const res = await db.get(query);
  const convert = (object) => ({
    stateId: object.state_id,
    stateName: object.state_name,
    population: object.population,
  });

  response.send(convert(res));
  console.log(convert(res));
});

app.post("/districts/", authenticateToken, async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const dbQuery = `INSERT INTO district(district_name,state_id,cases,cured,active,deaths) VALUES('${districtName}',${stateId},${cases},${cured},${active},${deaths});`;

  await db.run(dbQuery);

  response.send("District Successfully Added");
  console.log("check");
});

app.get(
  "/districts/:districtId/",
  authenticateToken,
  async (request, response) => {
    const { districtId } = request.params;
    const query = `SELECT * FROM district WHERE district_id = ${districtId};`;

    const res = await db.get(query);
    const convert = (object) => ({
      districtId: object.district_id,
      districtName: object.district_name,
      stateId: object.state_id,
      cases: object.cases,
      cured: object.cured,
      active: object.active,
      deaths: object.deaths,
    });

    response.send(convert(res));
    console.log(convert(res));
  }
);

app.delete(
  "/districts/:districtId/",
  authenticateToken,
  async (request, response) => {
    const { districtId } = request.params;
    const query = `DELETE FROM district WHERE district_id = ${districtId};`;

    const res = await db.get(query);

    response.send("District Removed");
  }
);

app.put(
  "/districts/:districtId/",
  authenticateToken,
  async (request, response) => {
    const { districtId } = request.params;
    const {
      districtName,
      stateId,
      cases,
      cured,
      active,
      deaths,
    } = request.body;
    const query = `UPDATE district SET district_name = '${districtName}',
     state_id = ${stateId},cases = ${cases}, cured=${cured},active=${active},deaths = ${deaths} WHERE district_id = ${districtId};`;

    await db.get(query);

    response.send("District Details Updated");
  }
);

app.get(
  "/states/:stateId/stats",
  authenticateToken,
  async (request, response) => {
    const { stateId } = request.params;
    const query = `SELECT SUM(cases) as totalCases, SUM(cured) as totalCured, SUM(active) as totalActive, SUM(deaths) as totalDeaths FROM district WHERE state_id = ${stateId};`;

    const res = await db.get(query);
    const convert = (object) => ({
      totalCases: object.totalCases,
      totalCured: object.totalCured,
      totalActive: object.totalActive,
      totalDeaths: object.totalDeaths,
    });

    response.send(convert(res));
    console.log(convert(res));
  }
);
