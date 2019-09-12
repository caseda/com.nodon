# NodOn
This app adds support for NodOn Z-Wave devices in Homey.

## Supported Devices:
* Octan Remote - Button Sequence and Scene triggers for all 4 buttons.
* Soft Remote - Button Sequence and Scene triggers for all 4 buttons.
* Wall Switch - Button Sequence and Scene triggers for both switches (in both directions).
* Smart Plug.
* Micro Smart Plug.

### Scene Triggers:
* Single Press
* Double Press
* Long Press (1x / 5x per second)
* Long Press Released

### Supported Languages:
* English
* Dutch (Nederlands)

### Notes:
**Battery Devices, saving settings:**
For battery devices it's best to press a button 2 seconds Before pressing the save button.  
This will make it 100% sure the device takes the new settings (immediately).

**Micro Smart Plug, indicator:**
The LED indicator on the Micro Smart Plug goes on again when power was lost.  
Unfortunately I can not synchronize this in the settings automatically.  
It will be resend to the device on app (re)start, or you can do it manually in the settings.

**Sequences:**
Sequence's buttons can be separated by a comma ( , ) or a semicolon ( ; ).  
The buttons/switches themselves are in number, ranging from 1 to 4, going from left to right, top to bottom respectively.

### Change Log:
**2.0.3:**
- [Smart Plug] fix the app crashing when triggering on "power lost".
- Fix all icons not showing in the app.
- Update meshdriver to v1.3.3

**2.0.2:**
- Visual improvements for Homey V2 (still need to do icons)
- Using the new Homey composer now
- Update meshdriver to v1.2.29

Micro Smart Plug:
- Fix a few settings their range
- Removed the deprecated reset meter card

**2.0.1:**
Octan Remote, Soft Remote and Wall Switch:
- Add (software based) sequence support.
- Add 1x trigger for the "held down" scene (5x per second was already there).

**2.0.0:**
- Rewrite to SDKv2

**1.1.1:**
- Add LED indicator setting (Micro) Smart Plug
- Fix power notifications Smart Plug (From Homey firmware v1.3.x and higher)
- Fix association group settings (Micro) Smart Plug

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
