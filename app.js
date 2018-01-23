'use strict';

const Homey = require('homey');

class NodOnApp extends Homey.App {
	onInit() {
		this.log(`${Homey.manifest.id} running...`);
	}
}

module.exports = NodOnApp;
