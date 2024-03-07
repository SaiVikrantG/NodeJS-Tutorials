const { open } = require("./node_modules/sqlite");
const sqlite3 = require("./node_modules/sqlite3");
let db = null;
const path = require("path");
const express = require("./node_modules/express");
const app = express();
app.use(express.json());

const init = async () => {
  try {
    db = await open({
      filename: path.join(__dirname, "todoApplication.db"),
      driver: sqlite3.Database,
    });
  } catch (e) {
    console.log(`ERROR: ${e.message}`);
    process.exit(1);
  }
};

init();

app.listen(3000, () => {
  console.log("SERVER STARTED AT PORT 3000");
});

app.get("/todos/", async (request, response) => {
  const { status, priority, search_q = "" } = request.query;
  console.log(status, priority, search_q);
  let dbQuery = "";

  if (priority === undefined && status === undefined) {
    dbQuery = `SELECT * FROM todo WHERE todo like '%${search_q}%';`;
  } else if (priority === undefined) {
    dbQuery = `SELECT * FROM todo WHERE status = '${status}' AND todo like '%${search_q}%';`;
  } else if (status === undefined) {
    dbQuery = `SELECT * FROM todo WHERE priority = '${priority}' AND todo like '%${search_q}%';`;
  } else {
    dbQuery = `SELECT * FROM todo WHERE priority = '${priority}' AND status = '${status}' AND todo like '%${search_q}%';`;
  }

  const res = await db.all(dbQuery);
  response.send(res);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  console.log(todoId);
  let dbQuery = `SELECT * FROM todo WHERE id = ${todoId};`;

  const res = await db.get(dbQuery);
  response.send(res);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const dbQuery = `INSERT INTO todo(id,todo,priority,status) VALUES (${id},'${todo}','${priority}','${status}');`;
  console.log(id, todo, priority, status);
  const res = await db.run(dbQuery);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  console.log(todoId);
  let dbQuery = ``;
  let res = "";
  const { status, priority, todo } = request.body;

  if (status !== undefined) {
    dbQuery = `UPDATE todo SET status = '${status}' WHERE id = ${todoId};`;
    res = "Status Updated";
  } else if (priority !== undefined) {
    dbQuery = `UPDATE todo SET priority = '${priority}' WHERE id = ${todoId};`;
    res = "Priority Updated";
  } else if (todo !== undefined) {
    dbQuery = `UPDATE todo SET todo = '${todo}' WHERE id = ${todoId};`;
    res = "Todo Updated";
  }

  await db.get(dbQuery);
  response.send(res);
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const query = `DELETE FROM todo WHERE id = ${todoId};`;
  await db.run(query);
  response.send("Todo Deleted");
});

module.exports = app;
