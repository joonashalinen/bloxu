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

/***/ "../components/network/pub/browser/WebSocketMessenger.ts":
/*!***************************************************************!*\
  !*** ../components/network/pub/browser/WebSocketMessenger.ts ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ WebSocketMessenger)\n/* harmony export */ });\n/* harmony import */ var _events_pub_EventEmitter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../events/pub/EventEmitter */ \"../components/events/pub/EventEmitter.ts\");\nvar __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\n\nclass WebSocketMessenger {\n    constructor(socket) {\n        this.socket = socket;\n        this.emitter = new _events_pub_EventEmitter__WEBPACK_IMPORTED_MODULE_0__[\"default\"]();\n        this.socket.addEventListener('message', (event) => {\n            const parsedMessage = JSON.parse(event.data);\n            this.emitter.trigger(\"message\", [parsedMessage]);\n        });\n    }\n    postMessage(msg) {\n        const serializedMsg = typeof msg !== \"string\" ? JSON.stringify(msg) : msg;\n        this.socket.send(serializedMsg);\n        return this;\n    }\n    onMessage(handler) {\n        this.emitter.on(\"message\", handler);\n        return this;\n    }\n    offMessage(handler) {\n        this.emitter.off(\"message\", handler);\n        return this;\n    }\n    /**\n     * This method can be awaited to ensure\n     * the websocket connection is open\n     * before sending any messages.\n     */\n    waitForOpen() {\n        return __awaiter(this, void 0, void 0, function* () {\n            if (this.socket.readyState === WebSocket.CONNECTING) {\n                // Wait for connection to open.\n                yield new Promise((resolve, reject) => {\n                    this.socket.addEventListener(\"open\", (event) => {\n                        resolve(event);\n                    });\n                });\n            }\n        });\n    }\n}\n\n\n//# sourceURL=webpack://bloxu-browser/../components/network/pub/browser/WebSocketMessenger.ts?");

/***/ }),

/***/ "../services/online_synchronizer/pub/client/OnlineSynchronizerClient.ts":
/*!******************************************************************************!*\
  !*** ../services/online_synchronizer/pub/client/OnlineSynchronizerClient.ts ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ OnlineSynchronizerClient)\n/* harmony export */ });\n/* harmony import */ var _components_messaging_pub_MessageFactory__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../components/messaging/pub/MessageFactory */ \"../components/messaging/pub/MessageFactory.ts\");\n/* harmony import */ var _components_messaging_pub_ProxyMessenger__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../components/messaging/pub/ProxyMessenger */ \"../components/messaging/pub/ProxyMessenger.ts\");\n/* harmony import */ var _components_messaging_pub_SyncMessenger__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../components/messaging/pub/SyncMessenger */ \"../components/messaging/pub/SyncMessenger.ts\");\n/* harmony import */ var _components_network_pub_browser_WebSocketMessenger__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../components/network/pub/browser/WebSocketMessenger */ \"../components/network/pub/browser/WebSocketMessenger.ts\");\nvar __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\n\n\n\n\n/**\n * Contains the operations and state of the\n * OnlineSynchronizerClient service.\n */\nclass OnlineSynchronizerClient {\n    constructor() {\n        this.proxyMessenger = new _components_messaging_pub_ProxyMessenger__WEBPACK_IMPORTED_MODULE_1__[\"default\"]();\n        this.serviceId = \"onlineSynchronizerClient\";\n        // We do not know our player id within the game yet until we join one.\n        // The id within a game indicates whether we are player 1 or 2.\n        // Whoever first joins the game is player 1.\n        // The in-game player id is by default 'onlineSynchronizerClient' for \n        // the first 'joinGame' message, after which it will be set to the \n        // real in-game player id.\n        this.playerIdInGame = this.serviceId;\n        // This WebSocket is used to communicate with OnlineSynchronizerServer.\n        this.socketToServer = new WebSocket(\"ws://localhost:3000\");\n        this.messengerToServer = new _components_network_pub_browser_WebSocketMessenger__WEBPACK_IMPORTED_MODULE_3__[\"default\"](this.socketToServer);\n        this.syncMessengerToServer = new _components_messaging_pub_SyncMessenger__WEBPACK_IMPORTED_MODULE_2__[\"default\"](this.messengerToServer);\n        this.serverMessageFactory = new _components_messaging_pub_MessageFactory__WEBPACK_IMPORTED_MODULE_0__[\"default\"](this.serviceId);\n        this.serverConnectionId = \"\";\n        // This WebSocket is used to communicate with other \n        // players within a joined game.\n        this.gameSocket = new WebSocket(\"ws://localhost:3000\");\n        this.gameMessenger = new _components_network_pub_browser_WebSocketMessenger__WEBPACK_IMPORTED_MODULE_3__[\"default\"](this.gameSocket);\n        this.gameSyncMessenger = new _components_messaging_pub_SyncMessenger__WEBPACK_IMPORTED_MODULE_2__[\"default\"](this.gameMessenger);\n        this.gameMessageFactory = new _components_messaging_pub_MessageFactory__WEBPACK_IMPORTED_MODULE_0__[\"default\"](this.playerIdInGame);\n        this.gameConnectionId = \"\";\n        this.joinedGame = false;\n        this.eventHandlers = {\n            \"*\": this.onAnyEvent.bind(this),\n        };\n    }\n    /**\n     * Makes a synchronous request to the server. Returns the result.\n     */\n    makeSyncRequestToServer(type, args = []) {\n        return __awaiter(this, void 0, void 0, function* () {\n            return (yield this.syncMessengerToServer.postSyncMessage(this.serverMessageFactory.createRequest(\"onlineSynchronizerServer\", type, args)));\n        });\n    }\n    /**\n     * Sends an event message to the server.\n     */\n    sendEventToServer(type, args = []) {\n        return __awaiter(this, void 0, void 0, function* () {\n            this.messengerToServer.postMessage(this.serverMessageFactory.createEvent(\"onlineSynchronizerServer\", type, args));\n        });\n    }\n    /**\n     * Makes a synchronous request to the server through the connection\n     * used for in-game messaging between players (this.gameMessenger).\n     * We make two requests 'playerId' and 'joinGame' before the connection\n     * switches to in-game only, which is why this method exists.\n     */\n    makeGameConnectionSyncRequest(type, args = []) {\n        return __awaiter(this, void 0, void 0, function* () {\n            return (yield this.gameSyncMessenger.postSyncMessage(this.gameMessageFactory.createRequest(\"onlineSynchronizerServer\", type, args)));\n        });\n    }\n    /**\n     * Sends an event message to the other players in the currently joined game.\n     */\n    sendEventInGame(to, type, args = []) {\n        return __awaiter(this, void 0, void 0, function* () {\n            const msg = this.gameMessageFactory.createEvent(\"*\", type, args);\n            // Set subrecipients.\n            msg.subRecipients = [to];\n            this.gameMessenger.postMessage(msg);\n        });\n    }\n    /**\n     * Initialization procedure for the OnlineSynchronizer service.\n     * Once initialization is finished, the service can be used.\n     */\n    initialize() {\n        return __awaiter(this, void 0, void 0, function* () {\n            // vvv Setup WebSocket connection to OnlineSynchronizerServer. vvv\n            this.socketToServer.addEventListener(\"error\", (event) => {\n                console.log(\"Error occurred when trying to open websocket.\");\n                console.log(event);\n            });\n            // Ensure the websocket connections have opened before using them.\n            yield this.messengerToServer.waitForOpen();\n            yield this.gameMessenger.waitForOpen();\n            // Retrieve the ids of our connections to the \n            // server so that we can set the proper 'sender' field \n            // for future requests. 'playerId' is the only request for \n            // which it is fine to have the default connection id.\n            this.serverConnectionId = (yield this.makeSyncRequestToServer(\"playerId\"))[0];\n            this.gameConnectionId = (yield this.makeGameConnectionSyncRequest(\"playerId\"))[0];\n            this.serverMessageFactory.sender = this.serverConnectionId;\n            this.gameMessageFactory.sender = this.gameConnectionId;\n            // Listen to messages from the joined game (if a game has been joined).\n            this.gameMessenger.onMessage((msg) => {\n                // Ignore responses. We use SyncMessenger for messages with responses.\n                // There is some synchronous messaging done on the game room's connection\n                // during setup before joining a game.\n                if (msg.type === \"response\") {\n                    return;\n                }\n                // If the message is not a metadata message to the client \n                // but instead a message to the other services then we redirect it.\n                if (Array.isArray(msg.subRecipients) && msg.subRecipients.length > 0) {\n                    const redirectedMsg = Object.assign(Object.assign({}, msg), { \n                        // Within the browser environment there is only an 'onlineSynchronizer' service.\n                        // In other words, the other browser services do not know or care about the split between \n                        // onlineSynchronizerClient and onlineSynchronizerServer. Thus,\n                        // we need to rename the sender field. Also, the next sub-recipient becomes \n                        // the new main recipient.\n                        sender: \"onlineSynchronizer\", recipient: msg.subRecipients[0] });\n                    redirectedMsg.subRecipients.unshift();\n                    this.proxyMessenger.postMessage(redirectedMsg);\n                }\n                else {\n                    throw new Error(\"Handling messages sent directly to OnlineSynchronizerClient not implemented.\");\n                }\n            });\n            return true;\n        });\n    }\n    /**\n     * Host a new game.\n     */\n    hostGame() {\n        return __awaiter(this, void 0, void 0, function* () {\n            const code = (yield this.makeSyncRequestToServer(\"hostGame\"))[0];\n            const playerIdInGame = yield this.joinGame(code);\n            return [code, playerIdInGame];\n        });\n    }\n    /**\n     * Join an existing game by using a code.\n     */\n    joinGame(code) {\n        return __awaiter(this, void 0, void 0, function* () {\n            this.playerIdInGame = (yield this.makeGameConnectionSyncRequest(\"joinGame\", [code, this.gameConnectionId]))[0];\n            this.joinedGame = true;\n            return this.playerIdInGame;\n        });\n    }\n    /**\n     * Fallback for any event that does not\n     * have a specific handler.\n     */\n    onAnyEvent(msg) {\n        // If the message is from the local player or is one of the \n        // manually set events that we wish to redirect to the \n        // local player's mirror services in other players' games.\n        if (this.joinedGame && msg.sender === this.playerIdInGame) {\n            const event = msg.message.args[0];\n            // Redirect the event to the player's mirror services on the \n            // other players' games. We wrap the event with the tag 'OnlineSynchronizer'\n            // so that the remote player knows it is a synchronization message.\n            this.sendEventInGame(this.playerIdInGame, `OnlineSynchronizer:${msg.message.type}`, [event]);\n        }\n    }\n}\n\n\n//# sourceURL=webpack://bloxu-browser/../services/online_synchronizer/pub/client/OnlineSynchronizerClient.ts?");

/***/ }),

/***/ "../services/online_synchronizer/pub/client/index.ts":
/*!***********************************************************!*\
  !*** ../services/online_synchronizer/pub/client/index.ts ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _components_browser_pub_WebWorker__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../components/browser/pub/WebWorker */ \"../components/browser/pub/WebWorker.ts\");\n/* harmony import */ var _components_messaging_pub_MessagePipe__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../components/messaging/pub/MessagePipe */ \"../components/messaging/pub/MessagePipe.ts\");\n/* harmony import */ var _components_messaging_pub_MessengerClass__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../components/messaging/pub/MessengerClass */ \"../components/messaging/pub/MessengerClass.ts\");\n/* harmony import */ var _OnlineSynchronizerClient__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./OnlineSynchronizerClient */ \"../services/online_synchronizer/pub/client/OnlineSynchronizerClient.ts\");\n\n\n\n\nfunction main() {\n    var synchronizerClient = new _OnlineSynchronizerClient__WEBPACK_IMPORTED_MODULE_3__[\"default\"]();\n    var worker = new _components_browser_pub_WebWorker__WEBPACK_IMPORTED_MODULE_0__[\"default\"](self);\n    var synchronizerClientMessenger = new _components_messaging_pub_MessengerClass__WEBPACK_IMPORTED_MODULE_2__[\"default\"](synchronizerClient, synchronizerClient.proxyMessenger, \"onlineSynchronizerClient\");\n    var pipe = new _components_messaging_pub_MessagePipe__WEBPACK_IMPORTED_MODULE_1__[\"default\"](worker, synchronizerClientMessenger);\n    pipe.join();\n}\nmain();\n\n\n//# sourceURL=webpack://bloxu-browser/../services/online_synchronizer/pub/client/index.ts?");

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
/******/ 		var __webpack_exports__ = __webpack_require__.O(undefined, ["components_browser_pub_WebWorker_ts-components_messaging_pub_MessageFactory_ts-components_mes-9d6eec"], () => (__webpack_require__("../services/online_synchronizer/pub/client/index.ts")))
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
/******/ 			"onlineSynchronizer": 1
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