'use strict';

const Homey = require('homey');

class SoftRemoteDriver extends Homey.Driver {
  onInit() {
    super.onInit();

    this.softRemoteScene = this.homey.flow.getDeviceTriggerCard('soft_remote');
    this.softRemoteScene.registerRunListener((args, state) => {
      return args.device.softRemoteSceneRunListener(args, state);
    });
    this.softRemoteNonScene = this.homey.flow.getDeviceTriggerCard('soft_remote_nonscene');
    this.softRemoteNonScene.registerRunListener((args, state) => {
      return args.device.softRemoteNonSceneRunListener(args, state);
    });
  }
}

module.exports = SoftRemoteDriver;
