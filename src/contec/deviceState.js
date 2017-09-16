let Config = require("./config");
let states = Config.states;

class ContecDeviceState {
  constructor(status, dimmer) {
    this.status = status;
    this.dimmer = dimmer.split(",").map(Number);
  }

  getSlotState(slotId) {
    return this.status.charAt(slotId) == states.ON;
  }

  getDimmerSlot(slotId) {
    return this.dimmer[slotId / 2];
  }
}

module.exports = ContecDeviceState;