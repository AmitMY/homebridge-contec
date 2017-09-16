const states = {ON: "o", OFF: "n"};
const blindsStates = (value) => {
  if (value == "stop")
    return "1";

  let hex = (Number(value)).toString(16).toUpperCase();
  if (hex.length == 1)
    hex = "0" + hex;
  return "%" + hex;
};

let globals = {};

let currentStates = {};
let lastStates = {};

module.exports = {states, blindsStates, globals, currentStates, lastStates};