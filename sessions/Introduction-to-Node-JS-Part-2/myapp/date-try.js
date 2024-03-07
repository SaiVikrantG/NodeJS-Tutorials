const date = require("./node_modules/date-fns/addDays");

const newdate = date(new Date(2020, 01, 03), 5);

console.log(newdate);
