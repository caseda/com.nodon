'use strict';

const Homey = require('homey');

class MicroSmartPlugDriver extends Homey.Driver {
  onInit() {
    super.onInit();

    this.microSmartPlugResetMeter = this.homey.flow.getActionCard('resetMeter');
    this.microSmartPlugResetMeter.registerRunListener((args, state) => {
      return args.device.microSmartPlugResetMeterRunListener(args, state);
    });
  }
}

module.exports = MicroSmartPlugDriver;
