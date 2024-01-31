/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "../services/game_master/pub/GameMaster.ts":
/*!*************************************************!*\
  !*** ../services/game_master/pub/GameMaster.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ GameMaster)\n/* harmony export */ });\n/* harmony import */ var _components_messaging_pub_ProxyMessenger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../components/messaging/pub/ProxyMessenger */ \"../components/messaging/pub/ProxyMessenger.ts\");\n/* harmony import */ var _components_messaging_pub_SyncMessenger__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../components/messaging/pub/SyncMessenger */ \"../components/messaging/pub/SyncMessenger.ts\");\n/* harmony import */ var _components_messaging_pub_MessageFactory__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../components/messaging/pub/MessageFactory */ \"../components/messaging/pub/MessageFactory.ts\");\nvar __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\n\n\n\n/**\n * Class that contains the operations and state\n * of the LocalGameMaster service.\n */\nclass GameMaster {\n    constructor() {\n        this.proxyMessenger = new _components_messaging_pub_ProxyMessenger__WEBPACK_IMPORTED_MODULE_0__[\"default\"]();\n        this.messageFactory = new _components_messaging_pub_MessageFactory__WEBPACK_IMPORTED_MODULE_2__[\"default\"](\"gameMaster\");\n        this.gameRunning = false;\n        this.cubeSize = 1.34;\n        this.characterHeight = 1.8;\n        this.syncMessenger = new _components_messaging_pub_SyncMessenger__WEBPACK_IMPORTED_MODULE_1__[\"default\"](this.proxyMessenger);\n        this.eventHandlers = {\n            \"Player:<event>die\": this.onPlayerDeath.bind(this),\n            \"OnlineSynchronizer:<event>remotePlayerJoined\": this.onPlayerJoined.bind(this)\n        };\n        this.initialized = false;\n    }\n    /**\n     * Spawn everything needed for the game\n     * and make the 3D world run.\n     */\n    _startGame(otherPlayerIsAI = false) {\n        return __awaiter(this, void 0, void 0, function* () {\n            // vvv Setup environment. vvv\n            // Make world run.\n            this.proxyMessenger.postMessage(this.messageFactory.createRequest(\"world3d\", \"run\"));\n            // Create the cube islands the players will spawn on.\n            this.createCubeIsland(\"GameMaster:FloatingCube?1\", { x: 0, y: 0, z: 0 });\n            this.createCubeIsland(\"GameMaster:FloatingCube?2\", { x: 0, y: 0, z: 20.156 });\n            // vvv Setup players. vvv        \n            // Tell the player services who is the main player and who is the remote / AI player.\n            this.proxyMessenger.postMessage(this.messageFactory.createRequest(this.localPlayerId, \"beMainPlayer\"));\n            this.proxyMessenger.postMessage(this.messageFactory.createRequest(this.remotePlayerId(), !otherPlayerIsAI ? \"beRemotePlayer\" : \"beAIPlayer\"));\n            // Initialize players.\n            yield this.syncMessenger.postSyncMessage(this.messageFactory.createRequest(this.localPlayerId, \"initialize\"));\n            yield this.syncMessenger.postSyncMessage(this.messageFactory.createRequest(this.remotePlayerId(), \"initialize\"));\n            // Spawn players.\n            this.proxyMessenger.postMessage(this.messageFactory.createRequest(\"player-1\", \"spawn\", [{ x: 0, y: 0, z: 0 }]));\n            this.proxyMessenger.postMessage(this.messageFactory.createRequest(\"player-2\", \"spawn\", [{ x: 0, y: 0, z: 20 }]));\n            // Create skybox.\n            this.proxyMessenger.postMessage(this.messageFactory.createRequest(\"world3d\", \"modify\", [\n                {\n                    boundArgs: [],\n                    f: function () {\n                        const skybox = this.meshConstructors[\"SkyBox\"]();\n                    }\n                }\n            ]));\n            // Center camera on the local player.\n            setTimeout(() => {\n                this.proxyMessenger.postMessage(this.messageFactory.createRequest(\"world3d\", \"modify\", [\n                    {\n                        boundArgs: [this.localPlayerId],\n                        f: function (playerId) {\n                            const playerBody = this.getObject(`Player:PlayerBody?${playerId}`);\n                            this.camera.lockedTarget = playerBody.mainMesh;\n                            // If we are player 2, then we wish to rotate the camera 180 degrees.\n                            if (playerId === \"player-2\") {\n                                this.camera.alpha = this.camera.alpha + Math.PI;\n                            }\n                        }\n                    }\n                ]));\n            }, \n            // We give some time for the Player service to create the body.\n            // This is a dirty, unreliable hack and should be fixed.\n            500);\n            this.gameRunning = true;\n        });\n    }\n    /**\n     * Create a new standard-sized cube island in the world\n     * at the given position.\n     */\n    createCubeIsland(id, position) {\n        this.proxyMessenger.postMessage({\n            sender: \"gameMaster\",\n            recipient: \"world3d\",\n            type: \"request\",\n            message: {\n                type: \"createObject\",\n                args: [id, \"FloatingCube\", {\n                        boundArgs: [id, position, this.cubeSize],\n                        f: function (id, position, cubeSize) {\n                            return [\n                                id,\n                                cubeSize,\n                                new this.babylonjs.Vector3(position.x, position.y, position.z),\n                                this.scene\n                            ];\n                        }\n                    }]\n            }\n        });\n    }\n    /**\n     * Initialization procedure for the LocalGameMaster service.\n     */\n    initialize() {\n        return __awaiter(this, void 0, void 0, function* () {\n            this.initialized = true;\n            return true;\n        });\n    }\n    /**\n     * In-game id of the other player, which is the remote player.\n     * We assume the game is 2-player.\n     */\n    remotePlayerId() {\n        if (this.localPlayerId === \"player-1\") {\n            return \"player-2\";\n        }\n        else {\n            return \"player-1\";\n        }\n    }\n    /**\n     * Host a new game. Returns the code that can be used\n     * to invite other players to the game.\n     */\n    hostGame() {\n        return __awaiter(this, void 0, void 0, function* () {\n            const [code, localPlayerId] = (yield this.syncMessenger.postSyncMessage({\n                recipient: \"onlineSynchronizer\",\n                sender: \"gameMaster\",\n                type: \"request\",\n                message: {\n                    type: \"hostGame\",\n                    args: []\n                }\n            }))[0];\n            this.localPlayerId = localPlayerId;\n            yield this._startGame();\n            return code;\n        });\n    }\n    /**\n     * Starts a local game against an AI opponent.\n     */\n    startLocalGame() {\n        return __awaiter(this, void 0, void 0, function* () {\n            const [code, localPlayerId] = (yield this.syncMessenger.postSyncMessage({\n                recipient: \"onlineSynchronizer\",\n                sender: \"gameMaster\",\n                type: \"request\",\n                message: {\n                    type: \"hostGame\",\n                    args: []\n                }\n            }))[0];\n            this.localPlayerId = localPlayerId;\n            yield this._startGame(true);\n            return true;\n        });\n    }\n    /**\n     * Join an existing game by using a code given by\n     * the host of the game.\n     */\n    joinGame(code) {\n        return __awaiter(this, void 0, void 0, function* () {\n            const response = (yield this.syncMessenger.postSyncMessage({\n                recipient: \"onlineSynchronizer\",\n                sender: \"gameMaster\",\n                type: \"request\",\n                message: {\n                    type: \"joinGame\",\n                    args: [code]\n                }\n            }))[0];\n            if (typeof response === \"string\") {\n                this.localPlayerId = response;\n                yield this._startGame();\n            }\n            return response;\n        });\n    }\n    /**\n     * When a player has died.\n     */\n    onPlayerDeath(playerId) {\n        if (this.gameRunning) {\n            // Pause the game engine.\n            this.proxyMessenger.postMessage(this.messageFactory.createRequest(\"world3d\", \"pauseRenderLoop\"));\n            // Notify the service's environment that the game has ended.\n            this.proxyMessenger.postMessage(this.messageFactory.createEvent(\"*\", \"GameMaster:<event>endGame\"));\n            // Determine whether the local player has lost or won.\n            if (playerId === this.localPlayerId) {\n                // Notify the environment that the local player has lost.\n                this.proxyMessenger.postMessage(this.messageFactory.createEvent(\"*\", \"GameMaster:<event>loseGame\"));\n            }\n            else {\n                // Notify the environment that the local player has won.\n                this.proxyMessenger.postMessage(this.messageFactory.createEvent(\"*\", \"GameMaster:<event>winGame\"));\n            }\n            this.gameRunning = false;\n        }\n    }\n    /**\n     * When a player other than the main local player has joined the game.\n     */\n    onPlayerJoined(playerId) {\n        // We assume there are only two players, which means \n        // the game has started, since all players are present.\n        this.proxyMessenger.postMessage(this.messageFactory.createEvent(\"*\", \"GameMaster:<event>startGame\"));\n    }\n}\n\n\n//# sourceURL=webpack://bloxu-browser/../services/game_master/pub/GameMaster.ts?");

/***/ }),

/***/ "../services/game_master/pub/index.ts":
/*!********************************************!*\
  !*** ../services/game_master/pub/index.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _components_browser_pub_WebWorker__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../components/browser/pub/WebWorker */ \"../components/browser/pub/WebWorker.ts\");\n/* harmony import */ var _components_messaging_pub_MessagePipe__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../components/messaging/pub/MessagePipe */ \"../components/messaging/pub/MessagePipe.ts\");\n/* harmony import */ var _components_messaging_pub_MessengerClass__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../components/messaging/pub/MessengerClass */ \"../components/messaging/pub/MessengerClass.ts\");\n/* harmony import */ var _GameMaster__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./GameMaster */ \"../services/game_master/pub/GameMaster.ts\");\n\n\n\n\nfunction main() {\n    var gameMaster = new _GameMaster__WEBPACK_IMPORTED_MODULE_3__[\"default\"]();\n    var worker = new _components_browser_pub_WebWorker__WEBPACK_IMPORTED_MODULE_0__[\"default\"](self);\n    var gameMasterMessenger = new _components_messaging_pub_MessengerClass__WEBPACK_IMPORTED_MODULE_2__[\"default\"](gameMaster, gameMaster.proxyMessenger, \"gameMaster\");\n    var pipe = new _components_messaging_pub_MessagePipe__WEBPACK_IMPORTED_MODULE_1__[\"default\"](worker, gameMasterMessenger);\n    pipe.join();\n}\nmain();\n\n\n//# sourceURL=webpack://bloxu-browser/../services/game_master/pub/index.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/******/ 	// the startup function
/******/ 	__webpack_require__.x = () => {
/******/ 		// Load entry module and return exports
/******/ 		// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 		var __webpack_exports__ = __webpack_require__.O(undefined, ["components_browser_pub_WebWorker_ts-components_messaging_pub_MessageFactory_ts-components_mes-9d6eec"], () => (__webpack_require__("../services/game_master/pub/index.ts")))
/******/ 		__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 		return __webpack_exports__;
/******/ 	};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = (chunkId) => {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks and sibling chunks for the entrypoint
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".index.js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src;
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) {
/******/ 					var i = scripts.length - 1;
/******/ 					while (i > -1 && !scriptUrl) scriptUrl = scripts[i--].src;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/importScripts chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded chunks
/******/ 		// "1" means "already loaded"
/******/ 		var installedChunks = {
/******/ 			"gameMaster": 1
/******/ 		};
/******/ 		
/******/ 		// importScripts chunk loading
/******/ 		var installChunk = (data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			for(var moduleId in moreModules) {
/******/ 				if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 					__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 				}
/******/ 			}
/******/ 			if(runtime) runtime(__webpack_require__);
/******/ 			while(chunkIds.length)
/******/ 				installedChunks[chunkIds.pop()] = 1;
/******/ 			parentChunkLoadingFunction(data);
/******/ 		};
/******/ 		__webpack_require__.f.i = (chunkId, promises) => {
/******/ 			// "1" is the signal for "already loaded"
/******/ 			if(!installedChunks[chunkId]) {
/******/ 				if(true) { // all chunks have JS
/******/ 					importScripts(__webpack_require__.p + __webpack_require__.u(chunkId));
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkbloxu_browser"] = self["webpackChunkbloxu_browser"] || [];
/******/ 		var parentChunkLoadingFunction = chunkLoadingGlobal.push.bind(chunkLoadingGlobal);
/******/ 		chunkLoadingGlobal.push = installChunk;
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/startup chunk dependencies */
/******/ 	(() => {
/******/ 		var next = __webpack_require__.x;
/******/ 		__webpack_require__.x = () => {
/******/ 			return __webpack_require__.e("components_browser_pub_WebWorker_ts-components_messaging_pub_MessageFactory_ts-components_mes-9d6eec").then(next);
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// run startup
/******/ 	var __webpack_exports__ = __webpack_require__.x();
/******/ 	
/******/ })()
;