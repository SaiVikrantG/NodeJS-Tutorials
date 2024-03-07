const add = (a, b) => a + b;
const subtract = (a, b) => a - b;
//module.exports = [add, subtract];
const cd = 5;

module.exports.add = add;
module.exports.sub = subtract;
module.exports.constant = cd;
