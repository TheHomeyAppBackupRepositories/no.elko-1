"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zigbee_clusters_1 = require("zigbee-clusters");
const SWITCH_ACTION_MODES_ENUM = {
    Light: 0x00,
    Light_opposite: 0xFE,
    Dimmer: 0x01,
    Dimmer_opposite: 0xFD,
    Standard_Shutter: 0x02,
    Standard_Shutter_opposite: 0xFC,
    Schneider_Shutter: 0x03,
    Schneider_Shutter_opposite: 0xFB,
    Scene: 0x04,
    Toggle_Light: 0x05,
    Toggle_Dimmer: 0x06,
    Alternate_Light: 0x07,
    Alternate_Dimmer: 0x08,
    Not_Used: 0x7F,
};
class SchneiderSwitchConfigCluster extends zigbee_clusters_1.Cluster {
    static get ID() {
        return 0xFF17;
    }
    static get NAME() {
        return "switchConfiguration";
    }
    static get ATTRIBUTES() {
        return {
            switchActions: {
                id: 0x0001,
                type: zigbee_clusters_1.ZCLDataTypes.enum8(SWITCH_ACTION_MODES_ENUM),
                manufacturerId: 0x105E,
            },
        };
    }
    static get COMMANDS() {
        return {};
    }
}
exports.default = SchneiderSwitchConfigCluster;
//# sourceMappingURL=SchneiderSwitchConfigCluster.js.map