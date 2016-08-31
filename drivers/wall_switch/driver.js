"use strict";

const path			= require('path');
const ZwaveDriver	= require('homey-zwavedriver');

// http://www.pepper1.net/zwavedb/device/694

module.exports = new ZwaveDriver( path.basename(__dirname), {
	capabilities: {
		'measure_battery': {
			'command_class'				: 'COMMAND_CLASS_BATTERY',
			'command_get'				: 'BATTERY_GET',
			'command_report'			: 'BATTERY_REPORT',
			'command_report_parser'		: function( report ) {
				if( report['Battery Level'] === "battery low warning" ) {
					return 1;
				}
				return report['Battery Level (Raw)'][0];
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

module.exports.on('initNode', function( token ){
	var node = module.exports.nodes[ token ];
	if( node ) {
		node.instance.CommandClass['COMMAND_CLASS_CENTRAL_SCENE'].on('report', function( command, report ){
			if( command.name === 'CENTRAL_SCENE_NOTIFICATION' ) {
				var remote_value = {
					"button": report['Scene Number'].toString(),
					"scene": report.Properties1['Key Attributes']
				};
				Homey.manager('flow').triggerDevice('wall_switch', null, remote_value, node.device_data);
			}
		});
	}
});

Homey.manager('flow').on('trigger.wall_switch', function( callback, args, state ) {
	if(state.button === args.button && state.scene === args.scene) {
		callback(null, true);
		return;
	}
	callback(null, false);
});
