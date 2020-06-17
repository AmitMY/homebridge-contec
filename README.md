# Homebridge Contec
Connects Contec "Smart Home" to Apple HomeKit using Homebridge

Copyright © 2016 - 2017 Amit Moryossef. All rights reserved.
Free for personal use, no commercial use. [License](LICENSE.md).

## Support
In the current state, the plugin supports the following devices:
- Lamps
- Blinds
- Air Conditioners
- Taps
- Boilers

And allows split support for several homebridge bridges in case you have more than a 100 devices.
Recommended split:
- Instance 1: `["Lamp"]`
- Instance 2: `["Blinds", "Air conditioner", "Tap", "Boiler"]`

## Usage
Currently, it is hard coded to find the contec client on `http://10.0.0.100/content/`, but if necessary to configure please open a relevant issue.

1. Use any linux/mac (recommended: Raspberry Pi) and run the homebridge client.
2. Install this plugin by doing `sudo npm install -g homebridge-contec@latest`
3. Add the platform to the config

### Sample config:
```json
{
  "bridge": {
    "name": "Contec",
    "username": "CC:22:3D:E3:CE:30",
    "port": 51820,
    "pin": "123-45-678"
  },

  "description": "Smart Home",
  "accessories": [],
  "platforms": [
    {
      "platform": "Contec",
      "url": "10.0.0.100",
      "port": "80",
      "types": ["Lamp", "Blinds", "Air conditioner", "Tap", "Boiler"]
    }
  ]
}
```
