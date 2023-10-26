"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const homey_zigbeedriver_1 = require("homey-zigbeedriver");
const zigbee_clusters_1 = require("zigbee-clusters");
const OccupancySettingsCluster_1 = __importStar(require("../../lib/cluster/OccupancySettingsCluster"));
const ElkoOccupancySensingCluster_1 = __importStar(require("../../lib/cluster/ElkoOccupancySensingCluster"));
const onOff_1 = __importDefault(require("@drenso/homey-zigbee-library/capabilities/onOff"));
const measureIlluminance_1 = __importDefault(require("@drenso/homey-zigbee-library/capabilities/measureIlluminance"));
const attributeDevice_1 = require("@drenso/homey-zigbee-library/lib/attributeDevice");
zigbee_clusters_1.Cluster.addCluster(ElkoOccupancySensingCluster_1.default);
zigbee_clusters_1.Cluster.addCluster(OccupancySettingsCluster_1.default);
class ElkoMotionSwitch extends homey_zigbeedriver_1.ZigBeeDevice {
    async onNodeInit(payload) {
        await super.onNodeInit(payload);
        if (this.getClass() !== 'light') {
            await this.setClass('light').catch(() => this.error('Failed to migrate the device class to light'));
        }
        await (0, onOff_1.default)(this, payload.zclNode);
        await (0, measureIlluminance_1.default)(this, payload.zclNode);
        await (0, attributeDevice_1.initReadOnlyCapability)(this, payload.zclNode, "alarm_motion", zigbee_clusters_1.CLUSTER.OCCUPANCY_SENSING, 'occupancy', (report) => report.getBits().includes("occupied"));
    }
    async onSettings(settingsEvent) {
        await (0, OccupancySettingsCluster_1.onOccupancySettingsClusterSettings)(this, settingsEvent);
        await (0, ElkoOccupancySensingCluster_1.onOccupancySensingClusterSettings)(this, settingsEvent);
    }
}
module.exports = ElkoMotionSwitch;
//# sourceMappingURL=device.js.map