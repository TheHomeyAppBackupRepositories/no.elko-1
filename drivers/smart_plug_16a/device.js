"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const homey_zigbeedriver_1 = require("homey-zigbeedriver");
const onOffDevice_1 = __importDefault(require("@drenso/homey-zigbee-library/capabilities/onOffDevice"));
const meteringDevice_1 = __importDefault(require("@drenso/homey-zigbee-library/capabilities/meteringDevice"));
const electricalMeasurementDevice_1 = __importDefault(require("@drenso/homey-zigbee-library/capabilities/electricalMeasurementDevice"));
class ElkoPlug extends homey_zigbeedriver_1.ZigBeeDevice {
    async onNodeInit(payload) {
        await super.onNodeInit(payload);
        await (0, onOffDevice_1.default)(this, payload.zclNode);
        await (0, meteringDevice_1.default)(this, payload.zclNode);
        await (0, electricalMeasurementDevice_1.default)(this, payload.zclNode);
    }
}
module.exports = ElkoPlug;
//# sourceMappingURL=device.js.map