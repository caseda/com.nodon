'use strict';

const { ZwaveDevice } = require('homey-zwavedriver');

class OctanRemote extends ZwaveDevice {
	async onNodeInit() {
		//this.printNode();
		//this.enableDebug();

		// Register
		this._octanRemoteScene = this.driver.octanRemoteScene;
		this._octanRemoteSceneToken = this.homey.app.sceneTokenRegister;
		this._octanRemoteNonScene = this.driver.octanRemoteNonScene;
		this._octanRemoteSequence = this.homey.app.sequenceRegister;

		// Register Capabilities
		this.registerCapability('measure_battery', 'BATTERY');

		if (this.hasCapability('alarm_battery')) {
			this.removeCapability('alarm_battery').catch(this.error);
		}

		// Central Scene flow triggers
		let sequence = [], previousSequence, sequenceTimeout, holdTimeout, debounce, throttle;

		this.registerReportListener('CENTRAL_SCENE', 'CENTRAL_SCENE_NOTIFICATION', report => {
			if (
				report.Properties1['Key Attributes'] !== undefined
				&& report['Scene Number'] !== undefined
			) {
				const remoteValue = {
					button: '' + report['Scene Number'],
					scene: report.Properties1['Key Attributes']
				};

				// Sequence activation
				if (this.getSetting('sequence_activation') && report.Properties1['Key Attributes'] === 'Key Pressed 1 time') {
					if (!previousSequence || previousSequence + 1 === report['Sequence Number']) {
						previousSequence = report['Sequence Number'];
						sequence.push(report['Scene Number']);

					} else {
						this._octanRemoteScene.trigger(this, null, remoteValue).catch(this.error);
						this._octanRemoteSceneToken.trigger(this, remoteValue, null).catch(this.error);

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
							this._octanRemoteScene.trigger(this, null, remoteValue).catch(this.error);
							this._octanRemoteSceneToken.trigger(this, remoteValue, null).catch(this.error)

						} else this._octanRemoteSequence.trigger(this, null, { sequence: sequence }).catch(this.error);

						sequence = [];
						previousSequence = null;
					}, this.getSetting('sequence_timeout') * 1000 || 2000);

				// Hold key Scene activation
				} else if (report.Properties1['Key Attributes'] === 'Key Held Down') {
					if (!throttle) {
						this._octanRemoteScene.trigger(this, null, remoteValue).catch(this.error);
						this._octanRemoteSceneToken.trigger(this, remoteValue, null).catch(this.error);

						throttle = setTimeout(() => {
							throttle = false;
						}, 1000);
					}

					remoteValue.scene = 'Key Held Down Single';
					if (!debounce) {
						this._octanRemoteScene.trigger(this, null, remoteValue).catch(this.error);
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
					this._octanRemoteScene.trigger(this, null, remoteValue).catch(this.error);
					this._octanRemoteSceneToken.trigger(this, remoteValue, null).catch(this.error);
				}
			}
		});

		// Basic flow triggers
		this.registerReportListener('BASIC', 'BASIC_SET', report => {
			if (report.Value !== undefined) {
				if (report.Value > 0) this._octanRemoteNonScene.trigger(this, null, { value: 'on' }).catch(this.error);
				else this._octanRemoteNonScene.trigger(this, null, { value: 'off' }).catch(this.error);
			}
		});

		// Multilevel Switch flow triggers
		this.registerReportListener('SWITCH_MULTILEVEL', 'SWITCH_MULTILEVEL_START_LEVEL_CHANGE', report => {
			if (
				report['Level'] !== undefined
				&& report.Level['Up/ Down'] !== undefined
			) {
				if (report.Level['Up/ Down']) this._octanRemoteNonScene.trigger(this, null, { value: 'down' }).catch(this.error);
				else this._octanRemoteNonScene.trigger(this, null, { value: 'up' }).catch(this.error);
			}
		});

		this.registerReportListener('SWITCH_MULTILEVEL', 'SWITCH_MULTILEVEL_STOP_LEVEL_CHANGE', report => {
			this._octanRemoteNonScene.trigger(this, null, { value: 'stop' }).catch(this.error);
		});
	}

	// Flows Run Listeners
	async octanRemoteSceneRunListener(args, state) {
		if (
			args.button !== undefined
			&& args.scene !== undefined
			&& state.button !== undefined
			&& state.scene !== undefined
		) {
			return (args.button === state.button && args.scene === state.scene);
		}
		return false;
	}

	async octanRemoteNonSceneRunListener(args, state) {
		if (
			args.value !== undefined
			&& state.value !== undefined
		) {
			return (args.value === state.value);
		}
		return false;
	}

	async sequenceRunListener(args, state) {
		if (
			args.sequence !== undefined
			&& state.sequence !== undefined
		) {
			const userSequence = args.sequence.split(/[ ,;]+/).map(Number);
			let countSameButton = 0;

			for (let i = 0; i < userSequence.length; i++) {
				if (userSequence[i] === state.sequence[i]) countSameButton++;
			}
			return (countSameButton === userSequence.length);
		}
		return false;
	}
}

module.exports = OctanRemote;
