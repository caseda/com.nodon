'use strict';

const Homey = require('homey');

class NodOnApp extends Homey.App {
	onInit() {
		this.log(`${Homey.manifest.id} running...`);

		// Register flow cards
		this.sceneTokenRegister = this.homey.flow.getDeviceTriggerCard('scene_token');

		this.sequenceRegister = this.homey.flow.getDeviceTriggerCard('button_sequence');
		this.sequenceRegister.registerRunListener((args, state) => {
			return args.device.sequenceRunListener(args, state);
		});
	}
}

module.exports = NodOnApp;
