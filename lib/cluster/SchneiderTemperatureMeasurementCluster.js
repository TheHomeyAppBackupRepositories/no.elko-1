"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FLOOR_SENSOR_TYPE_ENUM = void 0;
const zigbee_clusters_1 = require("zigbee-clusters");
exports.FLOOR_SENSOR_TYPE_ENUM = {
    none: 0xFF,
    kOhm2: 1,
    kOhm10: 2,
    kOhm12: 3,
    kOhm15: 4,
    kOhm33: 5,
    kOhm47: 6,
};
class SchneiderTemperatureMeasurementCluster extends zigbee_clusters_1.TemperatureMeasurementCluster {
    static get ATTRIBUTES() {
        return {
            ...super.ATTRIBUTES,
            sensorCorrection: {
                id: 0xE020,
                type: zigbee_clusters_1.ZCLDataTypes.int16,
                manufacturerId: 0x105E,
            },
            temperatureSensorType: {
                id: 0xE021,
                type: zigbee_clusters_1.ZCLDataTypes.enum8(exports.FLOOR_SENSOR_TYPE_ENUM),
                manufacturerId: 0x105E,
            },
        };
    }
}
exports.default = SchneiderTemperatureMeasurementCluster;
//# sourceMappingURL=SchneiderTemperatureMeasurementCluster.js.map