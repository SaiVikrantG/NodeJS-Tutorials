const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
let db = null;
const dbpath = path.join(__dirname, "goodreads.db");

app.get("/books/", async (request, response) => {
  const query = `SELECT * FROM book order by book_id`;

  const bookArray = await db.all(query);
  response.send(bookArray);
});

const dbinitialize = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3003, () => {
      console.log("Server has started at port 3002");
    });
  } catch (e) {
    console.log(`ERROR: ${e.message}`);
    process.exit(1);
  }
};

dbinitialize();
