"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dim_1 = __importDefault(require("@drenso/homey-zigbee-library/capabilities/dim"));
const onOff_1 = __importDefault(require("@drenso/homey-zigbee-library/capabilities/onOff"));
const homey_zigbeedriver_1 = require("homey-zigbeedriver");
class ElkoOtherDimmer extends homey_zigbeedriver_1.ZigBeeDevice {
    async onNodeInit(payload) {
        if (this.getClass() !== 'light') {
            await this.setClass('light').catch(() => this.error('Failed to migrate the device class to light'));
        }
        await (0, dim_1.default)(this, payload.zclNode, { onOffCapabilityId: false, maxDimValue: 0xFF });
        await (0, onOff_1.default)(this, payload.zclNode);
    }
}
module.exports = ElkoOtherDimmer;
//# sourceMappingURL=device.js.map