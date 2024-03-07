const express = require("./node_modules/express");

const app = express();

app.get("/", (request, response) => {
  response.send("Express JS");
});

app.listen(3000);

module.exports = app;
