const express = require("../node_modules/express");

const app = express();

app.get("/", (request, response) => {
  response.send("Hello world");
});

app.get("/date", (request, response) => {
  const date = new Date();
  response.sendFile("./page.html", { root: __dirname });
});

app.listen(3000);
