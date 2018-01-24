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

		let wallSwitchSequence = new Homey.FlowCardTriggerDevice('button_sequence');
		wallSwitchSequence
			.register()
			.registerRunListener((args, state) => {

				if (args.hasOwnProperty('sequence') && state.hasOwnProperty('sequence')) {
					const userSequence = args.sequence.split(/[ ,;]+/).map(Number);
					let countSameButton = 0;

					for (let i = 0; i < userSequence.length; i++) {
						if (userSequence[i] === state.sequence[i]) countSameButton++;
					}
					return Promise.resolve(countSameButton === userSequence.length);
				}
				return Promise.resolve(false);
			});

		// Central Scene flow triggers
		let sequence = [], previousSequence, sequenceTimeout;

		this.registerReportListener('CENTRAL_SCENE', 'CENTRAL_SCENE_NOTIFICATION', report => {

			if(report.hasOwnProperty('Properties1') && report.Properties1.hasOwnProperty('Key Attributes') && report.hasOwnProperty('Scene Number')) {

				const remoteValue = {
					button: report['Scene Number'].toString(),
					scene: report.Properties1['Key Attributes']
				};

				// Sequence activation
				if (this.getSetting('sequence_activation') && report.Properties1['Key Attributes'] === 'Key Pressed 1 time') {

					if (!previousSequence || previousSequence + 1 === report['Sequence Number']) {
						previousSequence = report['Sequence Number'];
						sequence.push(report['Scene Number']);

					} else {
						wallSwitchScene.trigger(this, null, remoteValue);
						wallSwitchSceneToken.trigger(this, remoteValue, null);

						sequence = [];
						previousSequence = null;
						return;
					}

					if (sequenceTimeout) {
						clearTimeout(sequenceTimeout);
						sequenceTimeout = null;
					}

					sequenceTimeout = setTimeout(() => {
						if (sequence.length === 1) {
							wallSwitchScene.trigger(this, null, remoteValue);
							wallSwitchSceneToken.trigger(this, remoteValue, null);

						} else wallSwitchSequence.trigger(this, null, { sequence: sequence });

						sequence = [];
						previousSequence = null;
					}, this.getSetting('sequence_timeout') * 1000 || 2000);

				// Hold key Scene activation
				} else if(report.Properties1['Key Attributes'] === 'Key Held Down') {
					wallSwitchScene.trigger(this, null, remoteValue);
					wallSwitchSceneToken.trigger(this, remoteValue, null);

					remoteValue.scene = 'Key Held Down Single';
					if (!debounce) {
						wallSwitchScene.trigger(this, null, remoteValue);
						debounce = true;
					}

					if (holdTimeout) {
						clearTimeout(holdTimeout);
						holdTimeout = null;
					}
					holdTimeout = setTimeout(() => {
						debounce = false;
					}, 600);

				// Rest Scene activation
				} else {
						wallSwitchScene.trigger(this, null, remoteValue);
						wallSwitchSceneToken.trigger(this, remoteValue, null);
				}
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
