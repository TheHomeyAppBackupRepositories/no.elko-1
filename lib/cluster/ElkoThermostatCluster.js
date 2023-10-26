"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onSuperTrThermostatSettings = exports.SP_CONTROL_TYPE_ENUM = exports.SP_SENSOR_INT_TO_TYPE = exports.SP_SENSOR_TYPE_TO_INT = exports.TR_SENSOR_TYPE_ENUM = void 0;
const zigbee_clusters_1 = require("zigbee-clusters");
exports.TR_SENSOR_TYPE_ENUM = {
    air: 0,
    floor: 1,
    supervisor_floor: 3,
};
exports.SP_SENSOR_TYPE_TO_INT = {
    air: 2,
    floor: 3,
};
exports.SP_SENSOR_INT_TO_TYPE = {
    2: 'air',
    3: 'floor',
};
exports.SP_CONTROL_TYPE_ENUM = {
    OnOff: 0x00,
    PI: 0x01,
    None: 0xFF,
};
class ElkoThermostatCluster extends zigbee_clusters_1.ThermostatCluster {
    static get ATTRIBUTES() {
        return {
            ...super.ATTRIBUTES,
            // Super TR
            load: { id: 1025, type: zigbee_clusters_1.ZCLDataTypes.uint16 },
            display_text: { id: 1026, type: zigbee_clusters_1.ZCLDataTypes.string },
            sensor: { id: 1027, type: zigbee_clusters_1.ZCLDataTypes.enum8(exports.TR_SENSOR_TYPE_ENUM) },
            regulatorTime: { id: 1028, type: zigbee_clusters_1.ZCLDataTypes.uint8 },
            regulatorMode: { id: 1029, type: zigbee_clusters_1.ZCLDataTypes.bool },
            powerStatus: { id: 1030, type: zigbee_clusters_1.ZCLDataTypes.bool },
            dateTime: { id: 1031, type: zigbee_clusters_1.ZCLDataTypes.string },
            meanPower: { id: 1032, type: zigbee_clusters_1.ZCLDataTypes.uint16 },
            externalTemperature: { id: 1033, type: zigbee_clusters_1.ZCLDataTypes.int16 },
            nightSwitching: { id: 1041, type: zigbee_clusters_1.ZCLDataTypes.bool },
            frostGuard: { id: 1042, type: zigbee_clusters_1.ZCLDataTypes.bool },
            childLock: { id: 1043, type: zigbee_clusters_1.ZCLDataTypes.bool },
            maxFloorTemperature: { id: 1044, type: zigbee_clusters_1.ZCLDataTypes.uint8 },
            relayState: { id: 1045, type: zigbee_clusters_1.ZCLDataTypes.bool },
            calibration: { id: 1047, type: zigbee_clusters_1.ZCLDataTypes.int8 },
            // Smart Plus
            localTemperatureSourceSelect: {
                id: 0xE212,
                type: zigbee_clusters_1.ZCLDataTypes.uint8,
                manufacturerId: 0x105E,
            },
            controlType: {
                id: 0xE213,
                type: zigbee_clusters_1.ZCLDataTypes.enum8(exports.SP_CONTROL_TYPE_ENUM),
                manufacturerId: 0x105E,
            },
        };
    }
}
exports.default = ElkoThermostatCluster;
async function onSuperTrThermostatSettings(device, { newSettings, changedKeys, }) {
    const superTrCluster = device.zclNode
        .endpoints[device.getClusterEndpoint(ElkoThermostatCluster) ?? 1]
        .clusters[ElkoThermostatCluster.NAME];
    const newAttributeValues = {};
    const simpleSettings = ['load', 'sensor', 'maxFloorTemperature', 'calibration', 'regulatorTime'];
    for (const setting of simpleSettings) {
        if (changedKeys.includes(setting)) {
            newAttributeValues[setting] = newSettings[setting];
        }
    }
    if (changedKeys.includes('regulatorFunction')) {
        newAttributeValues.regulatorMode = newSettings.regulatorFunction == 'regulator';
    }
    if (Object.keys(newAttributeValues).length != 0) {
        await superTrCluster.writeAttributes(newAttributeValues)
            .then(res => device.log('Super TR settings change', newAttributeValues, 'result', res));
    }
}
exports.onSuperTrThermostatSettings = onSuperTrThermostatSettings;
//# sourceMappingURL=ElkoThermostatCluster.js.map