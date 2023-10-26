"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onLevelControlClusterSettings = void 0;
const zigbee_clusters_1 = require("zigbee-clusters");
async function onLevelControlClusterSettings(device, { newSettings, changedKeys, }, endpoint) {
    const levelControlCluster = device.zclNode.endpoints[endpoint ?? device.getClusterEndpoint(zigbee_clusters_1.CLUSTER.LEVEL_CONTROL) ?? 3].clusters[zigbee_clusters_1.CLUSTER.LEVEL_CONTROL.NAME];
    const newAttributeValues = {};
    if (changedKeys.includes('onLevel') || changedKeys.includes('usePreviousOnLevel')) {
        if (newSettings.usePreviousOnLevel) {
            newAttributeValues.onLevel = 0xFF;
        }
        else {
            newAttributeValues.onLevel = Math.round(newSettings.onLevel * 254 / 100);
        }
    }
    if (Object.keys(newAttributeValues).length !== 0) {
        const response = await levelControlCluster
            .writeAttributes(newAttributeValues);
        device.log('Level control settings change', newAttributeValues, 'result', response.attributes[0].status);
        if (response.attributes[0].status !== 'SUCCESS') {
            throw new Error(device.homey.__("dimmer.invalidOnLevel"));
        }
    }
}
exports.onLevelControlClusterSettings = onLevelControlClusterSettings;
//# sourceMappingURL=ElkoLevelControlCluster.js.map