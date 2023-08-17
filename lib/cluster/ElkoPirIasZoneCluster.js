"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onElkoPirIasZoneClusterSettings = void 0;
const zigbee_clusters_1 = require("zigbee-clusters");
class ElkoPirIasZoneCluster extends zigbee_clusters_1.IASZoneCluster {
    static get ATTRIBUTES() {
        return {
            ...super.ATTRIBUTES,
            numberOfZoneSensitivityLevelsSupported: {
                id: 0x0012,
                type: zigbee_clusters_1.ZCLDataTypes.uint8,
            },
            currentZoneSensitivityLevel: {
                id: 0x0013,
                type: zigbee_clusters_1.ZCLDataTypes.uint8,
            },
            supervisionReportInterval: {
                id: 0xE000,
                type: zigbee_clusters_1.ZCLDataTypes.uint8,
                manufacturerId: 0x105E,
            },
            occupiedToUnoccupiedDelay: {
                id: 0xE001,
                type: zigbee_clusters_1.ZCLDataTypes.uint16,
                manufacturerId: 0x105E,
            },
        };
    }
}
exports.default = ElkoPirIasZoneCluster;
async function onElkoPirIasZoneClusterSettings(device, { newSettings, changedKeys, }) {
    const pirIasZoneCluster = device.zclNode.endpoints[device.getClusterEndpoint(ElkoPirIasZoneCluster) ?? 1].clusters[ElkoPirIasZoneCluster.NAME];
    if (changedKeys.includes('occupiedToUnoccupiedDelay')) {
        const newManufacturerAttributeValues = {
            occupiedToUnoccupiedDelay: newSettings.occupiedToUnoccupiedDelay,
        };
        await pirIasZoneCluster
            .writeAttributes(newManufacturerAttributeValues)
            .then(res => device.log("PIR IAS zone setting change", newManufacturerAttributeValues, "result:", res));
    }
    if (changedKeys.includes('currentZoneSensitivityLevel')) {
        const newAttributeValues = {
            currentZoneSensitivityLevel: newSettings.currentZoneSensitivityLevel - 1,
        };
        await pirIasZoneCluster
            .writeAttributes(newAttributeValues)
            .then(res => device.log("PIR IAS zone setting change", newAttributeValues, "result:", res));
    }
}
exports.onElkoPirIasZoneClusterSettings = onElkoPirIasZoneClusterSettings;
//# sourceMappingURL=ElkoPirIasZoneCluster.js.map