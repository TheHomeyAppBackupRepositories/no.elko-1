"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onCycleTimeClusterSettings = void 0;
const zigbee_clusters_1 = require("zigbee-clusters");
class ElkoSmartPlusCycleTimeCluster extends zigbee_clusters_1.Cluster {
    static get ID() {
        return 0xFF16;
    }
    static get NAME() {
        return 'CycleTime';
    }
    static get ATTRIBUTES() {
        return {
            demandPercentage: {
                id: 0x0000,
                type: zigbee_clusters_1.ZCLDataTypes.uint8,
                manufacturerId: 0x105E,
            },
            cycleTime: {
                id: 0x0010,
                type: zigbee_clusters_1.ZCLDataTypes.uint16,
                manufacturerId: 0x105E,
            },
        };
    }
}
exports.default = ElkoSmartPlusCycleTimeCluster;
async function onCycleTimeClusterSettings(device, { newSettings, changedKeys, }) {
    const cluster = device.zclNode.endpoints[device.getClusterEndpoint(ElkoSmartPlusCycleTimeCluster) ?? 1].clusters[ElkoSmartPlusCycleTimeCluster.NAME];
    if (changedKeys.includes('regulatorTime')) {
        const newCycleTime = newSettings.regulatorTime * 60;
        await cluster
            .writeAttributes({
            cycleTime: newCycleTime,
        })
            .then(res => device.log('Cycle time settings changed', newCycleTime, 'result', res));
    }
}
exports.onCycleTimeClusterSettings = onCycleTimeClusterSettings;
//# sourceMappingURL=ElkoSmartPlusCycleTimeCluster.js.map