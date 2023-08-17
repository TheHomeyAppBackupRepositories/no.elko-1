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
const iasZoneDevice_1 = __importDefault(require("@drenso/homey-zigbee-library/lib/iasZoneDevice"));
const measureIlluminance_1 = __importDefault(require("@drenso/homey-zigbee-library/capabilities/measureIlluminance"));
const powerConfigurationDevice_1 = __importDefault(require("@drenso/homey-zigbee-library/capabilities/powerConfigurationDevice"));
const ElkoPirIasZoneCluster_1 = __importStar(require("../../lib/cluster/ElkoPirIasZoneCluster"));
zigbee_clusters_1.Cluster.addCluster(ElkoPirIasZoneCluster_1.default);
class ElkoContactSensor extends homey_zigbeedriver_1.ZigBeeDevice {
    async onNodeInit(payload) {
        await super.onNodeInit(payload);
        this.zclNode.endpoints[1].clusters[ElkoPirIasZoneCluster_1.default.NAME].readAttributes(['currentZoneSensitivityLevel', 'numberOfZoneSensitivityLevelsSupported']).then(res => console.log('Attributes:', res));
        await (0, iasZoneDevice_1.default)(this, payload.zclNode, ["alarm_motion"], ["alarm2"], undefined, this.isFirstInit());
        await (0, measureIlluminance_1.default)(this, payload.zclNode);
        await (0, powerConfigurationDevice_1.default)(this, payload.zclNode);
    }
    async onSettings(settingsEvent) {
        await (0, ElkoPirIasZoneCluster_1.onElkoPirIasZoneClusterSettings)(this, settingsEvent);
    }
}
module.exports = ElkoContactSensor;
//# sourceMappingURL=device.js.map