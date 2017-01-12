# NodOn

This app adds support for NodOn devices in Homey.

## Supported Devices:
* Octan Remote - Scene triggers for all 4 buttons.
* Soft Remote - Scene triggers for all 4 buttons.
* Wall Switch - Scene triggers for both switches (including both directions).

### Scene Triggers:
* Single Click
* Double Click
* Long Press (Constantly Triggered)
* Long Press Released

### Supported Languages:
* English
* Dutch (Nederlands)

### Change Log:
**1.0.6**
Removed different wake-up interval time, needs to be 0 in homey FW v1.1.3  
If the interval value is not 0 the save button will be disabled (grayed out)

**1.0.4 & 1.0.5**
Fix an issue that creeped in when updating  
Also added battery trigger cards (re-include needed for this)

**1.0.3**
Make app ES6 (ESLint) Compliant  
Update Z-wave driver to latest (1.1.2)  
Add wake-up interval (86400 seconds, once a day)  
Added the funtion to Get battery level on wake-up  
Added Association Group hints

**1.0.2**
Update z-wave driver to latest (1.0.2)  

**1.0.1**
add support:  
Wall Switch  
  
Add mobile cards for showing battery level