"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ElkoMultiButtonDevice_1 = __importDefault(require("../../lib/device/multiSwitch/ElkoMultiButtonDevice"));
const onOff_1 = __importDefault(require("@drenso/homey-zigbee-library/capabilities/onOff"));
class OneGangSwitchDevice extends ElkoMultiButtonDevice_1.default {
    constructor() {
        super(...arguments);
        this.endpoints = [21];
    }
    async onNodeInit(payload) {
        await super.onNodeInit(payload);
        if (this.getClass() !== 'light') {
            await this.setClass('light').catch(() => this.error('Failed to migrate the device class to light'));
        }
        if (!this.hasCapability('supports_short_release')) {
            await this.addCapability('supports_short_release').catch(() => this.error('Failed to migrate short release capability'));
        }
        await (0, onOff_1.default)(this, payload.zclNode, { endpointId: 1 });
    }
}
module.exports = OneGangSwitchDevice;
//# sourceMappingURL=device.js.map