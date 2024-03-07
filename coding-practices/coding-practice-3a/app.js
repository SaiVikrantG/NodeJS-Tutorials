const express = require("./node_modules/express");
const addDays = require("./node_modules/date-fns/addDays");
const app = express();

app.get("/", (request, response) => {
  let date = addDays(new Date(), 100);
  response.send(
    `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
  );
});

app.listen(3000);

module.exports = app;
