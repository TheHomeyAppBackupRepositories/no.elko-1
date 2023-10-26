"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const homey_zigbeedriver_1 = require("homey-zigbeedriver");
const onOff_1 = __importDefault(require("@drenso/homey-zigbee-library/capabilities/onOff"));
const metering_1 = __importDefault(require("@drenso/homey-zigbee-library/capabilities/metering"));
const electricalMeasurement_1 = __importDefault(require("@drenso/homey-zigbee-library/capabilities/electricalMeasurement"));
class ElkoPlug extends homey_zigbeedriver_1.ZigBeeDevice {
    async onNodeInit(payload) {
        await super.onNodeInit(payload);
        await (0, onOff_1.default)(this, payload.zclNode, { pollInterval: 10000 });
        await (0, metering_1.default)(this, payload.zclNode, { noPowerFactorReporting: true });
        await (0, electricalMeasurement_1.default)(this, payload.zclNode, { noPowerFactorReporting: true });
    }
}
module.exports = ElkoPlug;
//# sourceMappingURL=device.js.map