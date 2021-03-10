'use strict';

const Homey = require('homey');

class SmartPlugDriver extends Homey.Driver {
  onInit() {
    super.onInit();

		this.smartPlugPowerFail = this.homey.flow.getDeviceTriggerCard('smart_plug_powerfail');
		this.smartPlugPowerRestore = this.homey.flow.getDeviceTriggerCard('smart_plug_powerrestore');
  }
}

module.exports = SmartPlugDriver;
