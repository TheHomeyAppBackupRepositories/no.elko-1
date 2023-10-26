"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ElkoMultiButtonDevice_1 = __importDefault(require("../../lib/device/multiSwitch/ElkoMultiButtonDevice"));
const powerConfiguration_1 = __importDefault(require("@drenso/homey-zigbee-library/capabilities/powerConfiguration"));
class ElkoWirelessSwitchDevice extends ElkoMultiButtonDevice_1.default {
    async onNodeInit(payload) {
        await super.onNodeInit(payload);
        if (!this.hasCapability('supports_short_release')) {
            await this.addCapability('supports_short_release').catch(() => this.error('Failed to migrate short release capability'));
        }
        const powerPromise = (0, powerConfiguration_1.default)(this, payload.zclNode);
        if (this.isFirstInit()) {
            await powerPromise;
        }
        else {
            powerPromise.catch(this.error);
        }
    }
}
module.exports = ElkoWirelessSwitchDevice;
//# sourceMappingURL=device.js.map