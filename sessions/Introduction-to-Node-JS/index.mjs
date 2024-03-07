import { add, subtract as sub, cd as constant } from "./calculator.mjs";

const greetings = (name) => {
  console.log(`Hello ${name}`);
};

greetings("Raju");
greetings("Abhi");

console.log(add(2, 3));
console.log(sub(3, 2));
console.log(constant);
