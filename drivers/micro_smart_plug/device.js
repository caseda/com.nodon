'use strict';

const {ZwaveDevice} = require('homey-zwavedriver');

class MicroSmartPlug extends ZwaveDevice {
	async onNodeInit() {
		//this.printNode();
		//this.enableDebug();

		// Register Flows
		this._resetMeterFlowAction = this.driver.microSmartPlugResetMeter;

		// Register Capabilities
		this.registerCapability('onoff', 'SWITCH_BINARY');
		this.registerCapability('measure_power', 'METER');
		this.registerCapability('meter_power', 'METER');

		if (this.hasCapability('button.meter_reset')) {
			this.removeCapability('button.meter_reset');
		}

		if (!this.hasCapability('button.reset_meter')) {
			this.addCapability('button.reset_meter');
		}

		this.registerCapabilityListener('button.reset_meter', async () => {
			return await this.resetMeter();
		});

		// Register Settings
		this.registerSetting('led_indicator', value => this._sendIndicator(value));

		this.registerSetting('enable_group_2', value => {
			newValue = value | (this.getSetting('enable_group_3') << 1);
			return Buffer.from([newValue]);
		});

		this.registerSetting('enable_group_3', value => {
			newValue = this.getSetting('enable_group_2') | (value << 1);
			return Buffer.from([newValue]);
		});

		this.registerSetting('kwh_threshold', value => Buffer.from([value * 1000]));

		this.registerSetting('command_group_4', value => {
			newValue = Number(value) + Number(this.getSetting('command_group_5'));
			return Buffer.from([newValue]);
		});

		this.registerSetting('command_group_5', value => {
			newValue = Number(value) + Number(this.getSetting('command_group_4'));
			return Buffer.from([newValue]);
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

	async microSmartPlugResetMeterRunListener(args) {
		return await this.resetMeter();
	}
}

module.exports = MicroSmartPlug;
