'use strict';

const path = require('path');
const ZwaveDriver = require('homey-zwavedriver');

// Micro Smart Plug
// http://nodon.fr/support/NodOn-MSP-3-1-x1-UserGuide-160726-EN-interactive.pdf

module.exports = new ZwaveDriver(path.basename(__dirname), {
	capabilities: {
		onoff: {
			command_class: 'COMMAND_CLASS_SWITCH_BINARY',
			command_get: 'SWITCH_BINARY_GET',
			command_set: 'SWITCH_BINARY_SET',
			command_set_parser: value => ({
				'Switch Value': (value > 0) ? 'on/enable' : 'off/disable',
			}),
			command_report: 'SWITCH_BINARY_REPORT',
			command_report_parser: report => report['Value'] === 'on/enable',
		},

		measure_power: {
			command_class: 'COMMAND_CLASS_METER',
			command_get: 'METER_GET',
			command_get_parser: () => ({
				Properties1: {
					'Rate Type': 'Import',
					Scale: 2,
				},
				'Scale 2': 0,
			}),
			command_report: 'METER_REPORT',
			command_report_parser: report => {
				if (report.hasOwnProperty('Properties2') &&
				report.Properties2.hasOwnProperty('Scale bits 10') &&
				report.Properties2['Scale bits 10'] === 2)
					return report['Meter Value (Parsed)'];

				return null;
			},
		},

		meter_power: {
			command_class: 'COMMAND_CLASS_METER',
			command_get: 'METER_GET',
			command_get_parser: () => ({
				Properties1: {
					'Rate Type': 'Import',
					Scale: 0,
				},
				'Scale 2': 0,
			}),
			command_report: 'METER_REPORT',
			command_report_parser: report => {
				if (report.hasOwnProperty('Properties2') &&
				report.Properties2.hasOwnProperty('Scale bits 10') &&
				report.Properties2['Scale bits 10'] === 0)
					return report['Meter Value (Parsed)'] / 1000;

				return null;
			},
		}
	},
	settings: {
		save_state: {
			index: 1,
			size: 1,
		},
		enable_group_2: {
			index: 3,
			size: 1,
			parser: (newValue, newSettings) => {
				let value = 0;
				if (newValue === true) value + 1;
				if (newSettings['enable_group_3'] === true) value + 2;

				return new Buffer([value]);
			},
		},
		enable_group_3: {
			index: 3,
			size: 1,
			parser: (newValue, newSettings) => {
				let value = 0;
				if (newValue === true) value + 1;
				if (newSettings['enable_group_3'] === true) value + 2;

				return new Buffer([value]);
			}
		},
		always_on: {
			index: 4,
			size: 1,
		},
		watt_threshold: {
			index: 21,
			size: 1,
		},
		overload: {
			index: 22,
			size: 2,
		},
		kwh_threshold: {
			index: 23,
			size: 2,
			parser: newValue => new Buffer([Math.round(newValue * 1000)]),
		},
		all_data: {
			index: 24,
			size: 2,
			signed: false,
		},
		onoff_high: {
			index: 25,
			size: 2,
		},
		onoff_low: {
			index: 26,
			size: 2,
		},
		command_group_4: {
			index: 27,
			size: 1,
			parser: (newValue, newSettings) => new Buffer([parseInt(newSettings('command_group_5')) + parseInt(newValue)]),
		},
		command_group_5: {
			index: 27,
			size: 1,
			parser: (newValue, newSettings) => new Buffer([parseInt(newSettings('command_group_4')) + parseInt(newValue)]),
		},
		reset_meter: (newValue, oldValue, deviceData) => {
			const node = module.exports.nodes[deviceData.token];
			if (newValue === '2' && typeof node.instance.CommandClass.COMMAND_CLASS_METER !== 'undefined') {
				node.instance.CommandClass.COMMAND_CLASS_METER.METER_RESET({}, (err, result) => {
					if (result === 'TRANSMIT_COMPLETE_OK') {
						module.exports.setSettings(node.device_data, {
							reset_meter: '1'
						});
					} else {
						module.exports.setSettings(node.device_data, {
							reset_meter: '0'
						});
					}
				});
			}
		},
	}
});

Homey.manager('flow').on('action.micro_smart_plug_reset_meter', (callback, args) => {
	const node = module.exports.nodes[args.device.token];
	
	if (typeof node.instance.CommandClass.COMMAND_CLASS_METER !== 'undefined') {
		node.instance.CommandClass.COMMAND_CLASS_METER.METER_RESET({}, (err, result) => {
			if (err) return callback(err, false);
			if (result === 'TRANSMIT_COMPLETE_OK') return callback(null, true);
			return callback(result, false);
		});
	} else return callback('device_not_available', false);
});
