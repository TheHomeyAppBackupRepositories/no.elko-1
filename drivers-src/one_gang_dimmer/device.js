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
class OneGangDimmerDevice extends ElkoMultiButtonDevice_1.default {
    constructor() {
        super(...arguments);
        this.endpoints = [21];
    }
    async onNodeInit(payload) {
        await super.onNodeInit(payload);
        if (this.getClass() !== 'light') {
            await this.setClass('light').catch(() => this.error('Failed to migrate the device class to light'));
        }
        if (!this.hasCapability('supports_short_release')) {
            await this.addCapability('supports_short_release').catch(() => this.error('Failed to migrate short release capability'));
        }
        await (0, dim_1.default)(this, payload.zclNode, { endpointId: 3, onOffCapabilityId: false });
        await (0, onOff_1.default)(this, payload.zclNode, { endpointId: 3 });
    }
    async onSettings(settingsEvent) {
        // Apply the changes to the button settings
        await super.onSettings(settingsEvent);
        // Apply the changes for the ballast configuration cluster
        await (0, ElkoBallastConfigurationCluster_1.onBallastConfigurationClusterSettings)(this, settingsEvent);
        // Apply the settings for the level control cluster
        await (0, ElkoLevelControlCluster_1.onLevelControlClusterSettings)(this, settingsEvent);
    }
}
module.exports = OneGangDimmerDevice;
//# sourceMappingURL=device.js.map