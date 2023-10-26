"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const homey_zigbeedriver_1 = require("homey-zigbeedriver");
const onOff_1 = __importDefault(require("@drenso/homey-zigbee-library/capabilities/onOff"));
const metering_1 = __importDefault(require("@drenso/homey-zigbee-library/capabilities/metering"));
const electricalMeasurement_1 = __importDefault(require("@drenso/homey-zigbee-library/capabilities/electricalMeasurement"));
class ElkoSocket extends homey_zigbeedriver_1.ZigBeeDevice {
    async onNodeInit(payload) {
        await super.onNodeInit(payload);
        if (!this.hasCapability('measure_power')) {
            await this.addCapability('measure_power').catch(this.error);
        }
        await (0, onOff_1.default)(this, payload.zclNode);
        await (0, metering_1.default)(this, payload.zclNode);
        await (0, electricalMeasurement_1.default)(this, payload.zclNode, { useInstantaneousDemand: true });
    }
}
module.exports = ElkoSocket;
//# sourceMappingURL=device.js.map