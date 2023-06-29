"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onOccupancySensingClusterSettings = exports.EXTENDED_OCCUPANCY_OPERATION_MODES_ENUM = exports.OCCUPANCY_OPERATION_MODES_ENUM = void 0;
const zigbee_clusters_1 = require("zigbee-clusters");
exports.OCCUPANCY_OPERATION_MODES_ENUM = {
    manualMode: 0,
    fullAuto: 1,
    autoOnManualOff: 2,
    manualOnAutoOff: 3,
};
exports.EXTENDED_OCCUPANCY_OPERATION_MODES_ENUM = {
    ...exports.OCCUPANCY_OPERATION_MODES_ENUM,
    reserved: 4,
    testing: 5,
};
class ElkoOccupancySensingCluster extends zigbee_clusters_1.OccupancySensingCluster {
    static get ATTRIBUTES() {
        return {
            ...super.ATTRIBUTES,
            occupancyDfltOperationMode: {
                id: 0xE000,
                type: zigbee_clusters_1.ZCLDataTypes.enum8(exports.OCCUPANCY_OPERATION_MODES_ENUM),
                manufacturerId: 0x105E,
            },
            occupancyOperationMode: {
                id: 0xE001,
                type: zigbee_clusters_1.ZCLDataTypes.enum8(exports.EXTENDED_OCCUPANCY_OPERATION_MODES_ENUM),
                manufacturerId: 0x105E,
            },
            forceOffTimeout: {
                id: 0xE002,
                type: zigbee_clusters_1.ZCLDataTypes.uint16,
                manufacturerId: 0x105E,
            },
            occupancySensitivity: {
                id: 0xE003,
                type: zigbee_clusters_1.ZCLDataTypes.uint8,
                manufacturerId: 0x105E,
            },
        };
    }
}
exports.default = ElkoOccupancySensingCluster;
async function onOccupancySensingClusterSettings(device, { newSettings, changedKeys, }) {
    const occupancySensingCluster = device.zclNode.endpoints[device.getClusterEndpoint(ElkoOccupancySensingCluster) ?? 37].clusters[ElkoOccupancySensingCluster.NAME];
    // Apply changes that are not manufacturer specific
    if (changedKeys.includes('pirOccupiedToUnoccupiedDelay')) {
        const newAttributeValues = {
            pirOccupiedToUnoccupiedDelay: newSettings.pirOccupiedToUnoccupiedDelay,
        };
        await occupancySensingCluster.writeAttributes(newAttributeValues).then(res => device.log("Occupancy setting change", newAttributeValues, "result:", res));
    }
    // Apply changes to manufacturer specific attributes
    const newAttributeValues = {};
    if (changedKeys.includes('occupancyOperationMode')) {
        newAttributeValues.occupancyDfltOperationMode = newSettings.occupancyOperationMode;
    }
    if (changedKeys.includes('forceOffTimeout')) {
        newAttributeValues.forceOffTimeout = newSettings.forceOffTimeout;
    }
    if (Object.keys(newAttributeValues).length !== 0) {
        await occupancySensingCluster
            .writeAttributes(newAttributeValues)
            .then(res => device.log("Occupancy sensor setting change", newAttributeValues, "result:", res));
    }
}
exports.onOccupancySensingClusterSettings = onOccupancySensingClusterSettings;
//# sourceMappingURL=ElkoOccupancySensingCluster.js.map