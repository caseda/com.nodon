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

Rest of the change log can be found [here](https://github.com/caseda/com.nodon/blob/master/README.md).
