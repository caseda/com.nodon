'use strict';

const Homey = require('homey');
const ZwaveMeteringDevice = require('homey-meshdriver').ZwaveMeteringDevice;

class MicroSmartPlug extends ZwaveMeteringDevice {
	async onMeshInit() {
		//this.printNode();
		//this.enableDebug();

		// Capabilities
		this.registerCapability('onoff', 'SWITCH_BINARY');
		this.registerCapability('measure_power', 'METER');
		this.registerCapability('meter_power', 'METER');

		// Settings
		this.registerSetting('led_indicator', value => {
			sendIndicator(this, value)
				.then(sendValue => {
					this.log('led_indicator successfully send:', sendValue);
				})
				.catch(err => {
					this.error('led_indicator failed');
				});
		});

		this.registerSetting('enable_group_2', value => {
			value = (value) ? 1 : 0;
			value += (this.getSetting('enable_group_3')) ? 2 : 0;
			return value;
		});

		this.registerSetting('enable_group_3', value => {
			value = (value) ? 2 : 0;
			value += (this.getSetting('enable_group_2')) ? 1 : 0;
			return value;
		});

		this.registerSetting('kwh_threshold', value => { return Math.round(value * 1000) });

		this.registerSetting('command_group_4', value => {
			value = parseInt(value);
			value += parseInt(this.getSetting('command_group_5'));
			return value;
		});

		this.registerSetting('command_group_5', value => {
			value = parseInt(value);
			value += parseInt(this.getSetting('command_group_4'));
			return value;
		});

		// Sync indicator status on boot up
		await sendIndicator(this, this.getSetting('led_indicator'))
			.then(sendValue => {
				this.log('led_indicator succesfully synced:', sendValue);
			})
			.catch(err => {
				this.error('led_indicator failed');
			});

		// Flows
		let oldMeterResetAction = new Homey.FlowCardAction('micro_smart_plug_reset_meter');
		oldMeterResetAction
			.register();

		oldMeterResetAction.registerRunListener(() => {
			return Promise.reject('card_not_used_anymore_use_new_reset_card');
		});

		let resetMeterFlowAction = new Homey.FlowCardAction('resetMeter');
		resetMeterFlowAction
			.register();

		let commandClassMeter = this.getCommandClass('METER');
		if (!(commandClassMeter instanceof Error) && typeof commandClassMeter.METER_RESET === 'function') {

			resetMeterFlowAction.registerRunListener(() => {
				commandClassMeter.METER_RESET({}, (err, result) => {
					if (err || result !== 'TRANSMIT_COMPLETE_OK') return Promise.reject(err || result);
					return Promise.resolve();
				});
			});
		}
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

module.exports = MicroSmartPlug;
