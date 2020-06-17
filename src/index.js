let ContecManager = require("./contec/manager");
let config = require("./contec/config");
let globals = config.globals;

module.exports = function (homebridge) {
  // Accessory must be created from PlatformAccessory Constructor
  globals.Accessory = homebridge.platformAccessory;

  // Service and Characteristic are from hap-nodejs
  globals.Service = homebridge.hap.Service;
  globals.Characteristic = homebridge.hap.Characteristic;
  globals.UUIDGen = homebridge.hap.uuid;

  homebridge.registerPlatform("homebridge-contec", "Contec", ContecPlatform, true);
};

let registered = {};
let unregistered = {};

class ContecPlatform {
  constructor(log, config, api) {
    this.log = log;
    this.log("ContecPlatform Init");

    this.api = api;
    this.api.on("didFinishLaunching", () => {
      this.contecManager = new ContecManager(config || {});

      this.log("DidFinishLaunching");
      this.listen();
      this.registerAccessories();
    });
  }

  listen() {
    let update = () => this.contecManager.updateCurrentStates();
    setInterval(update.bind(this), 500);
  }

  registerAccessories() {
    this.log("registerAccessories Init");
    this.contecManager.getDevices().then((devices) => {
      devices.forEach(device => {
        let accessory = device.createAccessory();

        device.addServices(accessory);

        if (!registered[accessory.UUID])
          this.api.registerPlatformAccessories("homebridge-contec", "Contec", [accessory]);
        else {
          // If loaded from cache, add services for correct device
          accessory = registered[accessory.UUID];
          device.addServices(accessory);
          // TODO perhaps update name
        }

        accessory.updateReachability(true);
        device.accessory = accessory;

        delete unregistered[accessory.UUID];
      });

      this.log("Registered " + devices.length + " Devices");

      Object.keys(unregistered).forEach(key => this.removeAccessory(unregistered[key]));
    });
  }

  configureAccessory(accessory) {
    registered[accessory.UUID] = accessory;
    unregistered[accessory.UUID] = accessory;
  }

  updateAccessoriesReachability() {
    this.log("updateAccessoriesReachability");
  }

  removeAccessory(accessory) {
    this.log("removeAccessory");
    this.api.unregisterPlatformAccessories("homebridge-contec", "Contec", [accessory]);
  }
}
