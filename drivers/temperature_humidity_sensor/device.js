"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const homey_zigbeedriver_1 = require("homey-zigbeedriver");
const powerConfiguration_1 = __importDefault(require("@drenso/homey-zigbee-library/capabilities/powerConfiguration"));
const measureTemperature_1 = __importDefault(require("@drenso/homey-zigbee-library/capabilities/measureTemperature"));
const measureHumidity_1 = __importDefault(require("@drenso/homey-zigbee-library/capabilities/measureHumidity"));
class ElkoTemperatureSensor extends homey_zigbeedriver_1.ZigBeeDevice {
    async onNodeInit(payload) {
        await super.onNodeInit(payload);
        await (0, powerConfiguration_1.default)(this, payload.zclNode);
        await (0, measureTemperature_1.default)(this, payload.zclNode);
        await (0, measureHumidity_1.default)(this, payload.zclNode);
    }
}
module.exports = ElkoTemperatureSensor;
//# sourceMappingURL=device.js.map