"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zigbee_clusters_1 = require("zigbee-clusters");
class ElkoWindowCoveringBoundCluster extends zigbee_clusters_1.BoundCluster {
    constructor({ logger, onUpOpen, onDownClose, onStop, onGoToLiftValue, onGoToLiftPercentage, onGoToTiltValue, onGoToTiltPercentage, onStopOrStepLiftPercentage, }) {
        super();
        this._logger = logger;
        this._onUpOpen = onUpOpen;
        this._onDownClose = onDownClose;
        this._onStop = onStop;
        this._onGoToLiftValue = onGoToLiftValue;
        this._onGoToLiftPercentage = onGoToLiftPercentage;
        this._onGoToTiltValue = onGoToTiltValue;
        this._onGoToTiltPercentage = onGoToTiltPercentage;
        this._onStopOrStepLiftPercentage = onStopOrStepLiftPercentage;
    }
    upOpen(payload) {
        this._logger('upOpen', payload);
        this._onUpOpen(payload);
    }
    downClose(payload) {
        this._logger('downClose', payload);
        this._onDownClose(payload);
    }
    stop(payload) {
        this._logger('stop', payload);
        this._onStop(payload);
    }
    goToLiftValue(payload) {
        this._logger('goToLiftValue', payload);
        this._onGoToLiftValue(payload);
    }
    goToLiftPercentage(payload) {
        this._logger('goToLiftPercentage', payload);
        this._onGoToLiftPercentage(payload);
    }
    goToTiltValue(payload) {
        this._logger('goToTiltValue', payload);
        this._onGoToTiltValue(payload);
    }
    goToTiltPercentage(payload) {
        this._logger('goToTiltPercentage', payload);
        this._onGoToTiltPercentage(payload);
    }
    stopOrStepLiftPercentage(payload) {
        this._logger('StopOrStepLiftPercentage', payload);
        this._onStopOrStepLiftPercentage(payload);
    }
}
exports.default = ElkoWindowCoveringBoundCluster;
//# sourceMappingURL=ElkoWindowCoveringBoundCluster.js.map