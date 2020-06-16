let Config = require("./config");
let states = Config.states;
let blindsStates = Config.blindsStates;
let globals = Config.globals;
let {http} = require("../http");

/*** Prorotypes START ***/
String.prototype.replaceAt = function (index, character) {
  return this.substr(0, index) + character + this.substr(index + 1);
};

/*** Prorotypes END ***/

class ContecDevice {
  constructor(cardId, slotId, name, service) {
    this.cardId = Number(cardId);
    this.slotId = Number(slotId);
    this.name = name;
    // Service name
    this.service = service;

    this.accessory = null;
  }

  createAccessory() {
    let uuid = globals.UUIDGen.generate(this.cardId + "-" + this.slotId);
    return new (globals.Accessory)(this.name, uuid);
  }

  getValue() {
    let state = Config.currentStates[this.cardId];
    if (state === undefined)
      return undefined;

    switch (this.service) {
      case "Lightbulb":
      case "Fan":
      case "Outlet":
      case "Switch":
        return state.getSlotState(this.slotId);
      case "WindowCovering":
        return state.getDimmerSlot(this.slotId);
      default:
        throw new Error("Unknown service type " + this.service);
    }
  }

  updateState() {
    if (this.accessory === null)
      return;

    let service = this.accessory.getService(globals.Service[this.service]);
    if (!service)
      return;

    let value = this.getValue();
    if (value === undefined)
      return;

    let characteristic = "On";
    if (this.service == "WindowCovering")
      characteristic = "CurrentPosition";

    service.getCharacteristic(globals.Characteristic[characteristic]).updateValue(value);
  }

  getState(callback) {
    const value = this.getValue();

    if (value !== undefined)
      callback(null, value);
    else
      callback("No state found", null)
  }

  setState(letter, callback) {
    let url = "state.php?cardId=" + this.cardId + "&output=";
    url += "mmmmmmmmmmmmmmmm".replaceAt(this.slotId, letter);

    http(url).then(() => callback(null), (error) => callback(error));
  }

  addServices(accessory) {
    if (!accessory.getService(globals.Service.AccessoryInformation))
      accessory.addService(new (globals.Service).AccessoryInformation());

    this.informationService = accessory.getService(globals.Service.AccessoryInformation);

    this.informationService
      .setCharacteristic(globals.Characteristic.Manufacturer, "Contec")
      .setCharacteristic(globals.Characteristic.Model, this.name)
      .setCharacteristic(globals.Characteristic.SerialNumber, "NA");
  }
}

class CSwitch extends ContecDevice {
  constructor(cardId, slotId, name, service = "Switch") {
    super(cardId, slotId, name, service);
  }

  setState(value, callback) {
    super.setState(value ? states.ON : states.OFF, callback);
  }

  addServices(accessory) {
    super.addServices(accessory);

    if (!accessory.getService(globals.Service[this.service]))
      accessory.addService(new (globals.Service)[this.service](this.name));

    let service = accessory.getService(globals.Service[this.service]);

    service.getCharacteristic(globals.Characteristic.On)
      .on("get", this.getState.bind(this))
      .on("set", this.setState.bind(this));
  }
}

class CLight extends CSwitch {
  constructor(cardId, slotId, name) {
    super(cardId, slotId, name, "Lightbulb")
  }
}

class CFan extends CSwitch {
  constructor(cardId, slotId, name) {
    super(cardId, slotId, name, "Fan")
  }
}

class COutlet extends CSwitch {
  constructor(cardId, slotId, name) {
    super(cardId, slotId, name, "Outlet")
  }
}

class CBoiler extends CSwitch {
}


class CBlinds extends ContecDevice {
  constructor(cardId, slotId, name) {
    super(cardId, slotId, name, "WindowCovering")
  }

  setState(value, callback) {
    super.setState(blindsStates(value), callback);
  }

  addServices(accessory) {
    super.addServices(accessory);

    if (!accessory.getService(globals.Service.WindowCovering))
      accessory.addService(new (globals.Service).WindowCovering(this.name));

    let service = accessory.getService(globals.Service.WindowCovering);

    service.getCharacteristic(globals.Characteristic.CurrentPosition)
      .on("get", this.getState.bind(this));

    service.getCharacteristic(globals.Characteristic.TargetPosition)
      .on("set", this.setState.bind(this));
  }
}

// TODO outlet

module.exports = {CLight, CFan, CBlinds, ContecDevice, COutlet, CBoiler};
