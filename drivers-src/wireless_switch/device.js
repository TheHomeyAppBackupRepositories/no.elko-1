"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ElkoMultiButtonDevice_1 = __importDefault(require("../../lib/device/multiSwitch/ElkoMultiButtonDevice"));
const powerConfigurationDevice_1 = __importDefault(require("@drenso/homey-zigbee-library/capabilities/powerConfigurationDevice"));
class ElkoWirelessSwitchDevice extends ElkoMultiButtonDevice_1.default {
    async onNodeInit(payload) {
        await super.onNodeInit(payload);
        await (0, powerConfigurationDevice_1.default)(this, payload.zclNode);
    }
}
module.exports = ElkoWirelessSwitchDevice;
//# sourceMappingURL=device.js.map