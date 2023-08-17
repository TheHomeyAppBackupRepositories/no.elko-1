"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SENSOR_INT_TO_TYPE = exports.SENSOR_TYPE_TO_INT = void 0;
const zigbee_clusters_1 = require("zigbee-clusters");
exports.SENSOR_TYPE_TO_INT = {
    air: 2,
    floor: 3,
};
exports.SENSOR_INT_TO_TYPE = {
    2: 'air',
    3: 'floor',
};
class ElkoSmartPlusThermostatCluster extends zigbee_clusters_1.ThermostatCluster {
    static get ATTRIBUTES() {
        return {
            ...super.ATTRIBUTES,
            localTemperatureSourceSelect: {
                id: 0xE212,
                type: zigbee_clusters_1.ZCLDataTypes.uint8,
                manufacturerId: 0x105E,
            },
        };
    }
}
exports.default = ElkoSmartPlusThermostatCluster;
//# sourceMappingURL=ElkoSmartPlusThermostatCluster.js.map