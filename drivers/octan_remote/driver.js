'use strict';

const Homey = require('homey');

class OctanRemoteDriver extends Homey.Driver {
  onInit() {
    super.onInit();

    this.octanRemoteScene = this.homey.flow.getDeviceTriggerCard('octan_remote');
    this.octanRemoteScene.registerRunListener((args, state) => {
      return args.device.octanRemoteSceneRunListener(args, state);
    });
    this.octanRemoteNonScene = this.homey.flow.getDeviceTriggerCard('octan_remote_nonscene');
    this.octanRemoteNonScene.registerRunListener((args, state) => {
      return args.device.octanRemoteNonSceneRunListener(args, state);
    });
  }
}

module.exports = OctanRemoteDriver;
