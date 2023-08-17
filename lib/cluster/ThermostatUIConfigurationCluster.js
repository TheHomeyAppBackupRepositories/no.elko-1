"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCHEDULE_PROGRAMMING_VISIBILITY = exports.KEYPAD_LOCKOUT_ENUM = exports.TEMPERATURE_DISPLAY_MODE_ENUM = void 0;
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
        };
    }
    static get COMMANDS() {
        return {};
    }
}
exports.default = ThermostatUIConfigurationCluster;
//# sourceMappingURL=ThermostatUIConfigurationCluster.js.map