"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const homey_zigbeedriver_1 = require("homey-zigbeedriver");
const zigbee_clusters_1 = require("zigbee-clusters");
const ElkoOnOffBoundCluster_1 = __importDefault(require("./boundClusters/ElkoOnOffBoundCluster"));
const SchneiderSwitchConfigCluster_1 = __importDefault(require("../../cluster/SchneiderSwitchConfigCluster"));
const ElkoLevelControlBoundCluster_1 = __importDefault(require("./boundClusters/ElkoLevelControlBoundCluster"));
const ElkoWindowCoveringCluster_1 = __importDefault(require("../../cluster/ElkoWindowCoveringCluster"));
const ElkoWindowCoveringBoundCluster_1 = __importDefault(require("./boundClusters/ElkoWindowCoveringBoundCluster"));
const ElkoScenesCluster_1 = __importDefault(require("../../cluster/ElkoScenesCluster"));
const ElkoScenesBoundCluster_1 = __importDefault(require("./boundClusters/ElkoScenesBoundCluster"));
zigbee_clusters_1.Cluster.addCluster(ElkoScenesCluster_1.default);
zigbee_clusters_1.Cluster.addCluster(ElkoWindowCoveringCluster_1.default);
zigbee_clusters_1.Cluster.addCluster(SchneiderSwitchConfigCluster_1.default);
const HELD_BUTTON_SUPPORT_CAPABILITY = "supports_held_buttons";
const LONG_RELEASE_SUPPORT_CAPABILITY = "supports_long_release";
class ElkoMultiButtonDevice extends homey_zigbeedriver_1.ZigBeeDevice {
    constructor() {
        super(...arguments);
        this.endpoints = [21, 22, 23, 24];
    }
    async onNodeInit(payload) {
        await super.onNodeInit(payload);
        if (this.isSubDevice()) {
            return;
        }
        this.short_released_trigger = this.homey.flow.getDeviceTriggerCard('multi_button_short_released');
        this.held_trigger = this.homey.flow.getDeviceTriggerCard('multi_button_held');
        this.long_released_trigger = this.homey.flow.getDeviceTriggerCard('multi_button_long_released');
        const buttonSettings = this.getButtonSettings();
        if (this.isFirstInit()) {
            await buttonSettings;
        }
        else {
            buttonSettings.catch(this.error);
        }
        const switchActions = [
            this.getEndpointSwitchAction(21) ?? 'Not_Used',
            this.getEndpointSwitchAction(22) ?? 'Not_Used',
            this.getEndpointSwitchAction(23) ?? 'Not_Used',
            this.getEndpointSwitchAction(24) ?? 'Not_Used',
        ];
        await checkHeldButtonSupport(this, ...switchActions);
        await checkLongReleaseSupport(this, ...switchActions);
        for (const endpoint of this.endpoints) {
            initOnOffEndpoint(this, endpoint, payload.zclNode);
            initLevelControlEndpoint(this, endpoint, payload.zclNode);
            initWindowCoveringEndpoint(this, endpoint, payload.zclNode);
            initScenesEndpoint(this, endpoint, payload.zclNode);
        }
        this.log("Device initialized");
    }
    async getButtonSettings() {
        for (const endpoint of this.endpoints) {
            const res = await this.zclNode.endpoints[endpoint].clusters[SchneiderSwitchConfigCluster_1.default.NAME].readAttributes(["switchActions"])
                .catch(e => this.error("Could not retrieve initial button configuration for cluster", endpoint, ":", e.message));
            if (res) {
                this.log("Config", endpoint, res);
                await this.setSettings({
                    [`switch_config_${endpoint}`]: res.switchActions,
                }).catch(this.error);
            }
        }
    }
    async onSettings({ newSettings, changedKeys, }) {
        const switchActions = [
            newSettings.switch_config_21 ?? 'Not_Used',
            newSettings.switch_config_22 ?? 'Not_Used',
            newSettings.switch_config_23 ?? 'Not_Used',
            newSettings.switch_config_24 ?? 'Not_Used',
        ];
        await checkValidButtonConfiguration(this, ...switchActions);
        for (const endpoint of this.endpoints) {
            if (changedKeys.includes(`switch_config_${endpoint}`)) {
                await this.zclNode.endpoints[endpoint].clusters[SchneiderSwitchConfigCluster_1.default.NAME]
                    .writeAttributes({ 'switchActions': newSettings[`switch_config_${endpoint}`] })
                    .then(res => this.log(`EP ${endpoint} setting change result:`, res));
            }
        }
        await checkHeldButtonSupport(this, ...switchActions);
        const supportsHeldButton = this.hasCapability(HELD_BUTTON_SUPPORT_CAPABILITY);
        await checkLongReleaseSupport(this, ...switchActions);
        const supportsLongRelease = this.hasCapability(LONG_RELEASE_SUPPORT_CAPABILITY);
        let switchConfigResult;
        if (newSettings.switch_config_23 && (newSettings.switch_config_23 != "Not_Used")) {
            switchConfigResult = "4-Push";
        }
        else if (newSettings.switch_config_22 && (newSettings.switch_config_22 != "Not_Used")) {
            switchConfigResult = "2-Gang";
        }
        else {
            switchConfigResult = "1-Gang";
        }
        return this.homey.__("multiButton.buttonSettingResult", {
            switchConfig: switchConfigResult,
            heldButton: supportsHeldButton ? 'with' : 'without',
            longRelease: supportsLongRelease ? 'with' : 'without',
        });
    }
    getEndpointSwitchAction(endpoint) {
        return this.getSetting(`switch_config_${endpoint}`);
    }
    getButtonConfiguration() {
        const endpoint_23_action = this.getEndpointSwitchAction(23) ?? 'Not_Used';
        const endpoint_22_action = this.getEndpointSwitchAction(22) ?? 'Not_Used';
        if (endpoint_23_action != "Not_Used") {
            return ButtonConfiguration.PUSH_4;
        }
        if (endpoint_22_action != "Not_Used") {
            return ButtonConfiguration.GANG_2;
        }
        return ButtonConfiguration.GANG_1;
    }
}
exports.default = ElkoMultiButtonDevice;
var ButtonConfiguration;
(function (ButtonConfiguration) {
    ButtonConfiguration[ButtonConfiguration["GANG_1"] = 0] = "GANG_1";
    ButtonConfiguration[ButtonConfiguration["GANG_2"] = 1] = "GANG_2";
    ButtonConfiguration[ButtonConfiguration["PUSH_4"] = 2] = "PUSH_4";
})(ButtonConfiguration || (ButtonConfiguration = {}));
async function checkValidButtonConfiguration(device, endpoint_21, endpoint_22, endpoint_23, endpoint_24) {
    if (endpoint_23 != "Not_Used" && endpoint_24 == "Not_Used"
        || endpoint_23 == "Not_Used" && endpoint_24 != "Not_Used") {
        throw new Error(device.homey.__("multiButton.errorThreeButton"));
    }
    if (endpoint_24 != "Not_Used") {
        // 4 button configuration
    }
    else {
        const not_allowed_unless_4_button = [
            "Standard_Shutter", "Standard_Shutter_opposite", "Toggle_Light", "Toggle_Dimmer",
        ];
        if (not_allowed_unless_4_button.includes(endpoint_21) || not_allowed_unless_4_button.includes(endpoint_22)) {
            throw new Error(device.homey.__("multiButton.errorStandardSupport"));
        }
    }
}
async function checkHeldButtonSupport(device, endpoint_21, endpoint_22, endpoint_23, endpoint_24) {
    if (endpoint_21 == "Light" || endpoint_21 == "Light_opposite" ||
        endpoint_22 == "Light" || endpoint_22 == "Light_opposite" ||
        endpoint_23 == "Light" || endpoint_23 == "Light_opposite" ||
        endpoint_24 == "Light" || endpoint_24 == "Light_opposite") {
        if (device.hasCapability(HELD_BUTTON_SUPPORT_CAPABILITY)) {
            await device.removeCapability(HELD_BUTTON_SUPPORT_CAPABILITY);
            device.log("Disabled held button support");
        }
    }
    else if (!device.hasCapability(HELD_BUTTON_SUPPORT_CAPABILITY)) {
        await device.addCapability(HELD_BUTTON_SUPPORT_CAPABILITY);
        device.log('Enabled held button support');
    }
}
async function checkLongReleaseSupport(device, endpoint_21, endpoint_22, endpoint_23, endpoint_24) {
    const longReleaseModes = ["Dimmer", "Dimmer_opposite", "Toggle_Dimmer"];
    if (longReleaseModes.includes(endpoint_21) &&
        longReleaseModes.includes(endpoint_22) &&
        longReleaseModes.includes(endpoint_23) &&
        longReleaseModes.includes(endpoint_24)) {
        if (!device.hasCapability(LONG_RELEASE_SUPPORT_CAPABILITY)) {
            await device.addCapability(LONG_RELEASE_SUPPORT_CAPABILITY);
            device.log("Enabled long release support");
        }
    }
    else if (device.hasCapability(LONG_RELEASE_SUPPORT_CAPABILITY)) {
        await device.removeCapability(LONG_RELEASE_SUPPORT_CAPABILITY);
        device.log('Disabled long release support');
    }
}
function initOnOffEndpoint(device, endpoint, zclNode) {
    zclNode.endpoints[endpoint].bind(zigbee_clusters_1.CLUSTER.ON_OFF.NAME, new ElkoOnOffBoundCluster_1.default({
        logger: () => { return; },
        onSetOn: async () => await handlePressWithCatch(device, endpoint, CommandType.ON),
        onSetOff: async () => await handlePressWithCatch(device, endpoint, CommandType.OFF),
        onToggle: async () => await handlePressWithCatch(device, endpoint, CommandType.TOGGLE),
    }));
}
function initScenesEndpoint(device, endpoint, zclNode) {
    zclNode.endpoints[endpoint].bind(ElkoScenesCluster_1.default.NAME, new ElkoScenesBoundCluster_1.default({
        logger: () => { return; },
        onStoreScene: async () => await handlePressWithCatch(device, endpoint, CommandType.STORE_SCENE),
        onRecallScene: async () => await handlePressWithCatch(device, endpoint, CommandType.RECALL_SCENE),
    }));
}
function initLevelControlEndpoint(device, endpoint, zclNode) {
    const unexpectedHandler = () => device.error("Unexpected button configuration");
    zclNode.endpoints[endpoint].bind(zigbee_clusters_1.CLUSTER.LEVEL_CONTROL.NAME, new ElkoLevelControlBoundCluster_1.default({
        logger: () => { return; },
        onMove: async (payload) => {
            const directionCommand = payload.moveMode === "up" ? CommandType.UP : CommandType.DOWN;
            await handlePressWithCatch(device, endpoint, directionCommand);
        },
        onMoveWithOnOff: async (payload) => {
            const directionCommand = payload.moveMode === "up" ? CommandType.UP : CommandType.DOWN;
            await handlePressWithCatch(device, endpoint, directionCommand);
        },
        onStop: async () => await handlePressWithCatch(device, endpoint, CommandType.STOP),
        onStopWithOnOff: async () => await handlePressWithCatch(device, endpoint, CommandType.STOP),
        onMoveToLevel: unexpectedHandler,
        onMoveToLevelWithOnOff: unexpectedHandler,
        onStep: unexpectedHandler,
        onStepWithOnOff: unexpectedHandler,
    }));
}
function initWindowCoveringEndpoint(device, endpoint, zclNode) {
    const unexpectedHandler = () => device.error("Unexpected button configuration");
    zclNode.endpoints[endpoint].bind(ElkoWindowCoveringCluster_1.default.NAME, new ElkoWindowCoveringBoundCluster_1.default({
        // logger: (command, payload) => console.log(endpoint, command, payload),
        logger: () => { return; },
        onUpOpen: async () => await handlePressWithCatch(device, endpoint, CommandType.OPEN),
        onDownClose: async () => await handlePressWithCatch(device, endpoint, CommandType.CLOSE),
        onStop: async () => await handlePressWithCatch(device, endpoint, CommandType.STOP),
        onStopOrStepLiftPercentage: async (payload) => {
            const directionCommand = payload.direction === "up" ? CommandType.STOP_UP : CommandType.STOP_DOWN;
            await handlePressWithCatch(device, endpoint, directionCommand);
        },
        onGoToLiftValue: unexpectedHandler,
        onGoToLiftPercentage: unexpectedHandler,
        onGoToTiltValue: unexpectedHandler,
        onGoToTiltPercentage: unexpectedHandler,
    }));
}
var CommandType;
(function (CommandType) {
    CommandType[CommandType["ON"] = 0] = "ON";
    CommandType[CommandType["OFF"] = 1] = "OFF";
    CommandType[CommandType["TOGGLE"] = 2] = "TOGGLE";
    CommandType[CommandType["UP"] = 3] = "UP";
    CommandType[CommandType["DOWN"] = 4] = "DOWN";
    CommandType[CommandType["STOP"] = 5] = "STOP";
    CommandType[CommandType["STOP_UP"] = 6] = "STOP_UP";
    CommandType[CommandType["STOP_DOWN"] = 7] = "STOP_DOWN";
    CommandType[CommandType["OPEN"] = 8] = "OPEN";
    CommandType[CommandType["CLOSE"] = 9] = "CLOSE";
    CommandType[CommandType["STORE_SCENE"] = 10] = "STORE_SCENE";
    CommandType[CommandType["RECALL_SCENE"] = 11] = "RECALL_SCENE";
})(CommandType || (CommandType = {}));
function getUpButton(device, endpoint, configuration) {
    switch (configuration) {
        case ButtonConfiguration.GANG_1: {
            return 1;
        }
        case ButtonConfiguration.GANG_2: {
            switch (endpoint) {
                case 21: return 1;
                case 22: return 3;
                default: throw new Error(device.homey.__("multiButton.errorUnexpectedEndpoint"));
            }
        }
        default: return null;
    }
}
function getDownButton(device, endpoint, configuration) {
    switch (configuration) {
        case ButtonConfiguration.GANG_1: {
            return 2;
        }
        case ButtonConfiguration.GANG_2: {
            switch (endpoint) {
                case 21: return 2;
                case 22: return 4;
                default: throw new Error(device.homey.__("multiButton.errorUnexpectedEndpoint"));
            }
        }
        default: return null;
    }
}
function getButton(endpoint, configuration) {
    if (configuration === ButtonConfiguration.PUSH_4) {
        switch (endpoint) {
            case 21: return 1;
            case 22: return 3;
            case 23: return 2;
            case 24: return 4;
        }
    }
    else {
        return null;
    }
}
async function triggerPress(device, button) {
    if (!button)
        throw new Error(device.homey.__("multiButton.errorUnexpectedConfig"));
    device.log("Pressed", button);
    device.short_released_trigger?.trigger(device, { button }, { button });
}
async function triggerHold(device, button) {
    if (!button)
        throw new Error(device.homey.__("multiButton.errorUnexpectedConfig"));
    if (device.hasCapability(HELD_BUTTON_SUPPORT_CAPABILITY)) {
        device.log("Held", button);
        device.held_trigger?.trigger(device, { button }, { button });
    }
    else {
        device.log("Held DISABLED");
    }
}
async function triggerLongRelease(device, button) {
    if (!button)
        throw new Error(device.homey.__("multiButton.errorUnexpectedConfig"));
    if (device.hasCapability(LONG_RELEASE_SUPPORT_CAPABILITY)) {
        device.log("Long Released", button);
        device.long_released_trigger?.trigger(device, { button }, { button });
    }
    else {
        device.log("Long Released DISABLED");
    }
}
function handlePressWithCatch(device, endpoint, command) {
    return handlePress(device, endpoint, command).catch((e) => device.error(e.message));
}
async function handlePress(device, endpoint, command) {
    const clusterMode = device.getEndpointSwitchAction(endpoint);
    const buttonConfiguration = device.getButtonConfiguration();
    const button = getButton(endpoint, buttonConfiguration);
    const upButton = getUpButton(device, endpoint, buttonConfiguration);
    const downButton = getDownButton(device, endpoint, buttonConfiguration);
    const is4Button = buttonConfiguration == ButtonConfiguration.PUSH_4;
    const configErrorMessage = device.homey.__("multiButton.errorUnexpectedConfig");
    const configUnsupportedMessage = device.homey.__("multiButton.errorUnsupportedConfig");
    switch (command) {
        // On-Off cluster
        case CommandType.ON: {
            switch (clusterMode) {
                case "Light":
                case "Dimmer":
                    if (is4Button)
                        return triggerPress(device, button);
                    else
                        return triggerPress(device, upButton);
                case "Light_opposite":
                case "Dimmer_opposite":
                    if (is4Button)
                        throw new Error(configErrorMessage);
                    else
                        return triggerPress(device, downButton);
                default: throw new Error(configErrorMessage);
            }
        }
        case CommandType.OFF: {
            switch (clusterMode) {
                case "Light":
                case "Dimmer":
                    if (is4Button)
                        throw new Error(configErrorMessage);
                    else
                        return triggerPress(device, downButton);
                case "Light_opposite":
                case "Dimmer_opposite":
                    if (is4Button)
                        return triggerPress(device, button);
                    else
                        return triggerPress(device, upButton);
                case "Toggle_Light":
                    if (is4Button)
                        return triggerHold(device, button);
                    else
                        throw new Error(configErrorMessage);
                default: throw new Error(configErrorMessage);
            }
        }
        case CommandType.TOGGLE: {
            switch (clusterMode) {
                case "Toggle_Light":
                case "Toggle_Dimmer":
                    if (is4Button)
                        return triggerPress(device, button);
                    else
                        throw new Error(configErrorMessage);
                default: throw new Error(configErrorMessage);
            }
        }
        // Level Control Cluster
        case CommandType.UP: {
            switch (clusterMode) {
                case "Dimmer":
                    if (is4Button)
                        return triggerHold(device, button);
                    else
                        return triggerHold(device, upButton);
                case "Dimmer_opposite":
                    if (is4Button)
                        throw new Error(configErrorMessage);
                    else
                        return triggerHold(device, downButton);
                case "Toggle_Dimmer":
                    if (is4Button)
                        return triggerHold(device, button);
                    else
                        throw new Error(configErrorMessage); // odd presses
                default: throw new Error(configErrorMessage);
            }
        }
        case CommandType.DOWN: {
            switch (clusterMode) {
                case "Dimmer":
                    if (is4Button)
                        throw new Error(configErrorMessage);
                    else
                        return triggerHold(device, downButton);
                case "Dimmer_opposite":
                    if (is4Button)
                        return triggerHold(device, button);
                    else
                        return triggerHold(device, upButton);
                case "Toggle_Dimmer":
                    if (is4Button)
                        return triggerHold(device, button);
                    else
                        throw new Error(configErrorMessage); // even presses
                default: throw new Error(configErrorMessage);
            }
        }
        case CommandType.STOP: {
            switch (clusterMode) {
                case "Dimmer":
                case "Dimmer_opposite":
                    if (is4Button)
                        return triggerLongRelease(device, button);
                    else
                        throw new Error(configUnsupportedMessage);
                case "Toggle_Dimmer":
                    if (is4Button)
                        return triggerLongRelease(device, button);
                    else
                        throw new Error(configErrorMessage);
                case "Standard_Shutter":
                case "Standard_Shutter_opposite":
                    if (is4Button)
                        return triggerPress(device, button);
                    else
                        throw new Error(configErrorMessage);
                default: throw new Error(configErrorMessage);
            }
        }
        case CommandType.STOP_UP: {
            switch (clusterMode) {
                case "Schneider_Shutter":
                    if (is4Button)
                        return triggerPress(device, button);
                    else
                        return triggerPress(device, upButton);
                case "Schneider_Shutter_opposite":
                    if (is4Button)
                        throw new Error(configErrorMessage);
                    else
                        return triggerPress(device, downButton);
                default: throw new Error(configErrorMessage);
            }
        }
        case CommandType.STOP_DOWN: {
            switch (clusterMode) {
                case "Schneider_Shutter_opposite":
                    if (is4Button)
                        return triggerPress(device, button);
                    else
                        return triggerPress(device, upButton);
                case "Schneider_Shutter":
                    if (is4Button)
                        throw new Error(configErrorMessage);
                    else
                        return triggerPress(device, downButton);
                default: throw new Error(configErrorMessage);
            }
        }
        case CommandType.OPEN: {
            switch (clusterMode) {
                case "Standard_Shutter":
                case "Schneider_Shutter":
                    if (is4Button)
                        return triggerHold(device, button);
                    else
                        return triggerHold(device, upButton);
                case "Standard_Shutter_opposite":
                case "Schneider_Shutter_opposite":
                    if (is4Button)
                        throw new Error(configErrorMessage);
                    else
                        return triggerHold(device, downButton);
                default: throw new Error(configErrorMessage);
            }
        }
        case CommandType.CLOSE: {
            switch (clusterMode) {
                case "Standard_Shutter":
                case "Schneider_Shutter":
                    if (is4Button)
                        throw new Error(configErrorMessage);
                    else
                        return triggerHold(device, downButton);
                case "Standard_Shutter_opposite":
                case "Schneider_Shutter_opposite":
                    if (is4Button)
                        return triggerHold(device, button);
                    else
                        return triggerHold(device, upButton);
                default: throw new Error(configErrorMessage);
            }
        }
        // Scenes cluster
        case CommandType.STORE_SCENE:
            switch (clusterMode) {
                case 'Scene':
                    if (is4Button)
                        return triggerHold(device, button);
                    else
                        throw new Error(configUnsupportedMessage);
                default: throw new Error(configErrorMessage);
            }
        case CommandType.RECALL_SCENE:
            switch (clusterMode) {
                case 'Scene':
                    if (is4Button)
                        return triggerPress(device, button);
                    else
                        throw new Error(configUnsupportedMessage);
                default: throw new Error(configErrorMessage);
            }
        default: throw new Error(configUnsupportedMessage);
    }
}
//# sourceMappingURL=ElkoMultiButtonDevice.js.map