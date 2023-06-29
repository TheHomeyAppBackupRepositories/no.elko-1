"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DIRECTION_ARG_ENUM = exports.PROTECTION_SENSOR_FLAGS = exports.PROTECTION_STATUS_FLAGS = exports.MODE_FLAGS = void 0;
const zigbee_clusters_1 = require("zigbee-clusters");
exports.MODE_FLAGS = ['reversedMotorDirection', 'calibrationMode', 'maintenanceMode', 'LEDFeedback'];
exports.PROTECTION_STATUS_FLAGS = ['active'];
exports.PROTECTION_SENSOR_FLAGS = ['connected'];
exports.DIRECTION_ARG_ENUM = {
    up: 0,
    down: 1,
};
class ElkoWindowCoveringCluster extends zigbee_clusters_1.WindowCoveringCluster {
    static get ATTRIBUTES() {
        return {
            ...super.ATTRIBUTES,
            mode: {
                id: 0x0017,
                type: zigbee_clusters_1.ZCLDataTypes.map8(exports.MODE_FLAGS),
            },
            driveCloseDuration: {
                id: 0xE000,
                type: zigbee_clusters_1.ZCLDataTypes.uint16,
                manufacturerId: 0x105E,
            },
            protectionStatus: {
                id: 0xE010,
                type: zigbee_clusters_1.ZCLDataTypes.map8(exports.PROTECTION_STATUS_FLAGS),
                manufacturerId: 0x105E,
            },
            protectionSensor: {
                id: 0xE013,
                type: zigbee_clusters_1.ZCLDataTypes.map8(exports.PROTECTION_SENSOR_FLAGS),
                manufacturerId: 0x105E,
            },
            sunProtectionIlluminanceThreshold: {
                id: 0xE012,
                type: zigbee_clusters_1.ZCLDataTypes.uint16,
                manufacturerId: 0x105E,
            },
            liftDriveUpTime: {
                id: 0xE014,
                type: zigbee_clusters_1.ZCLDataTypes.uint16,
                manufacturerId: 0x105E,
            },
            liftDriveDownTime: {
                id: 0xE015,
                type: zigbee_clusters_1.ZCLDataTypes.uint16,
                manufacturerId: 0x105E,
            },
            tiltOpenCloseAndStepTime: {
                id: 0xE016,
                type: zigbee_clusters_1.ZCLDataTypes.uint16,
                manufacturerId: 0x105E,
            },
            tiltPositionPercentageAfterMoveToLevel: {
                id: 0xE017,
                type: zigbee_clusters_1.ZCLDataTypes.uint8,
                manufacturerId: 0x105E,
            },
        };
    }
    static get COMMANDS() {
        return {
            ...super.COMMANDS,
            stopOrStepLiftPercentage: {
                id: 0x80,
                manufacturerId: 0x105E,
                args: {
                    direction: zigbee_clusters_1.ZCLDataTypes.enum8(exports.DIRECTION_ARG_ENUM),
                    stepValue: zigbee_clusters_1.ZCLDataTypes.uint8,
                },
            },
        };
    }
}
exports.default = ElkoWindowCoveringCluster;
//# sourceMappingURL=ElkoWindowCoveringCluster.js.map