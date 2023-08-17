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
const homey_zigbeedriver_1 = require("homey-zigbeedriver");
const zigbee_clusters_1 = require("zigbee-clusters");
const ElkoSmartPlusThermostatCluster_1 = __importStar(require("../../lib/cluster/ElkoSmartPlusThermostatCluster"));
const SchneiderTemperatureMeasurementCluster_1 = __importDefault(require("../../lib/cluster/SchneiderTemperatureMeasurementCluster"));
const ThermostatUIConfigurationCluster_1 = __importStar(require("../../lib/cluster/ThermostatUIConfigurationCluster"));
const SchneiderMeteringCluster_1 = __importDefault(require("../../lib/cluster/SchneiderMeteringCluster"));
const measureTemperature_1 = __importDefault(require("@drenso/homey-zigbee-library/capabilities/measureTemperature"));
const meteringDevice_1 = __importDefault(require("@drenso/homey-zigbee-library/capabilities/meteringDevice"));
const targetTemperature_1 = __importDefault(require("@drenso/homey-zigbee-library/capabilities/targetTemperature"));
const attributeDevice_1 = require("@drenso/homey-zigbee-library/lib/attributeDevice");
zigbee_clusters_1.Cluster.addCluster(ElkoSmartPlusThermostatCluster_1.default);
zigbee_clusters_1.Cluster.addCluster(SchneiderTemperatureMeasurementCluster_1.default);
zigbee_clusters_1.Cluster.addCluster(ThermostatUIConfigurationCluster_1.default);
zigbee_clusters_1.Cluster.addCluster(SchneiderMeteringCluster_1.default);
class ElkoSmartPlusThermostatDevice extends homey_zigbeedriver_1.ZigBeeDevice {
    async onNodeInit(payload) {
        await super.onNodeInit(payload);
        if (!this.hasCapability('command_child_lock')) {
            await this.addCapability('command_child_lock');
        }
        await (0, measureTemperature_1.default)(this, payload.zclNode, {
            cluster: ElkoSmartPlusThermostatCluster_1.default,
            attributeName: 'localTemperature',
        });
        await (0, measureTemperature_1.default)(this, payload.zclNode, {
            capabilityId: 'display_air_temperature',
            endpointId: 2,
        });
        await (0, measureTemperature_1.default)(this, payload.zclNode, {
            capabilityId: 'display_floor_temperature',
            endpointId: 3,
        });
        await (0, targetTemperature_1.default)(this, payload.zclNode);
        await (0, attributeDevice_1.initReadWriteCapability)(this, payload.zclNode, 'command_child_lock', ThermostatUIConfigurationCluster_1.default, 'keypadLockout', (value) => ThermostatUIConfigurationCluster_1.KEYPAD_LOCKOUT_ENUM[value] !== ThermostatUIConfigurationCluster_1.KEYPAD_LOCKOUT_ENUM.no_lockout, (value) => value ? ThermostatUIConfigurationCluster_1.KEYPAD_LOCKOUT_ENUM.level_5 : ThermostatUIConfigurationCluster_1.KEYPAD_LOCKOUT_ENUM.no_lockout);
        await (0, meteringDevice_1.default)(this, payload.zclNode);
        const values = await this.zclNode.endpoints[5].clusters[SchneiderMeteringCluster_1.default.NAME].readAttributes(['fixedLoadDemand']);
        this.log('Values:', values);
        /************
         * SETTINGS *
         ************/
        await this.configureAttributeReporting([
            // load
            {
                endpointId: 5,
                cluster: SchneiderMeteringCluster_1.default,
                attributeName: 'fixedLoadDemand',
            },
            // sensor
            {
                endpointId: 1,
                cluster: ElkoSmartPlusThermostatCluster_1.default,
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
        ]);
        this.zclNode.endpoints[5].clusters[SchneiderMeteringCluster_1.default.NAME].on('attr.fixedLoadDemand', async (value) => await this.setSettings({ load: value }));
        await this.setSettings({
            load: (await this.zclNode.endpoints[5].clusters[SchneiderMeteringCluster_1.default.NAME].readAttributes(['fixedLoadDemand']))['fixedLoadDemand'],
        });
        this.zclNode.endpoints[1].clusters[ElkoSmartPlusThermostatCluster_1.default.NAME].on('attr.localTemperatureSourceSelect', async (value) => await this.setSettings({ sensor: ElkoSmartPlusThermostatCluster_1.SENSOR_INT_TO_TYPE[value] }));
        const initialSensorType = (await this.zclNode.endpoints[1].clusters[ElkoSmartPlusThermostatCluster_1.default.NAME].readAttributes(['localTemperatureSourceSelect']))['localTemperatureSourceSelect'];
        await this.setSettings({ sensor: ElkoSmartPlusThermostatCluster_1.SENSOR_INT_TO_TYPE[initialSensorType] });
        this.zclNode.endpoints[2].clusters[SchneiderTemperatureMeasurementCluster_1.default.NAME].on('attr.sensorCorrection', async (value) => await this.setSettings({ air_calibration: value }));
        await this.setSettings({
            air_calibration: (await this.zclNode.endpoints[2].clusters[SchneiderTemperatureMeasurementCluster_1.default.NAME].readAttributes(['sensorCorrection']))['sensorCorrection'],
        });
        const initialFloorSensorSettings = await this.zclNode.endpoints[3].clusters[SchneiderTemperatureMeasurementCluster_1.default.NAME].readAttributes(['sensorCorrection', 'temperatureSensorType']);
        this.zclNode.endpoints[3].clusters[SchneiderTemperatureMeasurementCluster_1.default.NAME].on('attr.sensorCorrection', async (value) => await this.setSettings({ floor_calibration: value }));
        await this.setSettings({
            floor_calibration: initialFloorSensorSettings['sensorCorrection'],
        });
        this.zclNode.endpoints[3].clusters[SchneiderTemperatureMeasurementCluster_1.default.NAME].on('attr.temperatureSensorType', async (value) => await this.setSettings({ floor_sensor: value }));
        await this.setSettings({
            floor_sensor: initialFloorSensorSettings['temperatureSensorType'],
        });
    }
    async onSettings({ newSettings, changedKeys, }) {
        if (changedKeys.includes('load')) {
            await this.zclNode.endpoints[5].clusters[SchneiderMeteringCluster_1.default.NAME].writeAttributes({
                fixedLoadDemand: newSettings.load,
            }).then(res => this.log('Thermostat load change', newSettings.load, 'result', res));
        }
        if (changedKeys.includes('sensor')) {
            const sensor = ElkoSmartPlusThermostatCluster_1.SENSOR_TYPE_TO_INT[newSettings.sensor];
            await this.zclNode.endpoints[1].clusters[ElkoSmartPlusThermostatCluster_1.default.NAME].writeAttributes({
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