"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zigbee_clusters_1 = require("zigbee-clusters");
class ElkoLevelControlBoundCluster extends zigbee_clusters_1.BoundCluster {
    constructor({ logger, onMoveToLevel, onMove, onStep, onStop, onMoveToLevelWithOnOff, onMoveWithOnOff, onStepWithOnOff, onStopWithOnOff, }) {
        super();
        this._logger = logger;
        this._onMoveToLevel = onMoveToLevel;
        this._onMove = onMove;
        this._onStep = onStep;
        this._onStop = onStop;
        this._onMoveToLevelWithOnOff = onMoveToLevelWithOnOff;
        this._onMoveWithOnOff = onMoveWithOnOff;
        this._onStepWithOnOff = onStepWithOnOff;
        this._onStopWithOnOff = onStopWithOnOff;
    }
    moveToLevel(payload) {
        this._logger('moveToLevel', payload);
        this._onMoveToLevel(payload);
    }
    move(payload) {
        this._logger('move', payload);
        this._onMove(payload);
    }
    step(payload) {
        this._logger('step', payload);
        this._onStep(payload);
    }
    stop(payload) {
        this._logger('stop', payload);
        this._onStop(payload);
    }
    moveToLevelWithOnOff(payload) {
        this._logger('moveToLevelWithOnOff', payload);
        this._onMoveToLevelWithOnOff(payload);
    }
    moveWithOnOff(payload) {
        this._logger('moveWithOnOff', payload);
        this._onMoveWithOnOff(payload);
    }
    stepWithOnOff(payload) {
        this._logger('stepWithOnOff', payload);
        this._onStepWithOnOff(payload);
    }
    stopWithOnOff(payload) {
        this._logger('stopWithOnOff', payload);
        this._onStopWithOnOff(payload);
    }
}
exports.default = ElkoLevelControlBoundCluster;
//# sourceMappingURL=ElkoLevelControlBoundCluster.js.map