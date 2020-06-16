let { http, setServerData } = require("../http");
let Device = require("./device");
let CLight = Device.CLight;
let CBlinds = Device.CBlinds;
let CFan = Device.CFan;
let COutlet = Device.COutlet;
let CBoiler = Device.CBoiler;
let ContecDeviceState = require("./deviceState");
let Config = require("./config");

//const allowedTypes = ["Lamp", "Blinds", "Air conditioner", "Tap", "Boiler"];

class ContecManager {
  constructor(config) {
    this.devices = [];
    setServerData(config.url, config.port);
    this.allowedTypes = config.types;
  }

  _parseDevices(string) {
    let devices = string.split(",").map(device => device.split(":"));

    devices = devices.filter(device => device.length == 5 && Number(device[0]) != 255); //255 is not a real card

    let types = {};
    devices.forEach(d => types[d[3]] ? types[d[3]]++ : types[d[3]] = 1);

    Object.keys(types).forEach(type => console.log("Type", type, "has", types[type], "devices"));

    console.log("-----");
    console.log("Allowed types:", this.allowedTypes);

    devices = devices.filter(d => this.allowedTypes.indexOf(d[3]) != -1);

    return devices.map(d => {
      switch (d[3]) {
        case "Lamp":
          return new CLight(d[0], d[1], d[2]);
        case "Blinds":
          return new CBlinds(d[0], d[1], d[2]);
        case "Air conditioner":
          return new CFan(d[0], d[1], d[2]);
        case "Tap":
          return new COutlet(d[0], d[1], d[2]);
        case "Boiler":
          return new CBoiler(d[0], d[1], d[2]);
        default:
          throw new Error("Unknown device type '" + d[3] + "', EXTERMINATE");
      }
    });
  }

  getDevices() {
    return new Promise((resolve, reject) => {
      http("hardware.php?get_names")
        .then((devicesString) => {
          this.devices = this._parseDevices(devicesString);
          resolve(this.devices);
        }).catch(reject);
    });
  }

  _getWorkingCards() {
    return Array.from(new Set(this.devices.map(d => d.cardId)));
  }

  updateCurrentStates() {
    let regexp = (id) => new RegExp("id='" + id + "' status='(.*?)' dimmer='(.*?)'", "g");

    const cards = this._getWorkingCards();
    const cardsString = cards.join(",") + ","; //They need a trailing comma
    http("status.php?cards=" + cardsString).then((cardsStates) => {
      cards.forEach(cardId => {
        let result = regexp(cardId).exec(cardsStates);
        if (result === null || result.length < 3)
          return;

        Config.lastStates[cardId] = Config.currentStates[cardId];
        Config.currentStates[cardId] = new ContecDeviceState(result[1], result[2]);
      });

      // Check if device changed
      this.devices.forEach(device => {
        let current = Config.currentStates[device.cardId];
        let last = Config.lastStates[device.cardId];

        if (current !== undefined) {
          if (Config.lastStates[device.cardId] === undefined)
            device.updateState();
          else if (current.status != last.status || current.dimmer.join(",") != last.dimmer.join(","))
            device.updateState();
        }
      })
    })
  }
}


module.exports = ContecManager;
