'use strict';

const path = require('path');
const ZwaveDriver = require('homey-zwavedriver');

// Wall Switch
// http://nodon.fr/support/NodOn_WallSwitch_ZWave_UserGuide_EN.pdf

module.exports = new ZwaveDriver(path.basename(__dirname), {
	capabilities: {
		measure_battery: {
			getOnWakeUp: true,
			command_class: 'COMMAND_CLASS_BATTERY',
			command_get: 'BATTERY_GET',
			command_report: 'BATTERY_REPORT',
			command_report_parser: (report, node) => {
				if (!report) return null;
				if (node && typeof node.state.alarm_battery === 'undefined') node.state.alarm_battery = false;
				if (typeof report['Battery Level'] === 'string' && report['Battery Level'] === 'battery low warning') {
					if (node && node.state.hasOwnProperty('alarm_battery') && node.state.alarm_battery !== true) {
						node.state.alarm_battery = true;
						module.exports.realtime(node.device_data, 'alarm_battery', true);
					}
					return 1;
				}
				if (typeof report['Battery Level (Raw)'] !== 'undefined') {
					if (node && node.state.hasOwnProperty('alarm_battery') && report['Battery Level (Raw)'][0] > 15) {
						node.state.alarm_battery = false;
						module.exports.realtime(node.device_data, 'alarm_battery', false);
					}
					return report['Battery Level (Raw)'][0];
				}
				return null;
			},
		},
		alarm_battery: {
			command_class: 'COMMAND_CLASS_BATTERY',
		},
	},
	settings: {
		profile_1_3: {
			index: 1,
			size: 1,
		},
		profile_2_4: {
			index: 2,
			size: 1,
		},
		led: {
			index: 8,
			size: 1,
		},
	}
});

module.exports.on('initNode', token => {
	const node = module.exports.nodes[token];

	if (node && typeof node.instance.CommandClass.COMMAND_CLASS_CENTRAL_SCENE !== 'undefined') {
		node.instance.CommandClass.COMMAND_CLASS_CENTRAL_SCENE.on('report', (command, report) => {
			if (command &&
				command.name === 'CENTRAL_SCENE_NOTIFICATION' &&
				report &&
				report.hasOwnProperty('Scene Number') &&
				report.hasOwnProperty('Properties1') &&
				typeof report.Properties1['Key Attributes'] === "string") {
				const remote_value = {
					button: report['Scene Number'].toString(),
					scene: report.Properties1['Key Attributes']
				};
				Homey.manager('flow').triggerDevice('wall_switch', null, remote_value, node.device_data);
			}
		});
	}

	if (node && typeof node.instance.CommandClass.COMMAND_CLASS_BASIC !== 'undefined') {
		node.instance.CommandClass.COMMAND_CLASS_BASIC.on('report', (command, report) => {
			if (command &&
				command.name === 'BASIC_SET' &&
				report &&
				typeof report.Value === 'number') {
				if(report.Value === 255) Homey.manager('flow').triggerDevice('wall_switch_nonscene', null, { value: 'on' }, node.device_data);
				if (report.Value === 0) Homey.manager('flow').triggerDevice('wall_switch_nonscene', null, { value: 'off' }, node.device_data);
			}
		});
	}

	if (node && typeof node.instance.CommandClass.COMMAND_CLASS_SWITCH_MULTILEVEL !== 'undefined') {
		node.instance.CommandClass.COMMAND_CLASS_SWITCH_MULTILEVEL.on('report', (command, report) => {
			if (command &&
				command.name === 'SWITCH_MULTILEVEL_START_LEVEL_CHANGE' &&
				report &&
				report.hasOwnProperty('Level') &&
				typeof report.Level['Up/ Down'] === 'boolean') {
				if (report.Level['Up/ Down']) Homey.manager('flow').triggerDevice('wall_switch_nonscene', null, { value: 'down' }, node.device_data);
				else Homey.manager('flow').triggerDevice('wall_switch_nonscene', null, { value: 'up' }, node.device_data);
			}
			if (command.name === 'SWITCH_MULTILEVEL_STOP_LEVEL_CHANGE') Homey.manager('flow').triggerDevice('wall_switch_nonscene', null, { value: 'stop' }, node.device_data);
		});
	}
});

Homey.manager('flow').on('trigger.wall_switch', (callback, args, state) => {
	if(state &&
		state.hasOwnProperty('button') &&
		state.hasOwnProperty('scene') &&
		args &&
		args.hasOwnProperty('button') &&
		args.hasOwnProperty('scene') &&
		state.button === args.button &&
		state.scene === args.scene) {
		return callback(null, true);
	} else return callback(null, false);
});

Homey.manager('flow').on('trigger.wall_switch_nonscene', (callback, args, state) => {
	if(state &&
		state.hasOwnProperty('value') &&
		args &&
		args.hasOwnProperty('value') &&
		state.value === args.value) {
		return callback(null, true);
	} else return callback(null, false);
});
