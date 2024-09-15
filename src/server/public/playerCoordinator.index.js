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

/***/ "../services/creature_coordinator/pub/CreatureCoordinator.ts":
/*!*******************************************************************!*\
  !*** ../services/creature_coordinator/pub/CreatureCoordinator.ts ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ CreatureCoordinator)\n/* harmony export */ });\n/* harmony import */ var _components_messaging_pub_ProxyMessenger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../components/messaging/pub/ProxyMessenger */ \"../components/messaging/pub/ProxyMessenger.ts\");\n/* harmony import */ var _components_messaging_pub_SyncMessenger__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../components/messaging/pub/SyncMessenger */ \"../components/messaging/pub/SyncMessenger.ts\");\n/* harmony import */ var _components_messaging_pub_MessageFactory__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../components/messaging/pub/MessageFactory */ \"../components/messaging/pub/MessageFactory.ts\");\nvar __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\n\n\n\n/**\n * Contains the features of a service that does commonly useful coordination\n * between creature services. Currenly this coordination is only related\n * to input controls.\n */\nclass CreatureCoordinator {\n    constructor(id) {\n        this.id = id;\n        this.proxyMessenger = new _components_messaging_pub_ProxyMessenger__WEBPACK_IMPORTED_MODULE_0__[\"default\"]();\n        this.selectableCreatures = [];\n        this.changeSelectedCreatureKey = \"z\";\n        this.switchCoolDown = 1000;\n        this.timeAtLastSwitch = 0;\n        this.messageFactory = new _components_messaging_pub_MessageFactory__WEBPACK_IMPORTED_MODULE_2__[\"default\"](id);\n        this.syncMessenger = new _components_messaging_pub_SyncMessenger__WEBPACK_IMPORTED_MODULE_1__[\"default\"](this.proxyMessenger);\n        this.eventHandlers = {\n            \"IOService:<event>releaseKey\": this.onReleaseKeyInput.bind(this)\n        };\n        this.initialized = false;\n    }\n    /**\n     * Initialization procedure for the CreatureCoordinator service.\n     */\n    initialize(selectableCreatures_1) {\n        return __awaiter(this, arguments, void 0, function* (selectableCreatures, selectedCreatureIndex = 0) {\n            this.selectableCreatures = selectableCreatures;\n            this.selectedCreatureIndex = selectedCreatureIndex;\n            this.initialized = true;\n            return true;\n        });\n    }\n    /**\n     * Returns the name of the creature service that is\n     * currently selected and has input control focus.\n     */\n    selectedCreature() {\n        return this.selectableCreatures[this.selectedCreatureIndex];\n    }\n    /**\n     * When a pressed down key has been released on the controller.\n     */\n    onReleaseKeyInput(key, keyControllerIndex, controllerIndex) {\n        return __awaiter(this, void 0, void 0, function* () {\n            const timeNow = Date.now();\n            if (key === this.changeSelectedCreatureKey &&\n                (timeNow - this.timeAtLastSwitch > this.switchCoolDown)) {\n                this.timeAtLastSwitch = timeNow;\n                const currentSelectedCreature = this.selectedCreature();\n                this._carouselSelectedCreature();\n                this.proxyMessenger.postMessage(this.messageFactory.createRequest(currentSelectedCreature, \"disableControls\"));\n                this.proxyMessenger.postMessage(this.messageFactory.createRequest(this.selectedCreature(), \"enableControls\"));\n            }\n        });\n    }\n    /**\n     * Changes the selected player in a carousel rotation.\n     */\n    _carouselSelectedCreature() {\n        this.selectedCreatureIndex = (this.selectedCreatureIndex ===\n            (this.selectableCreatures.length - 1)) ? 0 : this.selectedCreatureIndex + 1;\n    }\n}\n\n\n//# sourceURL=webpack://bloxu-browser/../services/creature_coordinator/pub/CreatureCoordinator.ts?");

/***/ }),

/***/ "../services/creature_coordinator/pub/index.ts":
/*!*****************************************************!*\
  !*** ../services/creature_coordinator/pub/index.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _components_browser_pub_WebWorker__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../components/browser/pub/WebWorker */ \"../components/browser/pub/WebWorker.ts\");\n/* harmony import */ var _components_messaging_pub_MessagePipe__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../components/messaging/pub/MessagePipe */ \"../components/messaging/pub/MessagePipe.ts\");\n/* harmony import */ var _components_messaging_pub_MessengerClass__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../components/messaging/pub/MessengerClass */ \"../components/messaging/pub/MessengerClass.ts\");\n/* harmony import */ var _CreatureCoordinator__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./CreatureCoordinator */ \"../services/creature_coordinator/pub/CreatureCoordinator.ts\");\n\n\n\n\nfunction main() {\n    var creatureCoordinator = new _CreatureCoordinator__WEBPACK_IMPORTED_MODULE_3__[\"default\"](self.name);\n    var worker = new _components_browser_pub_WebWorker__WEBPACK_IMPORTED_MODULE_0__[\"default\"](self);\n    var creatureCoordinatorMessenger = new _components_messaging_pub_MessengerClass__WEBPACK_IMPORTED_MODULE_2__[\"default\"](creatureCoordinator, creatureCoordinator.proxyMessenger, self.name);\n    var pipe = new _components_messaging_pub_MessagePipe__WEBPACK_IMPORTED_MODULE_1__[\"default\"](worker, creatureCoordinatorMessenger);\n    pipe.join();\n}\nmain();\n\n\n//# sourceURL=webpack://bloxu-browser/../services/creature_coordinator/pub/index.ts?");

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
/******/ 		var __webpack_exports__ = __webpack_require__.O(undefined, ["components_browser_pub_WebWorker_ts-components_messaging_pub_MessageFactory_ts-components_mes-9d6eec"], () => (__webpack_require__("../services/creature_coordinator/pub/index.ts")))
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
/******/ 		__webpack_require__.p = "/";
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/importScripts chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded chunks
/******/ 		// "1" means "already loaded"
/******/ 		var installedChunks = {
/******/ 			"playerCoordinator": 1
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