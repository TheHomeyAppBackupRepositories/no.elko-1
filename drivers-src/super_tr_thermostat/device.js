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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zigbee_clusters_1 = require("zigbee-clusters");
const ElkoThermostatCluster_1 = __importStar(require("../../lib/cluster/ElkoThermostatCluster"));
const attributeDevice_1 = require("@drenso/homey-zigbee-library/lib/attributeDevice");
const thermostat_1 = __importDefault(require("../../lib/device/thermostat"));
zigbee_clusters_1.Cluster.addCluster(ElkoThermostatCluster_1.default);
class ElkoSuperThermostat extends thermostat_1.default {
    async onNodeInit(payload) {
        await super.onNodeInit(payload);
        if (this.hasCapability('meter_power')) {
            await this.removeCapability('meter_power').catch(this.error);
        }
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
                this.log(`handle report (cluster: ${ElkoThermostatCluster_1.default.NAME}, capability: target_temperature), parsed payload:`, parsedValue);
            }
            if (this.hasCapability('command_regulator_duty_cycle')) {
                await this.setCapabilityValue('command_regulator_duty_cycle', parsedValue);
                this.log(`handle report (cluster: ${ElkoThermostatCluster_1.default.NAME}, capability: command_regulator_duty_cycle), parsed payload:`, parsedValue);
            }
        };
        const initialValues = await this.zclNode.endpoints[1].clusters[ElkoThermostatCluster_1.default.NAME].readAttributes([
            'occupiedHeatingSetpoint', 'load', 'sensor', 'maxFloorTemperature', 'calibration', 'regulatorMode', 'regulatorTime',
        ]).catch(this.error);
        if (this.isFirstInit() && !initialValues) {
            throw new Error(this.homey.__('initFailed'));
        }
        this.log('Initial attribute values:', initialValues);
        /**
         * Initialise setting synchronisation
         **/
        const simpleSettings = ['load', 'maxFloorTemperature', 'calibration', 'regulatorTime'];
        const settings = ['regulatorMode', 'sensor', ...simpleSettings];
        const configureReportingPromise = this.configureAttributeReporting(settings.map((setting) => ({
            cluster: ElkoThermostatCluster_1.default,
            attributeName: setting,
        })));
        if (this.isFirstInit()) {
            await configureReportingPromise;
        }
        else {
            configureReportingPromise.catch(this.error);
        }
        for (const simpleSetting of simpleSettings) {
            this.zclNode.endpoints[this.getClusterEndpoint(ElkoThermostatCluster_1.default) ?? 1].clusters[ElkoThermostatCluster_1.default.NAME].on(`attr.${simpleSetting}`, async (value) => {
                await this.addToPromiseQueue(() => this.setSettings({
                    [simpleSetting]: value,
                }).catch(this.error));
            });
            if (initialValues) {
                await this.setSettings({
                    [simpleSetting]: initialValues[simpleSetting],
                }).catch(this.error);
            }
        }
        // The regulator mode needs to update the capabilities
        const handleRegulatorReport = async (isRegulator) => {
            await this.addToPromiseQueue(() => this.setSettings({
                regulatorFunction: isRegulator ? 'regulator' : 'thermostat',
            }));
            await this.updateModeCapabilities(isRegulator);
        };
        this.zclNode.endpoints[this.getClusterEndpoint(ElkoThermostatCluster_1.default) ?? 1].clusters[ElkoThermostatCluster_1.default.NAME].on('attr.regulatorMode', async (isRegulator) => {
            try {
                await handleRegulatorReport(isRegulator);
                const currentTargetValue = await this.zclNode.endpoints[1].clusters[ElkoThermostatCluster_1.default.NAME].readAttributes(['occupiedHeatingSetpoint']);
                await handleTargetReport(currentTargetValue.occupiedHeatingSetpoint);
                if (!isRegulator) {
                    await this.setCapabilityValue('measure_temperature', this.getCapabilityValue(this.getSetting('sensor') === 'floor' ? 'display_floor_temperature' : 'display_air_temperature'));
                }
            }
            catch (e) {
                this.error(e);
            }
        });
        if (initialValues) {
            await handleRegulatorReport(initialValues.regulatorMode).catch(this.error);
            await handleTargetReport(initialValues.occupiedHeatingSetpoint).catch(this.error);
        }
        // The sensor mode needs to update the current temperature
        const handleSensorReport = async (value) => {
            await this.addToPromiseQueue(() => this.setSettings({
                sensor: value,
            }));
            if (this.hasCapability('measure_temperature')) {
                await this.setCapabilityValue('measure_temperature', this.getCapabilityValue(value === 'floor' ? 'display_floor_temperature' : 'display_air_temperature'));
            }
        };
        this.zclNode.endpoints[this.getClusterEndpoint(ElkoThermostatCluster_1.default) ?? 1].clusters[ElkoThermostatCluster_1.default.NAME].on(`attr.sensor`, (value) => handleSensorReport(value).catch(this.error));
        if (initialValues) {
            await handleSensorReport(initialValues.sensor).catch(this.error);
        }
        /**
         * Initialise capabilities
         **/
        // We only set one capability at a time
        // Use a custom event handler to work around Homey limitations
        const reportingPromise = this.configureAttributeReporting([{
                cluster: ElkoThermostatCluster_1.default,
                attributeName: 'occupiedHeatingSetpoint',
                minChange: 10,
            }]);
        if (this.isFirstInit()) {
            await reportingPromise;
        }
        else {
            reportingPromise.catch(this.error);
        }
        this.zclNode.endpoints[this.getClusterEndpoint(ElkoThermostatCluster_1.default) ?? 1].clusters[ElkoThermostatCluster_1.default.NAME].on('attr.occupiedHeatingSetpoint', (value) => handleTargetReport(value).catch(this.error));
        if (initialValues) {
            await handleTargetReport(initialValues.occupiedHeatingSetpoint).catch(this.error);
        }
        const handleTargetSet = async (value) => {
            const parsedValue = Math.round(value * 100);
            await this.zclNode.endpoints[this.getClusterEndpoint(ElkoThermostatCluster_1.default) ?? 1].clusters[ElkoThermostatCluster_1.default.NAME].writeAttributes({
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
        await (0, attributeDevice_1.initReadOnlyCapability)(this, payload.zclNode, 'display_air_temperature', ElkoThermostatCluster_1.default, 'localTemperature', value => handleAirTempReport(value).catch(this.error));
        await (0, attributeDevice_1.initReadOnlyCapability)(this, payload.zclNode, 'display_floor_temperature', ElkoThermostatCluster_1.default, 'externalTemperature', value => handleFloorTempReport(value).catch(this.error));
        await (0, attributeDevice_1.initReadWriteCapability)(this, payload.zclNode, 'onoff', ElkoThermostatCluster_1.default, 'powerStatus');
        const handleRelayReport = async (value) => {
            await this.setCapabilityValue('measure_power', value ? this.getSetting('load') : 0);
            return value;
        };
        await (0, attributeDevice_1.initReadOnlyCapability)(this, payload.zclNode, 'display_heating', ElkoThermostatCluster_1.default, 'relayState', value => handleRelayReport(value).catch(this.error));
        await (0, attributeDevice_1.initReadWriteCapability)(this, payload.zclNode, 'command_night_mode', ElkoThermostatCluster_1.default, 'nightSwitching');
        await (0, attributeDevice_1.initReadWriteCapability)(this, payload.zclNode, 'command_child_lock', ElkoThermostatCluster_1.default, 'childLock');
        await (0, attributeDevice_1.initReadWriteCapability)(this, payload.zclNode, 'command_frost_guard', ElkoThermostatCluster_1.default, 'frostGuard');
    }
    async onSettings(settingsEvent) {
        await this.addToPromiseQueue(async () => {
            if (settingsEvent.changedKeys.includes('load')) {
                await this.setCapabilityValue('measure_power', this.getCapabilityValue('display_heating') ? settingsEvent.newSettings.load : 0);
            }
            await (0, ElkoThermostatCluster_1.onSuperTrThermostatSettings)(this, settingsEvent);
        });
    }
    async displayText(text) {
        await this.zclNode.endpoints[this.getClusterEndpoint(ElkoThermostatCluster_1.default) ?? 1].clusters[ElkoThermostatCluster_1.default.NAME].writeAttributes({
            display_text: text,
        });
    }
}
module.exports = ElkoSuperThermostat;
//# sourceMappingURL=device.js.map