"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onBallastConfigurationClusterSettings = exports.DIM_CONTROL_MODES_ENUM = void 0;
const zigbee_clusters_1 = require("zigbee-clusters");
exports.DIM_CONTROL_MODES_ENUM = {
    automatic: 0,
    rcMode: 1,
    rlMode: 2,
    rlLED: 3,
};
class ElkoBallastConfigurationCluster extends zigbee_clusters_1.BallastConfigurationCluster {
    static get ATTRIBUTES() {
        return {
            ...super.ATTRIBUTES,
            controlMode: {
                id: 0xE000,
                type: zigbee_clusters_1.ZCLDataTypes.enum8(exports.DIM_CONTROL_MODES_ENUM),
                manufacturerId: 0x105E,
            },
        };
    }
}
exports.default = ElkoBallastConfigurationCluster;
async function onBallastConfigurationClusterSettings(device, { newSettings, changedKeys, }, endpoint) {
    const ballastConfigurationCluster = device.zclNode.endpoints[endpoint ?? device.getClusterEndpoint(zigbee_clusters_1.CLUSTER.BALLAST_CONFIGURATION) ?? 3].clusters[zigbee_clusters_1.CLUSTER.BALLAST_CONFIGURATION.NAME];
    if (changedKeys.includes('controlMode')) {
        const newAttributeValues = {
            controlMode: newSettings.controlMode,
        };
        const response = await ballastConfigurationCluster.writeAttributes(newAttributeValues);
        device.log('Ballast configuration settings change', newAttributeValues, 'result', response.attributes[0].status);
        if (response.attributes[0].status !== 'SUCCESS') {
            throw new Error(device.homey.__("dimmer.invalidControlMode"));
        }
    }
    const newAttributeValues = {};
    if (changedKeys.includes('ballastMinLevel')) {
        newAttributeValues.minLevel = Math.round(newSettings.ballastMinLevel * 254 / 100);
    }
    if (changedKeys.includes('ballastMaxLevel')) {
        newAttributeValues.maxLevel = Math.round(newSettings.ballastMaxLevel * 254 / 100);
    }
    if (Object.keys(newAttributeValues).length !== 0) {
        const response = await ballastConfigurationCluster
            .writeAttributes(newAttributeValues);
        device.log('Ballast configuration settings change', newAttributeValues, 'result', response.attributes[0].status);
        if (response.attributes[0].status === 'INVALID_VALUE') {
            throw new Error(device.homey.__('dimmer.invalidBallastLevel'));
        }
    }
}
exports.onBallastConfigurationClusterSettings = onBallastConfigurationClusterSettings;
//# sourceMappingURL=ElkoBallastConfigurationCluster.js.map