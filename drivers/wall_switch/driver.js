'use strict';

const Homey = require('homey');

class WallSwitchDriver extends Homey.Driver {
  onInit() {
    super.onInit();

    this.wallSwitchScene = this.homey.flow.getDeviceTriggerCard('wall_switch');
    this.wallSwitchScene.registerRunListener((args, state) => {
      return args.device.wallSwitchSceneRunListener(args, state);
    });
    this.wallSwitchNonScene = this.homey.flow.getDeviceTriggerCard('wall_switch_nonscene');
    this.wallSwitchNonScene.registerRunListener((args, state) => {
      return args.device.wallSwitchNonSceneRunListener(args, state);
    });
  }
}

module.exports = WallSwitchDriver;
