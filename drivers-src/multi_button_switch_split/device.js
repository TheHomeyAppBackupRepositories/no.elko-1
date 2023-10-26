"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ElkoMultiButtonDevice_1 = __importDefault(require("../../lib/device/multiSwitch/ElkoMultiButtonDevice"));
const onOff_1 = __importDefault(require("@drenso/homey-zigbee-library/capabilities/onOff"));
class ElkoMultiButtonSwitchDevice extends ElkoMultiButtonDevice_1.default {
    async onNodeInit(payload) {
        await super.onNodeInit(payload);
        const isSubDevice = this.isSubDevice();
        await (0, onOff_1.default)(this, payload.zclNode, {
            endpointId: isSubDevice ? 2 : 1,
        });
    }
}
module.exports = ElkoMultiButtonSwitchDevice;
//# sourceMappingURL=device.js.map