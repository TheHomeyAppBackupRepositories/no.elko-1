"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onThermostatUIConfigurationClusterSettings = exports.SCHEDULE_PROGRAMMING_VISIBILITY = exports.KEYPAD_LOCKOUT_ENUM = exports.TEMPERATURE_DISPLAY_MODE_ENUM = void 0;
const zigbee_clusters_1 = require("zigbee-clusters");
exports.TEMPERATURE_DISPLAY_MODE_ENUM = {
    celsius: 0x00,
    fahrenheit: 0x01,
};
exports.KEYPAD_LOCKOUT_ENUM = {
    no_lockout: 0x00,
    level_1: 0x01,
    level_2: 0x02,
    level_3: 0x03,
    level_4: 0x04,
    level_5: 0x05,
};
exports.SCHEDULE_PROGRAMMING_VISIBILITY = {
    enabled: 0x00,
    disabled: 0x01,
};
class ThermostatUIConfigurationCluster extends zigbee_clusters_1.Cluster {
    static get ID() {
        return 0x0204;
    }
    static get NAME() {
        return 'thermostatUIConfiguration';
    }
    static get ATTRIBUTES() {
        return {
            temperatureDisplayMode: {
                id: 0x0000,
                type: zigbee_clusters_1.ZCLDataTypes.enum8(exports.TEMPERATURE_DISPLAY_MODE_ENUM),
            },
            keypadLockout: {
                id: 0x0001,
                type: zigbee_clusters_1.ZCLDataTypes.enum8(exports.KEYPAD_LOCKOUT_ENUM),
            },
            scheduleProgrammingVisibility: {
                id: 0x0002,
                type: zigbee_clusters_1.ZCLDataTypes.enum8(exports.SCHEDULE_PROGRAMMING_VISIBILITY),
            },
            brightness: {
                id: 0xe000,
                type: zigbee_clusters_1.ZCLDataTypes.uint8,
                manufacturerId: 0x105E,
            },
            inactiveBrightness: {
                id: 0xe001,
                type: zigbee_clusters_1.ZCLDataTypes.uint8,
                manufacturerId: 0x105E,
            },
            activityTimeout: {
                id: 0xe002,
                type: zigbee_clusters_1.ZCLDataTypes.uint16,
                manufacturerId: 0x105E,
            },
        };
    }
    static get COMMANDS() {
        return {};
    }
}
exports.default = ThermostatUIConfigurationCluster;
async function onThermostatUIConfigurationClusterSettings(device, { newSettings, changedKeys, }) {
    const TUIConfigurationCluster = device.zclNode.endpoints[device.getClusterEndpoint(ThermostatUIConfigurationCluster) ?? 1].clusters[ThermostatUIConfigurationCluster.NAME];
    const newAttributeValues = {};
    const settingNames = ['brightness', 'inactiveBrightness', 'activityTimeout'];
    for (const setting of settingNames) {
        if (changedKeys.includes(setting)) {
            newAttributeValues[setting] = newSettings[setting];
        }
    }
    if (Object.keys(newAttributeValues).length !== 0) {
        const response = await TUIConfigurationCluster
            .writeAttributes(newAttributeValues);
        device.log('Thermostat UI configuration settings change', newAttributeValues, 'result', response);
        if (response.attributes[0].status === 'INVALID_VALUE') {
            throw new Error(device.homey.__("thermostat.invalidBrightness"));
        }
    }
}
exports.onThermostatUIConfigurationClusterSettings = onThermostatUIConfigurationClusterSettings;
//# sourceMappingURL=ThermostatUIConfigurationCluster.js.map