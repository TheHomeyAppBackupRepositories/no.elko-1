"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const homey_zigbeedriver_1 = require("homey-zigbeedriver");
const zigbee_clusters_1 = require("zigbee-clusters");
const ElkoWindowCoveringCluster_1 = __importDefault(require("../../lib/cluster/ElkoWindowCoveringCluster"));
const windowCoverings_1 = __importDefault(require("@drenso/homey-zigbee-library/capabilities/windowCoverings"));
zigbee_clusters_1.Cluster.addCluster(ElkoWindowCoveringCluster_1.default);
class ElkoShutter extends homey_zigbeedriver_1.ZigBeeDevice {
    async onNodeInit(payload) {
        await super.onNodeInit(payload);
        // Add capability so its listeners are initialised correctly
        await this.addCapability("windowcoverings_tilt_set")
            .catch(e => this.error("Failed to add capability", "windowcoverings_tilt_set", e));
        await (0, windowCoverings_1.default)(this, payload.zclNode);
        // Remove the capability after if it is not currently supported
        if (!this.getSetting("hasTilt")) {
            await this.removeCapability("windowcoverings_tilt_set")
                .catch(e => this.error("Failed to remove capability", "windowcoverings_tilt_set", e));
        }
        this.log("Settings:", await payload.zclNode.endpoints[5].clusters[ElkoWindowCoveringCluster_1.default.NAME]
            .readAttributes([])
            .catch(e => this.error("Failed to read attributes:", e)));
    }
    async addTilt() {
        await this.addCapability("windowcoverings_tilt_set")
            .catch(e => this.error("Failed to add capability", "windowcoverings_tilt_set", e));
    }
    async removeTilt() {
        await this.removeCapability("windowcoverings_tilt_set")
            .catch(e => this.error("Failed to remove capability", "windowcoverings_tilt_set", e));
    }
    async onSettings({ newSettings, changedKeys }) {
        const windowCoveringCluster = this.zclNode.endpoints[5].clusters[ElkoWindowCoveringCluster_1.default.NAME];
        // Collect standard settings
        if (changedKeys.includes("reverseMotor") || changedKeys.includes("maintenanceMode")) {
            const flags = (await windowCoveringCluster.readAttributes(["Mode"]))["Mode"];
            flags.setBit(0, newSettings.reverseMotor);
            flags.setBit(2, newSettings.maintenanceMode);
            const newAttributeValues = {
                mode: flags,
            };
            await windowCoveringCluster.writeAttributes(newAttributeValues);
        }
        // Collect manufacturer specific settings
        const newWindowCoveringValues = {};
        if (changedKeys.includes("sunProtectionThreshold")) {
            newWindowCoveringValues.sunProtectionIlluminanceThreshold = newSettings.sunProtectionThreshold;
        }
        if (changedKeys.includes("timeToOpen")) {
            newWindowCoveringValues.liftDriveUpTime = newSettings.timeToOpen;
        }
        if (changedKeys.includes("timeToClose")) {
            newWindowCoveringValues.liftDriveDownTime = newSettings.timeToClose;
        }
        if (changedKeys.includes("hasTilt") || changedKeys.includes("timeToTilt")) {
            newWindowCoveringValues.tiltOpenCloseAndStepTime = newSettings.hasTilt ? newSettings.timeToTilt : 0;
        }
        if (Object.keys(newWindowCoveringValues).length !== 0) {
            await windowCoveringCluster.writeAttributes(newWindowCoveringValues);
        }
        if (changedKeys.includes("hasTilt")) {
            if (newSettings.hasTilt)
                await this.addTilt();
            else
                await this.removeTilt();
        }
    }
}
module.exports = ElkoShutter;
//# sourceMappingURL=device.js.map