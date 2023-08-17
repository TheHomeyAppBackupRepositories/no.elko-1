"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const homey_zigbeedriver_1 = require("homey-zigbeedriver");
const zigbee_clusters_1 = require("zigbee-clusters");
const ElkoSuperTRThermostatCluster_1 = __importStar(require("../../lib/cluster/ElkoSuperTRThermostatCluster"));
const attributeDevice_1 = require("@drenso/homey-zigbee-library/lib/attributeDevice");
zigbee_clusters_1.Cluster.addCluster(ElkoSuperTRThermostatCluster_1.default);
class ElkoSuperThermostat extends homey_zigbeedriver_1.ZigBeeDevice {
    async onNodeInit(payload) {
        await super.onNodeInit(payload);
        const tempReportParser = (value) => {
            // Value comes from int16
            // Check for invalid values
            if (value == 0x8000)
                return null;
            if (value < -0x154D || value > 0x7FFE) {
                this.error('Temperature value outside valid range');
                return null;
            }
            // MeasuredValue represents the temperature in degrees Celsius as follows:
            // MeasuredValue = 100 x Temperature in degrees Celsius
            return Math.round((value / 100) * 10) / 10;
        };
        const handleTargetReport = async (value) => {
            const parsedValue = tempReportParser(value);
            if (this.hasCapability('target_temperature')) {
                await this.setCapabilityValue('target_temperature', parsedValue);
                this.log(`handle report (cluster: ${ElkoSuperTRThermostatCluster_1.default.NAME}, capability: target_temperature), parsed payload:`, parsedValue);
            }
            if (this.hasCapability('command_regulator_duty_cycle')) {
                await this.setCapabilityValue('command_regulator_duty_cycle', parsedValue);
                this.log(`handle report (cluster: ${ElkoSuperTRThermostatCluster_1.default.NAME}, capability: command_regulator_duty_cycle), parsed payload:`, parsedValue);
            }
        };
        const initialValues = await this.zclNode.endpoints[1].clusters[ElkoSuperTRThermostatCluster_1.default.NAME].readAttributes([
            'occupiedHeatingSetpoint', 'load', 'sensor', 'maxFloorTemperature', 'calibration', 'regulatorMode', 'regulatorTime',
        ]);
        this.log('Initial attribute values:', initialValues);
        /**
         * Initialise setting synchronisation
         **/
        const simpleSettings = ['load', 'maxFloorTemperature', 'calibration', 'regulatorTime'];
        const settings = ['regulatorMode', 'sensor', ...simpleSettings];
        await this.configureAttributeReporting(settings.map((setting) => ({
            cluster: ElkoSuperTRThermostatCluster_1.default,
            attributeName: setting,
        })));
        for (const simpleSetting of simpleSettings) {
            this.zclNode.endpoints[this.getClusterEndpoint(ElkoSuperTRThermostatCluster_1.default) ?? 1].clusters[ElkoSuperTRThermostatCluster_1.default.NAME].on(`attr.${simpleSetting}`, async (value) => {
                await this.setSettings({
                    [simpleSetting]: value,
                }).catch(this.error);
            });
            await this.setSettings({
                [simpleSetting]: initialValues[simpleSetting],
            });
        }
        // The regulator mode needs to update the capabilities
        const handleRegulatorReport = async (isRegulator) => {
            await this.setSettings({
                regulatorFunction: isRegulator ? 'regulator' : 'thermostat',
            });
            if (!isRegulator) {
                if (!this.hasCapability('target_temperature')) {
                    await this.addCapability('target_temperature');
                    await this.addCapability('measure_temperature');
                }
                if (this.hasCapability('command_regulator_duty_cycle')) {
                    await this.removeCapability('command_regulator_duty_cycle');
                }
            }
            else {
                if (this.hasCapability('target_temperature')) {
                    await this.removeCapability('target_temperature');
                    await this.removeCapability('measure_temperature');
                }
                if (!this.hasCapability('command_regulator_duty_cycle')) {
                    await this.addCapability('command_regulator_duty_cycle');
                }
            }
        };
        this.zclNode.endpoints[this.getClusterEndpoint(ElkoSuperTRThermostatCluster_1.default) ?? 1].clusters[ElkoSuperTRThermostatCluster_1.default.NAME].on('attr.regulatorMode', async (isRegulator) => {
            try {
                await handleRegulatorReport(isRegulator);
                const currentTargetValue = await this.zclNode.endpoints[1].clusters[ElkoSuperTRThermostatCluster_1.default.NAME].readAttributes(['occupiedHeatingSetpoint']);
                await handleTargetReport(currentTargetValue.occupiedHeatingSetpoint);
                if (!isRegulator) {
                    await this.setCapabilityValue('measure_temperature', this.getCapabilityValue(this.getSetting('sensor') === 'floor' ? 'display_floor_temperature' : 'display_air_temperature'));
                }
            }
            catch (e) {
                this.error(e);
            }
        });
        await handleRegulatorReport(initialValues.regulatorMode);
        await handleTargetReport(initialValues.occupiedHeatingSetpoint);
        // The sensor mode needs to update the current temperature
        const handleSensorReport = async (value) => {
            await this.setSettings({
                sensor: value,
            });
            if (this.hasCapability('measure_temperature')) {
                await this.setCapabilityValue('measure_temperature', this.getCapabilityValue(value === 'floor' ? 'display_floor_temperature' : 'display_air_temperature'));
            }
        };
        this.zclNode.endpoints[this.getClusterEndpoint(ElkoSuperTRThermostatCluster_1.default) ?? 1].clusters[ElkoSuperTRThermostatCluster_1.default.NAME].on(`attr.sensor`, (value) => handleSensorReport(value).catch(this.error));
        await handleSensorReport(initialValues.sensor);
        /**
         * Initialise capabilities
         **/
        // We only set one capability at a time
        // Use a custom event handler to work around Homey limitations
        await this.configureAttributeReporting([{
                cluster: ElkoSuperTRThermostatCluster_1.default,
                attributeName: 'occupiedHeatingSetpoint',
                minChange: 10,
            }]);
        this.zclNode.endpoints[this.getClusterEndpoint(ElkoSuperTRThermostatCluster_1.default) ?? 1].clusters[ElkoSuperTRThermostatCluster_1.default.NAME].on('attr.occupiedHeatingSetpoint', (value) => handleTargetReport(value).catch(this.error));
        await handleTargetReport(initialValues.occupiedHeatingSetpoint);
        const handleTargetSet = async (value) => {
            const parsedValue = Math.round(value * 100);
            await this.zclNode.endpoints[this.getClusterEndpoint(ElkoSuperTRThermostatCluster_1.default) ?? 1].clusters[ElkoSuperTRThermostatCluster_1.default.NAME].writeAttributes({
                occupiedHeatingSetpoint: parsedValue,
            });
        };
        this.registerCapabilityListener('target_temperature', value => handleTargetSet(value).catch(this.error));
        this.registerCapabilityListener('command_regulator_duty_cycle', value => handleTargetSet(value).catch(this.error));
        // The source of the current temperature can be changed
        // Shadow the correct attribute depending on this setting
        const handleAirTempReport = async (value) => {
            const parsedValue = tempReportParser(value);
            const useAirTemp = this.getSetting('sensor') !== 'floor';
            if (useAirTemp && this.hasCapability('measure_temperature')) {
                await this.setCapabilityValue('measure_temperature', parsedValue);
            }
            return parsedValue;
        };
        const handleFloorTempReport = async (value) => {
            const parsedValue = tempReportParser(value);
            const useFloorTemp = this.getSetting('sensor') === 'floor';
            if (useFloorTemp && this.hasCapability('measure_temperature')) {
                await this.setCapabilityValue('measure_temperature', parsedValue);
            }
            return parsedValue;
        };
        await (0, attributeDevice_1.initReadOnlyCapability)(this, payload.zclNode, 'display_air_temperature', ElkoSuperTRThermostatCluster_1.default, 'localTemperature', value => handleAirTempReport(value).catch(this.error));
        await (0, attributeDevice_1.initReadOnlyCapability)(this, payload.zclNode, 'display_floor_temperature', ElkoSuperTRThermostatCluster_1.default, 'externalTemperature', value => handleFloorTempReport(value).catch(this.error));
        await (0, attributeDevice_1.initReadWriteCapability)(this, payload.zclNode, 'onoff', ElkoSuperTRThermostatCluster_1.default, 'powerStatus');
        const handleRelayReport = async (value) => {
            await this.setCapabilityValue('measure_power', value ? this.getSetting('load') : 0);
            return value;
        };
        await (0, attributeDevice_1.initReadOnlyCapability)(this, payload.zclNode, 'display_heating', ElkoSuperTRThermostatCluster_1.default, 'relayState', value => handleRelayReport(value).catch(this.error));
        await (0, attributeDevice_1.initReadWriteCapability)(this, payload.zclNode, 'command_night_mode', ElkoSuperTRThermostatCluster_1.default, 'nightSwitching');
        await (0, attributeDevice_1.initReadWriteCapability)(this, payload.zclNode, 'command_child_lock', ElkoSuperTRThermostatCluster_1.default, 'childLock');
        await (0, attributeDevice_1.initReadWriteCapability)(this, payload.zclNode, 'command_frost_guard', ElkoSuperTRThermostatCluster_1.default, 'frostGuard');
    }
    async onSettings(settingsEvent) {
        await (0, ElkoSuperTRThermostatCluster_1.onSuperTrThermostatSettings)(this, settingsEvent);
    }
    async displayText(text) {
        await this.zclNode.endpoints[this.getClusterEndpoint(ElkoSuperTRThermostatCluster_1.default) ?? 1].clusters[ElkoSuperTRThermostatCluster_1.default.NAME].writeAttributes({
            display_text: text,
        });
    }
}
module.exports = ElkoSuperThermostat;
//# sourceMappingURL=device.js.map