"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onOnOffClusterSettings = exports.ON_TIME_RELOAD_OPTIONS_FLAGS = void 0;
const zigbee_clusters_1 = require("zigbee-clusters");
exports.ON_TIME_RELOAD_OPTIONS_FLAGS = ['cancelledByOff', 'impulseMode', null, null, null, null, null, null];
class ElkoOnOffCluster extends zigbee_clusters_1.OnOffCluster {
    static get ATTRIBUTES() {
        return {
            ...super.ATTRIBUTES,
            onTimeReload: {
                id: 0xE001,
                type: zigbee_clusters_1.ZCLDataTypes.uint32,
                manufacturerId: 0x105E,
            },
            preWarningTime: {
                id: 0xE000,
                type: zigbee_clusters_1.ZCLDataTypes.uint16,
                manufacturerId: 0x105E,
            },
            onTimeReloadOptions: {
                id: 0xE002,
                type: zigbee_clusters_1.ZCLDataTypes.map8(exports.ON_TIME_RELOAD_OPTIONS_FLAGS),
                manufacturerId: 0x105E,
            },
        };
    }
}
exports.default = ElkoOnOffCluster;
async function onOnOffClusterSettings(device, { newSettings, changedKeys, }) {
    const onOffCluster = device.zclNode.endpoints[device.getClusterEndpoint(zigbee_clusters_1.CLUSTER.ON_OFF) ?? 1].clusters[zigbee_clusters_1.CLUSTER.ON_OFF.NAME];
    const newAttributeValues = {};
    if (changedKeys.includes('autoOffTime') || changedKeys.includes('autoOff')) {
        newAttributeValues.onTimeReload = newSettings.autoOff ? newSettings.autoOffTime : 0;
    }
    if (changedKeys.includes('offResetsAutoOffTime') || changedKeys.includes('impulseMode')) {
        const flags = (await onOffCluster.readAttributes(['onTimeReloadOptions']))['onTimeReloadOptions'];
        flags.setBit(0, newSettings.offResetsAutoOffTime);
        flags.setBit(1, newSettings.impulseMode);
        newAttributeValues.onTimeReloadOptions = flags;
    }
    if (Object.keys(newAttributeValues).length != 0) {
        await onOffCluster
            .writeAttributes(newAttributeValues)
            .then(res => device.log("OnOff setting change", newAttributeValues, "result:", res));
    }
}
exports.onOnOffClusterSettings = onOnOffClusterSettings;
//# sourceMappingURL=ElkoOnOffCluster.js.map