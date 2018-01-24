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
**2.0.1:**
Octan Remote, Soft Remote and Wall Switch:
- Add (software based) sequence support.
- Add 1x trigger for the "held down" scene (5x per second was already there).

**2.0.0:**
- Rewrite to SDKv2

Rest of the change log can be found [here](https://github.com/caseda/com.nodon/blob/master/README.md).
