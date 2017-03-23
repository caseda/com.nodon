# NodOn

This app adds support for NodOn Z-Wave devices in Homey.

## Supported Devices:
* Octan Remote - Scene triggers for all 4 buttons.
* Soft Remote - Scene triggers for all 4 buttons.
* Wall Switch - Scene triggers for both switches (in both directions).
* Smart Plug.
* Micro Smart Plug.

### Scene Triggers:
* Single Press
* Double Press
* Long Press (Constantly Triggered)
* Long Press Released

### Supported Languages:
* English
* Dutch (Nederlands)

### Saving settings:
For battery devices it's best to press a button 2 seconds Before pressing the save button.  
This will make it 100% sure the device takes the new settings (immediately).

### Change Log:
**1.1.0:**
- Add support Micro Smart Plug (both E-type and Schuko plugs)
- Add support Smart Plug (both E-type and Schuko plugs)
- Add settings for using the remotes and wall switch other then with Scenes
- Add flow card to trigger when in these mode(s)
  - Node ID of homey needs to be put into the corresponding association group(s) for this to work.
  (Only necessary on devices added before app v1.1.0)
- Add the Battery Alarm capability to all battery devices (optional, re-pair needed)
- Fix settings button disabled: Removed wake-up interval (Only "0" is possible)
- Update icon Octan Remote
- Update Z-Wave driver to 1.1.8

**1.0.4 & 1.0.5:**
- Fix an issue that creeped in when updating
- Also added battery trigger cards (re-include needed for this)

**1.0.3:**
- Make app ES6 (ESLint) Compliant
- Update Z-wave driver to latest (1.1.2)
- Add wake-up interval (86400 seconds, once a day)
- Added the funtion to Get battery level on wake-up
- Added Association Group hints

**1.0.2:**
- Update z-wave driver to latest (1.0.2)

**1.0.1:**
- add support: Wall Switch
- Add mobile cards for showing battery level
