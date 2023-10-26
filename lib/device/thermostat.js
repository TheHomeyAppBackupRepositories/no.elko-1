"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const homey_zigbeedriver_1 = require("homey-zigbeedriver");
class Thermostat extends homey_zigbeedriver_1.ZigBeeDevice {
    constructor() {
        super(...arguments);
        this.promiseQueueTail = new Promise(resolve => resolve());
    }
    async addToPromiseQueue(promiseGenerator) {
        // Create a new promise that only resolves after the previous promise in the queue has resolved
        const wrappedPromise = this.promiseQueueTail.then(async () => {
            const promise = promiseGenerator();
            await promise;
            return promise;
        }).catch(async () => {
            const promise = promiseGenerator();
            await promise;
            return promise;
        });
        this.promiseQueueTail = wrappedPromise;
        return wrappedPromise;
    }
    async updateModeCapabilities(isRegulator, keepMeasure = false) {
        if (!isRegulator) {
            if (!this.hasCapability('target_temperature')) {
                await this.addCapability('target_temperature');
                if (!keepMeasure) {
                    await this.addCapability('measure_temperature');
                }
            }
            if (this.hasCapability('command_regulator_duty_cycle')) {
                await this.removeCapability('command_regulator_duty_cycle');
            }
        }
        else {
            if (this.hasCapability('target_temperature')) {
                await this.removeCapability('target_temperature');
                if (!keepMeasure) {
                    await this.removeCapability('measure_temperature');
                }
            }
            if (!this.hasCapability('command_regulator_duty_cycle')) {
                await this.addCapability('command_regulator_duty_cycle');
            }
        }
    }
}
exports.default = Thermostat;
//# sourceMappingURL=thermostat.js.map