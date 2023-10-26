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
const dimmer_1 = __importDefault(require("../../lib/device/dimmer"));
const zigbee_clusters_1 = require("zigbee-clusters");
const ElkoBallastConfigurationCluster_1 = __importStar(require("../../lib/cluster/ElkoBallastConfigurationCluster"));
const ElkoLevelControlCluster_1 = require("../../lib/cluster/ElkoLevelControlCluster");
zigbee_clusters_1.Cluster.addCluster(ElkoBallastConfigurationCluster_1.default);
class ElkoDimmer extends dimmer_1.default {
    async onNodeInit(payload) {
        await super.onNodeInit(payload);
        if (this.getClass() !== 'light') {
            await this.setClass('light').catch(() => this.error('Failed to migrate the device class to light'));
        }
    }
    async onSettings(settingsEvent) {
        // Apply the changes for the ballast configuration cluster
        await (0, ElkoBallastConfigurationCluster_1.onBallastConfigurationClusterSettings)(this, settingsEvent);
        // Apply the settings for the level control cluster
        await (0, ElkoLevelControlCluster_1.onLevelControlClusterSettings)(this, settingsEvent);
    }
}
module.exports = ElkoDimmer;
//# sourceMappingURL=device.js.map