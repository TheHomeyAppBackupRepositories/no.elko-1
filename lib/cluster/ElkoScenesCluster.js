"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zigbee_clusters_1 = require("zigbee-clusters");
class ElkoScenesCluster extends zigbee_clusters_1.ScenesCluster {
    static get COMMANDS() {
        return {
            ...super.COMMANDS,
            storeScene: {
                id: 0x4,
                args: {
                    groupID: zigbee_clusters_1.ZCLDataTypes.uint16,
                    sceneID: zigbee_clusters_1.ZCLDataTypes.uint8,
                },
            },
            recallScene: {
                id: 0x5,
                args: {
                    groupID: zigbee_clusters_1.ZCLDataTypes.uint16,
                    sceneID: zigbee_clusters_1.ZCLDataTypes.uint8,
                },
            },
        };
    }
}
exports.default = ElkoScenesCluster;
//# sourceMappingURL=ElkoScenesCluster.js.map