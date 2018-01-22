'use strict';

const Homey = require('homey');
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class WallSwitch extends ZwaveDevice {
	async onMeshInit() {
		//this.printNode();
		//this.enableDebug();

		// Capabilities
		this.registerCapability('measure_battery', 'BATTERY');

		// Flows
		let wallSwitchScene = new Homey.FlowCardTriggerDevice('wall_switch');
		wallSwitchScene
			.register()
			.registerRunListener((args, state) => {
				if (args.hasOwnProperty('button') && args.hasOwnProperty('scene') && state.hasOwnProperty('button') && state.hasOwnProperty('scene')) {
					return Promise.resolve(args.button === state.button && args.scene === state.scene);
				}
				return Promise.resolve(false);
			});

		let wallSwitchSceneToken = new Homey.FlowCardTriggerDevice('scene_token');
		wallSwitchSceneToken
			.register();

		let wallSwitchNonScene = new Homey.FlowCardTriggerDevice('wall_switch_nonscene');
		soft_remote_nonscene
			.register()
			.registerRunListener((args, state) => {
				if (args.hasOwnProperty('value') && state.hasOwnProperty('value')) {
					return Promise.resolve(args.value === state.value);
				}
				return Promise.resolve(false);
			});

		// Central Scene flow triggers
		this.registerReportListener('CENTRAL_SCENE', 'CENTRAL_SCENE_NOTIFICATION', report => {
			if(report.hasOwnProperty('Properties1') && report.Properties1.hasOwnProperty('Key Attributes') && report.hasOwnProperty('Scene Number')) {
				const remoteValue = {
					button: report['Scene Number'].toString(),
					scene: report.Properties1['Key Attributes']
				};
				wallSwitchScene.trigger(this, null, remoteValue);
				wallSwitchSceneToken.trigger(this, null, remoteValue);
			}
		});

		// Basic flow triggers
		this.registerReportListener('BASIC', 'BASIC_SET', report => {
			if (typeof report.Value === 'number') {
				if (report.Value > 0) wallSwitchNonScene.trigger(this, null, { value: 'on' });
				else wallSwitchNonScene.trigger(this, null, { value: 'off' });
			}
		});

		// Multilevel Switch flow triggers
		this.registerReportListener('SWITCH_MULTILEVEL', 'SWITCH_MULTILEVEL_START_LEVEL_CHANGE', report => {
			if (report.hasOwnProperty('Level') && typeof report.Level['Up/ Down'] === 'boolean') {
				if (report.Level['Up/ Down']) wallSwitchNonScene.trigger(this, null, { value: 'down' });
				else wallSwitchNonScene.trigger(this, null, { value: 'up' });
			}
		});

		this.registerReportListener('SWITCH_MULTILEVEL', 'SWITCH_MULTILEVEL_STOP_LEVEL_CHANGE', report => {
			wallSwitchNonScene.trigger(this, null, { value: 'stop' });
		});
	}
}

module.exports = WallSwitch;
