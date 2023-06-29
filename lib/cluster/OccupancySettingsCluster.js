"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onOccupancySettingsClusterSettings = exports.OCCUPANCY_ACTIONS_ENUM = void 0;
const zigbee_clusters_1 = require("zigbee-clusters");
exports.OCCUPANCY_ACTIONS_ENUM = {
    none: 0,
    setOnOff: 1,
    setBrightness: 2,
};
class OccupancySettingsCluster extends zigbee_clusters_1.Cluster {
    static get ID() {
        return 0xFF19;
    }
    static get NAME() {
        return "occupancySettings";
    }
    static get ATTRIBUTES() {
        return {
            ambienceLightThreshold: {
                id: 0x0000,
                type: zigbee_clusters_1.ZCLDataTypes.uint16,
                manufacturerId: 0x105E,
            },
            occupancyActions: {
                id: 0x0001,
                type: zigbee_clusters_1.ZCLDataTypes.enum8(exports.OCCUPANCY_ACTIONS_ENUM),
                manufacturerId: 0x105E,
            },
            unoccupiedLevelDflt: {
                id: 0x0002,
                type: zigbee_clusters_1.ZCLDataTypes.uint8,
                manufacturerId: 0x105E,
            },
            unoccupiedLevel: {
                id: 0x0003,
                type: zigbee_clusters_1.ZCLDataTypes.uint8,
                manufacturerId: 0x105E,
            },
            clusterRevision: {
                id: 0xFFFD,
                type: zigbee_clusters_1.ZCLDataTypes.uint16,
                manufacturerId: 0x105E,
            },
        };
    }
}
exports.default = OccupancySettingsCluster;
async function onOccupancySettingsClusterSettings(device, { newSettings, changedKeys, }) {
    const occupancySettingsCluster = device.zclNode.endpoints[device.getClusterEndpoint(OccupancySettingsCluster) ?? 37].clusters[OccupancySettingsCluster.NAME];
    const newAttributeValues = {};
    if (changedKeys.includes('occupancyAction')) {
        newAttributeValues.occupancyActions = newSettings.occupancyAction;
    }
    if (changedKeys.includes('unoccupiedLevelDflt')) {
        const newUnoccupiedLevel = newSettings.unoccupiedLevelDflt;
        newAttributeValues.unoccupiedLevelDflt = Math.floor(newUnoccupiedLevel * 255 / 100);
    }
    if (Object.keys(newAttributeValues).length !== 0) {
        await occupancySettingsCluster
            .writeAttributes(newAttributeValues)
            .then(res => device.log("Occupancy setting change", newAttributeValues, "result:", res));
    }
}
exports.onOccupancySettingsClusterSettings = onOccupancySettingsClusterSettings;
//# sourceMappingURL=OccupancySettingsCluster.js.map