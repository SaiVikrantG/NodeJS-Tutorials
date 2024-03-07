const { open } = require("./node_modules/sqlite");
const sqlite3 = require("./node_modules/sqlite3");
const path = require("path");
const express = require("./node_modules/express");
const bcrypt = require("./node_modules/bcrypt");
const app = express();
app.use(express.json());
let db = null;

const init = async (request, response) => {
  try {
    db = await open({
      filename: path.join(__dirname, "userData.db"),
      driver: sqlite3.Database,
    });
  } catch (e) {
    console.log(`ERROR: ${e.message}`);
    process.exit(1);
  }
};

init();

app.listen(3000, () => {
  console.log("SERVER HAS STARTED AT PORT 3000");
});

app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const dbquery = `SELECT * FROM user WHERE username = '${username}';`;

  const res = await db.get(dbquery);

  if (res === undefined) {
    if (password.length < 5) {
      response.status(400).send("Password is too short");
    } else {
      const encrypted = await bcrypt.hash(password, 10);
      const dbQuery = `INSERT INTO user(username,name,password,gender,location) VALUES ('${username}','${name}','${encrypted}','${gender}','${location}');`;
      await db.run(dbQuery);

      response.status(200).send("User created successfully");
    }
  } else {
    response.status(400).send("User already exists");
    console.log("exists");
  }
});

app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const dbquery = `SELECT * FROM user WHERE username = '${username}';`;

  const res = await db.get(dbquery);

  if (res !== undefined) {
    const correct = await bcrypt.compare(password, res.password);
    if (correct === true) {
      response.status(200).send("Login success!");
    } else {
      response.status(400).send("Invalid password");
    }
  } else {
    response.status(400).send("Invalid user");
  }
});

app.put("/change-password", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;
  const dbquery = `SELECT * FROM user WHERE username = '${username}';`;

  const res = await db.get(dbquery);
  const oldT = await bcrypt.compare(oldPassword, res.password);

  if (oldT === true) {
    if (newPassword.length < 5) {
      response.status(400).send("Password is too short");
    } else {
      const newEnc = await bcrypt.hash(newPassword, 10);
      const query = `UPDATE user SET password = '${newEnc}' where username = '${username}';`;
      await db.run(query);

      response.status(200).send("Password updated");
    }
  } else {
    response.status(400).send("Invalid current password");
  }
});

module.exports = app;
