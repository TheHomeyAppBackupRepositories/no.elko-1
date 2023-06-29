"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zigbee_clusters_1 = require("zigbee-clusters");
class ElkoScenesBoundCluster extends zigbee_clusters_1.BoundCluster {
    constructor({ logger, onStoreScene, onRecallScene }) {
        super();
        this._logger = logger;
        this._onStoreScene = onStoreScene;
        this._onRecallScene = onRecallScene;
    }
    storeScene(payload) {
        this._logger("storeScene", payload);
        this._onStoreScene();
    }
    recallScene(payload) {
        this._logger("recallScene", payload);
        this._onRecallScene();
    }
}
exports.default = ElkoScenesBoundCluster;
//# sourceMappingURL=ElkoScenesBoundCluster.js.map