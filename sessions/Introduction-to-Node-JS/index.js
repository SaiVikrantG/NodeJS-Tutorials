const greetings = (name) => {
  console.log(`Hello ${name}`);
};

greetings("Raju");
greetings("Abhi");

const { add, sub, constant } = require("./calculator.js");

console.log(add(2, 3));
console.log(sub(3, 2));
console.log(constant);
//console.log(require("./calculator.js"));
