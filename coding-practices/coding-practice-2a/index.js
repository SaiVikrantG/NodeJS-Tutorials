const addDays = require("./node_modules/date-fns/addDays");

const dateadd = function (days) {
  let date = addDays(new Date(2020, 7, 22), days);

  return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
};

module.exports = dateadd;
