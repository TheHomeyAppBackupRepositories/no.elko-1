"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const homey_1 = __importDefault(require("homey"));
const homey_log_1 = require("homey-log");
const source_map_support_1 = __importDefault(require("source-map-support"));
const zigbee_clusters_1 = require("zigbee-clusters");
source_map_support_1.default.install();
function buttonListener(args, state) {
    return args.button === "any" || args.button === `${state.button}`;
}
class ElkoSchneiderApp extends homey_1.default.App {
    onInit() {
        if (homey_1.default.env.DEBUG === '1') {
            (0, zigbee_clusters_1.debug)(true);
        }
        this.homeyLog = new homey_log_1.Log({ homey: this.homey });
        this.initializeFlowListeners();
        this.log(homey_1.default.env.APP_NAME + ' has been initialized');
        return Promise.resolve();
    }
    initializeFlowListeners() {
        this.homey.flow.getDeviceTriggerCard('multi_button_short_released')
            .registerRunListener(buttonListener);
        this.homey.flow.getDeviceTriggerCard('multi_button_held')
            .registerRunListener(buttonListener);
        this.homey.flow.getDeviceTriggerCard('multi_button_long_released')
            .registerRunListener(buttonListener);
        this.homey.flow.getActionCard('command_regulator_duty_cycle_set')
            .registerRunListener(async (args) => {
            await args.device.triggerCapabilityListener('command_regulator_duty_cycle', args.command_duty_cycle);
        });
    }
}
module.exports = ElkoSchneiderApp;
//# sourceMappingURL=app.js.map