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
const ElkoMultiButtonDevice_1 = __importDefault(require("../../lib/device/multiSwitch/ElkoMultiButtonDevice"));
const zigbee_clusters_1 = require("zigbee-clusters");
const onOff_1 = __importDefault(require("@drenso/homey-zigbee-library/capabilities/onOff"));
const dim_1 = __importDefault(require("@drenso/homey-zigbee-library/capabilities/dim"));
const ElkoBallastConfigurationCluster_1 = __importStar(require("../../lib/cluster/ElkoBallastConfigurationCluster"));
const ElkoLevelControlCluster_1 = require("../../lib/cluster/ElkoLevelControlCluster");
zigbee_clusters_1.Cluster.addCluster(ElkoBallastConfigurationCluster_1.default);
class TwoGangDimmerDevice extends ElkoMultiButtonDevice_1.default {
    constructor() {
        super(...arguments);
        this.endpoints = [21, 22];
    }
    async onNodeInit(payload) {
        await super.onNodeInit(payload);
        const isSubDevice = this.isSubDevice();
        await (0, dim_1.default)(this, payload.zclNode, {
            endpointId: isSubDevice ? 4 : 3,
            onOffCapabilityId: false,
        });
        await (0, onOff_1.default)(this, payload.zclNode, {
            endpointId: isSubDevice ? 4 : 3,
        });
    }
    async onSettings(settingsEvent) {
        // Apply the changes to the button settings
        await super.onSettings(settingsEvent);
        const isSubDevice = this.isSubDevice();
        // Apply the changes for the ballast configuration cluster
        await (0, ElkoBallastConfigurationCluster_1.onBallastConfigurationClusterSettings)(this, settingsEvent, isSubDevice ? 4 : 3);
        // Apply the settings for the level control cluster
        await (0, ElkoLevelControlCluster_1.onLevelControlClusterSettings)(this, settingsEvent, isSubDevice ? 4 : 3);
    }
}
module.exports = TwoGangDimmerDevice;
//# sourceMappingURL=device.js.map