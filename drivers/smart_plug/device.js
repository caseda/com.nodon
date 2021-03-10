'use strict';

const {ZwaveDevice} = require('homey-zwavedriver');

class SmartPlug extends ZwaveDevice {
	async onMeshInit() {
		//this.printNode();
		//this.enableDebug();

		// Flows
		this._smartPlugPowerFail = this.driver.smartPlugPowerFail;
		this._smartPlugPowerRestore = this.driver.smartPlugPowerRestore;

		// Capabilities
		this.registerCapability('onoff', 'SWITCH_BINARY');

		// Settings
		this.registerSetting('led_indicator', value => this._sendIndicator(value));

		this.registerSetting('enable_group_2', value => {
			newValue = value | (this.getSetting('enable_group_3') << 1);
			return Buffer.from([newValue]);
		});

		this.registerSetting('enable_group_3', value => {
			newValue = this.getSetting('enable_group_2') | (value << 1);
			return Buffer.from([newValue]);
		});

		this.registerSetting('power_failure_group_4', value => {
			let newValue = 1 | (value << 1);
			newValue += (this.getSetting('enable_group_5') << 2);
			newValue += (this.getSetting('enable_group_6') << 3);
			newValue += (this.getSetting('enable_group_7') << 4);
			newValue += (this.getSetting('enable_group_8') << 5);
			return new Buffer([newValue]);
		});

		this.registerSetting('power_failure_group_5', value => {
			let newValue = 1 | (this.getSetting('enable_group_4') << 1);
			newValue += (value << 2);
			newValue += (this.getSetting('enable_group_6') << 3);
			newValue += (this.getSetting('enable_group_7') << 4);
			newValue += (this.getSetting('enable_group_8') << 5);
			return new Buffer([newValue]);
		});

		this.registerSetting('power_failure_group_6', value => {
			let newValue = 1 | (this.getSetting('enable_group_4') << 1);
			newValue += (this.getSetting('enable_group_5') << 2);
			newValue += (value << 3);
			newValue += (this.getSetting('enable_group_7') << 4);
			newValue += (this.getSetting('enable_group_8') << 5);
			return new Buffer([newValue]);
		});

		this.registerSetting('power_failure_group_7', value => {
			let newValue = 1 | (this.getSetting('enable_group_4') << 1);
			newValue += (this.getSetting('enable_group_5') << 2);
			newValue += (this.getSetting('enable_group_6') << 3);
			newValue += (value << 4);
			newValue += (this.getSetting('enable_group_8') << 5);
			return new Buffer([newValue]);
		});

		this.registerSetting('power_failure_group_8', value => {
			let newValue = 1 | (this.getSetting('enable_group_4') << 1);
			newValue += (this.getSetting('enable_group_5') << 2);
			newValue += (this.getSetting('enable_group_6') << 3);
			newValue += (this.getSetting('enable_group_7') << 4);
			newValue += (value << 5);
			return new Buffer([newValue]);
		});

		// Notification flow triggers
		this.registerReportListener('NOTIFICATION', 'NOTIFICATION_REPORT', async report => {
			if (
				report['Notification Type'] !== undefined
				&& report['Notification Type'] === 'Power Management'
				&& report.Event !== undefined
			) {
				if (report.Event === 2) this._smartPlugPowerFail.trigger(this, null, null);
				if (report.Event === 3) {
					this._smartPlugPowerRestore.trigger(this, null, null);
					await this._sendIndicator(this.getSetting('led_indicator'));
				}
			}
		});

		// Sync indicator status on boot up
		this._sendIndicator(this.getSetting('led_indicator'));
	}

	async _sendIndicator(value) {
		const CC_Indicator = this.getCommandClass('INDICATOR');

		if (CC_Indicator instanceof Error) return Promise.reject('failed_to_get_indicator_command_class');
		if (typeof CC_Indicator.INDICATOR_SET !== 'function') return Promise.reject('indicator_set_funcion_unavailable');
		if (typeof value !== 'boolean') value = this.getSetting('led_indicator');

		await CC_Indicator.INDICATOR_SET({
			"Value": value,
		})
	 	.catch(err => {
			this.error(err);
			return false;
		})
		.then(result => {
			if (result !== 'TRANSMIT_COMPLETE_OK') return Promise.reject(result);
			return true;
		});
	}
}

module.exports = SmartPlug;
