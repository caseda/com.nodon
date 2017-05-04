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
				'Switch Value': (value) ? 'on/enable' : 'off/disable',
			}),
			command_report: 'SWITCH_BINARY_REPORT',
			command_report_parser: report => report['Value'] === 'on/enable',
		},
	},
	settings: {
		save_state: {
			index: 1,
			size: 1,
		},
		always_on: {
			index: 4,
			size: 1,
		},
		led_indicator: (newValue, oldValue, deviceData) => {
			const node = module.exports.nodes[deviceData.token];

			if (node && typeof node.instance.CommandClass.COMMAND_CLASS_INDICATOR !== 'undefined') {
				node.instance.CommandClass.COMMAND_CLASS_INDICATOR.INDICATOR_SET({
					"Value": (newValue) ? 1 : 0,
				}, err => {
					if (err) return console.error(err, false);
				});
			}
		},
		enable_group_2: {
			index: 3,
			size: 1,
			parser: (newValue, newSettings) => {
				let value = 0;
				if (newValue === true) value += 1;
				if (newSettings['enable_group_3'] === true) value += 2;

				return new Buffer([value]);
			},
		},
		enable_group_3: {
			index: 3,
			size: 1,
			parser: (newValue, newSettings) => {
				let value = 0;
				if (newValue === true) value += 1;
				if (newSettings['enable_group_3'] === true) value += 2;

				return new Buffer([value]);
			},
		},
		power_failure_group_4: {
			index: 2,
			size: 1,
			parser: (newValue, newSettings) => {
				let value = 1;
				if (newValue === true) value += 2;
				if (newSettings['power_failure_group_5'] === true) value += 4;
				if (newSettings['power_failure_group_6'] === true) value += 8;
				if (newSettings['power_failure_group_7'] === true) value += 16;
				if (newSettings['power_failure_group_8'] === true) value += 32;

				return new Buffer([value]);
			},
		},
		power_failure_group_5: {
			index: 2,
			size: 1,
			parser: (newValue, newSettings) => {
				let value = 1;
				if (newSettings['power_failure_group_4'] === true) value += 2;
				if (newValue === true) value += 4;
				if (newSettings['power_failure_group_6'] === true) value += 8;
				if (newSettings['power_failure_group_7'] === true) value += 16;
				if (newSettings['power_failure_group_8'] === true) value += 32;

				return new Buffer([value]);
			},
		},
		power_failure_group_6: {
			index: 2,
			size: 1,
			parser: (newValue, newSettings) => {
				let value = 1;
				if (newSettings['power_failure_group_4'] === true) value += 2;
				if (newSettings['power_failure_group_5'] === true) value += 4;
				if (newValue === true) value += 8;
				if (newSettings['power_failure_group_7'] === true) value += 16;
				if (newSettings['power_failure_group_8'] === true) value += 32;

				return new Buffer([value]);
			},
		},
		power_failure_group_7: {
			index: 2,
			size: 1,
			parser: (newValue, newSettings) => {
				let value = 1;
				if (newSettings['power_failure_group_4'] === true) value += 2;
				if (newSettings['power_failure_group_5'] === true) value += 4;
				if (newSettings['power_failure_group_6'] === true) value += 8;
				if (newValue === true) value += 16;
				if (newSettings['power_failure_group_8'] === true) value += 32;

				return new Buffer([value]);
			},
		},
		power_failure_group_8: {
			index: 2,
			size: 1,
			parser: (newValue, newSettings) => {
				let value = 1;
				if (newSettings['power_failure_group_4'] === true) value += 2;
				if (newSettings['power_failure_group_5'] === true) value += 4;
				if (newSettings['power_failure_group_6'] === true) value += 8;
				if (newSettings['power_failure_group_7'] === true) value += 16;
				if (newValue === true) value += 32;

				return new Buffer([value]);
			},
		},
	}
});

module.exports.on('initNode', token => {
	const node = module.exports.nodes[token];

	if (typeof node.instance.CommandClass.COMMAND_CLASS_NOTIFICATION !== 'undefined') {
		node.instance.CommandClass.COMMAND_CLASS_NOTIFICATION.on('report', (command, report) => {

			if (command.name === 'NOTIFICATION_REPORT' &&
				typeof report['Notification Type'] === 'string' &&
				report['Notification Type'] === 'Power Management' &&
				(typeof report.Event !== 'undefined' ||
				typeof report['Event (Parsed)'] !== 'undefined')) {

				if (report.Event === 2 || report['Event (Parsed)'] === 'AC mains disconnected') {
					Homey.manager('flow').triggerDevice('smart_plug_powerfail', null, null, node.device_data);
				} else if (report.Event === 3 || report['Event (Parsed)'] === 'AC mains re-connected') {
					Homey.manager('flow').triggerDevice('smart_plug_powerrestore', null, null, node.device_data);
				}
			}
		});
	}
});
