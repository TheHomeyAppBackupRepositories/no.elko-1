"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ElkoMultiButtonDevice_1 = __importDefault(require("../../lib/device/multiSwitch/ElkoMultiButtonDevice"));
const onOff_1 = __importDefault(require("@drenso/homey-zigbee-library/capabilities/onOff"));
const dim_1 = __importDefault(require("@drenso/homey-zigbee-library/capabilities/dim"));
class TwoGangDimmerDevice extends ElkoMultiButtonDevice_1.default {
    constructor() {
        super(...arguments);
        this.endpoints = [21, 22];
    }
    async onNodeInit(payload) {
        await super.onNodeInit(payload);
        await (0, dim_1.default)(this, payload.zclNode, {
            capabilityId: 'dim.1',
            onOffCapabilityId: false,
            endpointId: 3,
        });
        await (0, dim_1.default)(this, payload.zclNode, {
            capabilityId: 'dim.2',
            onOffCapabilityId: false,
            endpointId: 4,
        });
        await (0, onOff_1.default)(this, payload.zclNode, { capabilityId: 'onoff.1', endpointId: 3 });
        await (0, onOff_1.default)(this, payload.zclNode, { capabilityId: 'onoff.2', endpointId: 4 });
        await this.setWarning(this.homey.__("deprecatedRepair"));
    }
}
module.exports = TwoGangDimmerDevice;
//# sourceMappingURL=device.js.map