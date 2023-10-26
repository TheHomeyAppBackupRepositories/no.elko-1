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
const ElkoSmartPlusCycleTimeCluster_1 = __importStar(require("../../lib/cluster/ElkoSmartPlusCycleTimeCluster"));
const ElkoThermostatCluster_1 = __importStar(require("../../lib/cluster/ElkoThermostatCluster"));
const SchneiderTemperatureMeasurementCluster_1 = __importDefault(require("../../lib/cluster/SchneiderTemperatureMeasurementCluster"));
const ThermostatUIConfigurationCluster_1 = __importStar(require("../../lib/cluster/ThermostatUIConfigurationCluster"));
const SchneiderMeteringCluster_1 = __importDefault(require("../../lib/cluster/SchneiderMeteringCluster"));
const measureTemperature_1 = __importDefault(require("@drenso/homey-zigbee-library/capabilities/measureTemperature"));
const metering_1 = __importDefault(require("@drenso/homey-zigbee-library/capabilities/metering"));
const targetTemperature_1 = __importDefault(require("@drenso/homey-zigbee-library/capabilities/targetTemperature"));
const attributeDevice_1 = require("@drenso/homey-zigbee-library/lib/attributeDevice");
const thermostat_1 = __importDefault(require("../../lib/device/thermostat"));
zigbee_clusters_1.Cluster.addCluster(ElkoThermostatCluster_1.default);
zigbee_clusters_1.Cluster.addCluster(ElkoSmartPlusCycleTimeCluster_1.default);
zigbee_clusters_1.Cluster.addCluster(SchneiderTemperatureMeasurementCluster_1.default);
zigbee_clusters_1.Cluster.addCluster(ThermostatUIConfigurationCluster_1.default);
zigbee_clusters_1.Cluster.addCluster(SchneiderMeteringCluster_1.default);
class ElkoSmartPlusThermostatDevice extends thermostat_1.default {
    constructor() {
        super(...arguments);
        this.targetTemperatureConfigured = false;
    }
    async onNodeInit(payload) {
        await super.onNodeInit(payload);
        if (!this.hasCapability('command_child_lock')) {
            await this.addCapability('command_child_lock');
        }
        await (0, measureTemperature_1.default)(this, payload.zclNode, {
            cluster: ElkoThermostatCluster_1.default,
            attributeName: 'localTemperature',
        }).catch(this.error);
        await (0, measureTemperature_1.default)(this, payload.zclNode, {
            capabilityId: 'display_air_temperature',
            endpointId: 2,
        }).catch(this.error);
        await (0, measureTemperature_1.default)(this, payload.zclNode, {
            capabilityId: 'display_floor_temperature',
            endpointId: 3,
        }).catch(this.error);
        if (this.hasCapability('target_temperature')) {
            await (0, targetTemperature_1.default)(this, payload.zclNode).catch(this.error);
            this.targetTemperatureConfigured = true;
        }
        await (0, attributeDevice_1.initReadWriteCapability)(this, payload.zclNode, 'command_child_lock', ThermostatUIConfigurationCluster_1.default, 'keypadLockout', (value) => ThermostatUIConfigurationCluster_1.KEYPAD_LOCKOUT_ENUM[value] !== ThermostatUIConfigurationCluster_1.KEYPAD_LOCKOUT_ENUM.no_lockout, (value) => value ? ThermostatUIConfigurationCluster_1.KEYPAD_LOCKOUT_ENUM.level_5 : ThermostatUIConfigurationCluster_1.KEYPAD_LOCKOUT_ENUM.no_lockout).catch(this.error);
        await (0, metering_1.default)(this, payload.zclNode).catch(this.error);
        /************
         * SETTINGS *
         ************/
        await this.configureAttributeReporting([
            // demandPercentage
            {
                endpointId: 1,
                cluster: ElkoSmartPlusCycleTimeCluster_1.default,
                attributeName: 'demandPercentage',
            },
            // load
            {
                endpointId: 5,
                cluster: SchneiderMeteringCluster_1.default,
                attributeName: 'fixedLoadDemand',
            },
            // sensor
            {
                endpointId: 1,
                cluster: ElkoThermostatCluster_1.default,
                attributeName: 'localTemperatureSourceSelect',
            },
            // air_calibration
            {
                endpointId: 2,
                cluster: SchneiderTemperatureMeasurementCluster_1.default,
                attributeName: 'sensorCorrection',
            },
            // floor_calibration
            {
                endpointId: 3,
                cluster: SchneiderTemperatureMeasurementCluster_1.default,
                attributeName: 'sensorCorrection',
            },
            // floor_sensor
            {
                endpointId: 3,
                cluster: SchneiderTemperatureMeasurementCluster_1.default,
                attributeName: 'temperatureSensorType',
            },
        ]).catch(this.error);
        // Regulator control
        await this.zclNode.endpoints[1].clusters[ElkoThermostatCluster_1.default.NAME]
            .readAttributes(['controlType'])
            .then(async (response) => {
            const isRegulator = response['controlType'] === 'None';
            await this.setSettings({ regulatorFunction: isRegulator ? 'regulator' : 'thermostat' }).catch(this.error);
            await this.updateModeCapabilities(isRegulator, true).catch(this.error);
            if (isRegulator) {
                await this.loadRegulatorStatus().catch(this.error);
            }
        })
            .catch(this.error);
        this.zclNode.endpoints[1].clusters[ElkoSmartPlusCycleTimeCluster_1.default.NAME].on('attr.demandPercentage', async (value) => {
            if (!this.hasCapability('command_regulator_duty_cycle')) {
                return;
            }
            await this.setCapabilityValue('command_regulator_duty_cycle', value);
            this.log(`handle report (cluster: ${ElkoThermostatCluster_1.default.NAME}, capability: command_regulator_duty_cycle), parsed payload:`, value);
        });
        this.registerCapabilityListener('command_regulator_duty_cycle', async (value) => {
            await this.zclNode.endpoints[1].clusters[ElkoSmartPlusCycleTimeCluster_1.default.NAME]
                .writeAttributes({ demandPercentage: value });
        });
        this.zclNode.endpoints[5].clusters[SchneiderMeteringCluster_1.default.NAME].on('attr.fixedLoadDemand', async (value) => await this.addToPromiseQueue(() => this.setSettings({ load: value }).catch(this.error)));
        await this.zclNode.endpoints[5].clusters[SchneiderMeteringCluster_1.default.NAME]
            .readAttributes(['fixedLoadDemand'])
            .then((response) => this.setSettings({ load: response['fixedLoadDemand'] }).catch(this.error))
            .catch(this.error);
        this.zclNode.endpoints[1].clusters[ElkoThermostatCluster_1.default.NAME].on('attr.localTemperatureSourceSelect', async (value) => await this.addToPromiseQueue(() => this.setSettings({ sensor: ElkoThermostatCluster_1.SP_SENSOR_INT_TO_TYPE[value] }).catch(this.error)));
        await this.zclNode.endpoints[1].clusters[ElkoThermostatCluster_1.default.NAME]
            .readAttributes(['localTemperatureSourceSelect'])
            .then(response => this.setSettings({ sensor: ElkoThermostatCluster_1.SP_SENSOR_INT_TO_TYPE[response['localTemperatureSourceSelect']] }).catch(this.error))
            .catch(this.error);
        this.zclNode.endpoints[2].clusters[SchneiderTemperatureMeasurementCluster_1.default.NAME].on('attr.sensorCorrection', async (value) => await this.addToPromiseQueue(() => this.setSettings({ air_calibration: value }).catch(this.error)));
        await this.zclNode.endpoints[2].clusters[SchneiderTemperatureMeasurementCluster_1.default.NAME]
            .readAttributes(['sensorCorrection'])
            .then((response) => this.setSettings({ air_calibration: response['sensorCorrection'] }).catch(this.error))
            .catch(this.error);
        await this.zclNode.endpoints[3].clusters[SchneiderTemperatureMeasurementCluster_1.default.NAME]
            .readAttributes(['sensorCorrection', 'temperatureSensorType'])
            .then(response => this.setSettings({
            floor_sensor: response['temperatureSensorType'],
            floor_calibration: response['sensorCorrection'],
        }).catch(this.error))
            .catch(this.error);
        this.zclNode.endpoints[3].clusters[SchneiderTemperatureMeasurementCluster_1.default.NAME].on('attr.sensorCorrection', async (value) => await this.addToPromiseQueue(() => this.setSettings({ floor_calibration: value }).catch(this.error)));
        this.zclNode.endpoints[3].clusters[SchneiderTemperatureMeasurementCluster_1.default.NAME].on('attr.temperatureSensorType', async (value) => await this.addToPromiseQueue(() => this.setSettings({ floor_sensor: value }).catch(this.error)));
    }
    async loadRegulatorStatus() {
        await this.zclNode.endpoints[1].clusters[ElkoSmartPlusCycleTimeCluster_1.default.NAME]
            .readAttributes(['demandPercentage'])
            .then(response => this.setCapabilityValue('command_regulator_duty_cycle', response['demandPercentage']).catch(this.error));
    }
    async updateModeCapabilities(isRegulator, keepMeasure = false) {
        await super.updateModeCapabilities(isRegulator, keepMeasure);
        if (!isRegulator && !this.targetTemperatureConfigured) {
            await (0, targetTemperature_1.default)(this, this.zclNode);
            this.targetTemperatureConfigured = true;
        }
    }
    async onSettings(settingsEvent) {
        await (0, ThermostatUIConfigurationCluster_1.onThermostatUIConfigurationClusterSettings)(this, settingsEvent);
        await (0, ElkoSmartPlusCycleTimeCluster_1.onCycleTimeClusterSettings)(this, settingsEvent);
        const { newSettings, changedKeys } = settingsEvent;
        if (changedKeys.includes('regulatorFunction')) {
            const isRegulator = newSettings.regulatorFunction === 'regulator';
            await this.zclNode.endpoints[1].clusters[ElkoThermostatCluster_1.default.NAME].writeAttributes({
                controlType: isRegulator ? ElkoThermostatCluster_1.SP_CONTROL_TYPE_ENUM.None : ElkoThermostatCluster_1.SP_CONTROL_TYPE_ENUM.PI,
            }).then(res => this.log('Thermostat control type changed', newSettings.regulatorFunction, 'result', res));
            await this.updateModeCapabilities(isRegulator, true);
            if (isRegulator) {
                await this.loadRegulatorStatus().catch(this.error);
            }
        }
        if (changedKeys.includes('load')) {
            await this.zclNode.endpoints[5].clusters[SchneiderMeteringCluster_1.default.NAME].writeAttributes({
                fixedLoadDemand: newSettings.load,
            }).then(res => this.log('Thermostat load change', newSettings.load, 'result', res));
        }
        if (changedKeys.includes('sensor')) {
            const sensor = ElkoThermostatCluster_1.SP_SENSOR_TYPE_TO_INT[newSettings.sensor];
            await this.zclNode.endpoints[1].clusters[ElkoThermostatCluster_1.default.NAME].writeAttributes({
                localTemperatureSourceSelect: sensor,
            }).then(res => this.log('Thermostat sensor change', sensor, 'result', res));
        }
        if (changedKeys.includes('air_calibration')) {
            await this.zclNode.endpoints[2].clusters[SchneiderTemperatureMeasurementCluster_1.default.NAME].writeAttributes({
                sensorCorrection: newSettings.air_calibration,
            }).then(res => this.log('Thermostat air calibration change', newSettings.air_calibration, 'result', res));
        }
        if (changedKeys.includes('floor_calibration')) {
            await this.zclNode.endpoints[3].clusters[SchneiderTemperatureMeasurementCluster_1.default.NAME].writeAttributes({
                sensorCorrection: newSettings.floor_calibration,
            }).then(res => this.log('Thermostat floor calibration change', newSettings.floor_calibration, 'result', res));
        }
        if (changedKeys.includes('floor_sensor')) {
            await this.zclNode.endpoints[3].clusters[SchneiderTemperatureMeasurementCluster_1.default.NAME].writeAttributes({
                temperatureSensorType: newSettings.floor_sensor,
            }).then(res => this.log('Thermostat floor sensor change', newSettings.floor_sensor, 'result', res));
        }
    }
}
module.exports = ElkoSmartPlusThermostatDevice;
//# sourceMappingURL=device.js.map