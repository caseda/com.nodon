"use strict";

const path			= require('path');
const ZwaveDriver	= require('homey-zwavedriver');

// http://www.pepper1.net/zwavedb/device/766

module.exports = new ZwaveDriver( path.basename(__dirname), {
	//"debug": true,
	capabilities: {
		
	}
});
module.exports.on('initNode', function( token ){
	var node = module.exports.nodes[ token ];
	node.instance.CommandClass['COMMAND_CLASS_CENTRAL_SCENE'].on('report', function( command, report ){
		console.log( report );
	});
	/*if( node ) {
		node.instance.CommandClass['COMMAND_CLASS_BASIC'].on('report', function( command, report ){
			if( report['Value'] <= 0 || report['Value'] >= 255 ) {
				Homey.manager('flow').triggerDevice('FGD-212_s2', null, null, node.device_data);
			} else {
				Homey.manager('flow').triggerDevice('FGD-212_long_s2', null, null, node.device_data);
			}
		});
	}*/
});
