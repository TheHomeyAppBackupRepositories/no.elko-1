"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zigbee_clusters_1 = require("zigbee-clusters");
class ElkoOnOffBoundCluster extends zigbee_clusters_1.BoundCluster {
    constructor({ logger, onSetOn, onSetOff, onToggle }) {
        super();
        this._logger = logger;
        this._onSetOn = onSetOn;
        this._onSetOff = onSetOff;
        this._onToggle = onToggle;
    }
    setOff(payload) {
        this._logger("setOff", payload);
        this._onSetOff();
    }
    setOn(payload) {
        this._logger("setOn", payload);
        this._onSetOn();
    }
    toggle(payload) {
        this._logger("toggle", payload);
        this._onToggle();
    }
}
exports.default = ElkoOnOffBoundCluster;
//# sourceMappingURL=ElkoOnOffBoundCluster.js.map