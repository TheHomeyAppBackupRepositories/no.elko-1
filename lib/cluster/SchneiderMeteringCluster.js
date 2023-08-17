"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zigbee_clusters_1 = require("zigbee-clusters");
class SchneiderMeteringCluster extends zigbee_clusters_1.MeteringCluster {
    static get ATTRIBUTES() {
        return {
            ...super.ATTRIBUTES,
            fixedLoadDemand: {
                id: 0x4510,
                type: zigbee_clusters_1.ZCLDataTypes.uint24,
                manufacturerId: 0x105E,
            },
        };
    }
}
exports.default = SchneiderMeteringCluster;
//# sourceMappingURL=SchneiderMeteringCluster.js.map