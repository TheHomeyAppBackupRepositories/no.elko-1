"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onMFGSettingsClusterSettings = exports.SOUND_MODE_ENUM = exports.LEVEL_ENUM = void 0;
const zigbee_clusters_1 = require("zigbee-clusters");
exports.LEVEL_ENUM = {
    low: 0x00,
    high: 0x01,
};
exports.SOUND_MODE_ENUM = {
    low: 0x00,
    mid: 0x01,
    high: 0x02,
};
class MFGSettingsCluster extends zigbee_clusters_1.Cluster {
    static get ID() {
        return 0xFC04;
    }
    static get NAME() {
        return 'MFGSettings';
    }
    static get ATTRIBUTES() {
        return {
            ledBrightness: {
                id: 0x0000,
                type: zigbee_clusters_1.ZCLDataTypes.enum8(exports.LEVEL_ENUM),
                manufacturerId: 0x105E,
            },
            alarmSoundLevel: {
                id: 0x0001,
                type: zigbee_clusters_1.ZCLDataTypes.enum8(exports.LEVEL_ENUM),
                manufacturerId: 0x105E,
            },
            alarmSoundMode: {
                id: 0x0002,
                type: zigbee_clusters_1.ZCLDataTypes.enum8(exports.SOUND_MODE_ENUM),
                manufacturerId: 0x105E,
            },
            lifeTime: {
                id: 0x0003,
                type: zigbee_clusters_1.ZCLDataTypes.uint8,
                manufacturerId: 0x105E,
            },
            hushDuration: {
                id: 0x0004,
                type: zigbee_clusters_1.ZCLDataTypes.uint8,
                manufacturerId: 0x105E,
            },
            testMode: {
                id: 0x0005,
                type: zigbee_clusters_1.ZCLDataTypes.bool,
                manufacturerId: 0x105E,
            },
            noDisturbMode: {
                id: 0x0006,
                type: zigbee_clusters_1.ZCLDataTypes.bool,
                manufacturerId: 0x105E,
            },
        };
    }
}
exports.default = MFGSettingsCluster;
async function onMFGSettingsClusterSettings(device, { newSettings, changedKeys, }) {
    const mfgSettingsCluster = device.zclNode.endpoints[device.getClusterEndpoint(MFGSettingsCluster) ?? 20].clusters[MFGSettingsCluster.NAME];
    const newAttributeValues = {};
    const settingNames = ['ledBrightness', 'alarmSoundLevel', 'alarmSoundMode', 'hushDuration', 'testMode', 'noDisturbMode'];
    for (const setting of settingNames) {
        if (changedKeys.includes(setting)) {
            newAttributeValues[setting] = newSettings[setting];
        }
    }
    if (Object.keys(newAttributeValues).length !== 0) {
        await mfgSettingsCluster
            .writeAttributes(newAttributeValues)
            .then(res => device.log('MFG settings change', newAttributeValues, 'result', res));
    }
}
exports.onMFGSettingsClusterSettings = onMFGSettingsClusterSettings;
//# sourceMappingURL=MFGSettingsCluster.js.map