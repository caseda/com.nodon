'use strict';

const Homey = require('homey');
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class SmartPlug extends ZwaveDevice {
	async onMeshInit() {
		//this.printNode();
		//this.enableDebug();

		// Capabilities
		this.registerCapability('onoff', 'SWITCH_BINARY');

		// Settings
		this.registerSetting('led_indicator', value => {
			sendIndicator(this, value)
				.then(sendValue => {
					this.log('led_indicator succesfully send:', sendValue);
				})
				.catch(err => {
					this.error('led_indicator failed');
				})
		});

		this.registerSetting('enable_group_2', value => {
			value = (value) ? 1 : 0;
			value += (this.getSetting('enable_group_3')) ? 2 : 0;

			return new Buffer([value]);
		});

		this.registerSetting('enable_group_3', value => {
			value = (value) ? 2 : 0;
			value += (this.getSetting('enable_group_2')) ? 1 : 0;

			return new Buffer([value]);
		});

		this.registerSetting('power_failure_group_4', value => {
			value = (value) ? 2 : 0;
			value += (this.getSetting('enable_group_5')) ? 4 : 0;
			value += (this.getSetting('enable_group_6')) ? 8 : 0;
			value += (this.getSetting('enable_group_7')) ? 16 : 0;
			value += (this.getSetting('enable_group_8')) ? 32 : 0;

			return new Buffer([1 + value]);
		});

		this.registerSetting('power_failure_group_5', value => {
			value = (value) ? 4 : 0;
			value += (this.getSetting('enable_group_4')) ? 2 : 0;
			value += (this.getSetting('enable_group_6')) ? 8 : 0;
			value += (this.getSetting('enable_group_7')) ? 16 : 0;
			value += (this.getSetting('enable_group_8')) ? 32 : 0;

			return new Buffer([1 + value]);
		});

		this.registerSetting('power_failure_group_6', value => {
			value = (value) ? 8 : 0;
			value += (this.getSetting('enable_group_4')) ? 2 : 0;
			value += (this.getSetting('enable_group_5')) ? 4 : 0;
			value += (this.getSetting('enable_group_7')) ? 16 : 0;
			value += (this.getSetting('enable_group_8')) ? 32 : 0;

			return new Buffer([value]);
		});

		this.registerSetting('power_failure_group_7', value => {
			value = (value) ? 16 : 0;
			value += (this.getSetting('enable_group_4')) ? 2 : 0;
			value += (this.getSetting('enable_group_6')) ? 4 : 0;
			value += (this.getSetting('enable_group_7')) ? 8 : 0;
			value += (this.getSetting('enable_group_8')) ? 32 : 0;

			return new Buffer([value]);
		});

		this.registerSetting('power_failure_group_8', value => {
			value = (value) ? 32 : 0;
			value += (this.getSetting('enable_group_4')) ? 2 : 0;
			value += (this.getSetting('enable_group_5')) ? 4 : 0;
			value += (this.getSetting('enable_group_6')) ? 8 : 0;
			value += (this.getSetting('enable_group_7')) ? 16 : 0;

			return new Buffer([value]);
		});

		// Flows
		let smartPlugPowerFail = new Homey.FlowCardTriggerDevice('smart_plug_powerfail');
		smartPlugPowerFail.register();

		let smartPlugPowerRestore = new Homey.FlowCardTriggerDevice('smart_plug_powerrestore');
		smartPlugPowerRestore.register();

		// Notification flow triggers
		this.registerReportListener('NOTIFICATION', 'NOTIFICATION_REPORT', report => {
			if(report.hasOwnProperty('Notification Type') &&
				report['Notification Type'] === 'Power Management' &&
				report.hasOwnProperty('Event')) {
					if (report.Event === 2) this._smartPlugPowerFail.trigger(this, null, null);
					if (report.Event === 3) {
						this.smartPlugPowerRestore.trigger(this, null, null);
						sendIndicator(this, value)
							.then(sendValue => {
								this.log('led_indicator succesfully send:', sendValue);
							})
							.catch(err => {
								this.error('led_indicator failed');
							});
					}
			}
		});

		// Sync indicator status on boot up
		await sendIndicator(this, this.getSetting('led_indicator'))
			.then(sendValue => {
				this.log('led_indicator succesfully synced:', sendValue);
			})
			.catch(err => {
				this.error('led_indicator failed');
			});
	}
}

function sendIndicator(device, value) {
	return new Promise((resolve, reject) => {
		const CC_Indicator = device.getCommandClass('INDICATOR');

		if (CC_Indicator instanceof Error) return reject('failed_to_get_indicator_command_class');
		if (typeof CC_Indicator.INDICATOR_SET !== 'function') return reject('indicator_set_funcion_unavailable');

		if (typeof value !== 'boolean') value = this.getSetting('led_indicator');

		CC_Indicator.INDICATOR_SET({
			"Value": value,
		})
		 	.catch(err => {
				return reject(err);
			})
			.then(result => {
				if (result !== 'TRANSMIT_COMPLETE_OK') return reject(result);
				return resolve(value);
			});
	});
}

module.exports = SmartPlug;
