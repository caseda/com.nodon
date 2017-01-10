'use strict';

const path = require('path');
const ZwaveDriver = require('homey-zwavedriver');

// http://nodon.fr/support/NodOn_OctanRemote_ZWave_UserGuide_EN.pdf

module.exports = new ZwaveDriver(path.basename(__dirname), {
	capabilities: {
		'measure_battery': {
			'getOnWakeUp': true,
			'command_class': 'COMMAND_CLASS_BATTERY',
			'command_get': 'BATTERY_GET',
			'command_report': 'BATTERY_REPORT',
			'command_report_parser': report => {
				if (report['Battery Level'] === 'battery low warning')
					return 1;
					
				if (report.hasOwnProperty('Battery Level (Raw)'))
					return report['Battery Level (Raw)'][0];
				
				return null;
			}
		}
	},
	settings: {
		"led": {
			"index": 8,
			"size": 1
		}
	}
});

module.exports.on('initNode', token => {
	const node = module.exports.nodes[token];
	
	if (node) {
		node.instance.CommandClass['COMMAND_CLASS_CENTRAL_SCENE'].on('report', (command, report) => {
			
			if (command.name === 'CENTRAL_SCENE_NOTIFICATION') {
				
				if (report &&
				report.hasOwnProperty("Scene Number") &&
				report.hasOwnProperty("Properties1") &&
				report.Properties1.hasOwnProperty("Key Attributes")) {
					
					const remote_value = {
						"button": report['Scene Number'].toString(),
						"scene": report.Properties1['Key Attributes']
					};
					
					Homey.manager('flow').triggerDevice('octan_remote', null, remote_value, node.device_data);
				}
			}
		});
	}
});

Homey.manager('flow').on('trigger.octan_remote', (callback, args, state) => {
	
	if(state &&
		state.hasOwnProperty("button") &&
		state.hasOwnProperty("scene") &&
		args.hasOwnProperty("button") &&
		args.hasOwnProperty("scene") &&
		state.button === args.button &&
		state.scene === args.scene)
			return callback(null, true);
	
	callback(null, false);
});
