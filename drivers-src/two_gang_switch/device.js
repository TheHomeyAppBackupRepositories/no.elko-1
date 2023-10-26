"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ElkoMultiButtonDevice_1 = __importDefault(require("../../lib/device/multiSwitch/ElkoMultiButtonDevice"));
const onOff_1 = __importDefault(require("@drenso/homey-zigbee-library/capabilities/onOff"));
class TwoGangSwitchDevice extends ElkoMultiButtonDevice_1.default {
    constructor() {
        super(...arguments);
        this.endpoints = [21, 22];
    }
    async onNodeInit(payload) {
        await super.onNodeInit(payload);
        await (0, onOff_1.default)(this, payload.zclNode, { capabilityId: 'onoff.1', endpointId: 1 });
        await (0, onOff_1.default)(this, payload.zclNode, { capabilityId: 'onoff.2', endpointId: 2 });
        await this.setWarning(this.homey.__("deprecatedRepair"));
    }
}
module.exports = TwoGangSwitchDevice;
//# sourceMappingURL=device.js.map