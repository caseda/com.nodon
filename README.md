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

### Notes:
**Micro Smart Plug, wattage report:**
There are still a few Micro Smart Plugs around with old firmware (v1.07).  
These contain a bug with the reports of the wattage.  
This causes them to keep sending every change, even when nothing is attached, and the setting is ignored.  
This has been fixed in a recent firmware update (v1.55).  
You can see if you have a fixed version by an added note in the packaging that the setting's default value of 10% was changed.  

If you have a Z-Wave USB stick you can update manually.  
Contact support@nodon.fr for the latest firmware (they have a quick response time).  
Updating via Homey will be supported in the future.

**Battery Devices, saving settings:**
For battery devices it's best to press a button 2 seconds Before pressing the save button.  
This will make it 100% sure the device takes the new settings (immediately).

**Micro Smart Plug, indicator:**
The LED indicator on the Micro Smart Plug goes on again when power was lost.  
Unfortunately I can not synchronize this in the settings automatically.  
It will be resend to the device on app (re)start, or you can do it manually in the settings.

### Change Log:
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
