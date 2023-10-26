"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const homey_zigbeedriver_1 = require("homey-zigbeedriver");
const onOff_1 = __importDefault(require("@drenso/homey-zigbee-library/capabilities/onOff"));
const dim_1 = __importDefault(require("@drenso/homey-zigbee-library/capabilities/dim"));
class ElkoDimmerDevice extends homey_zigbeedriver_1.ZigBeeDevice {
    async onNodeInit(payload) {
        await super.onNodeInit(payload);
        await (0, dim_1.default)(this, payload.zclNode, { onOffCapabilityId: false });
        await (0, onOff_1.default)(this, payload.zclNode);
    }
}
exports.default = ElkoDimmerDevice;
//# sourceMappingURL=dimmer.js.map