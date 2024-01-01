"use strict";
/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunkbloxu_browser"] = self["webpackChunkbloxu_browser"] || []).push([["components_browser_pub_WebWorker_ts-components_messaging_pub_MessageFactory_ts-components_mes-9d6eec"],{

/***/ "../components/browser/pub/WebWorker.ts":
/*!**********************************************!*\
  !*** ../components/browser/pub/WebWorker.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ WebWorker)\n/* harmony export */ });\n/* harmony import */ var _data_structures_pub_DeepMappableObject__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../data_structures/pub/DeepMappableObject */ \"../components/data_structures/pub/DeepMappableObject.ts\");\n/* harmony import */ var _types_VariableType__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../types/VariableType */ \"../components/types/VariableType.ts\");\n/* harmony import */ var _types_EncodeableFunction__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../types/EncodeableFunction */ \"../components/types/EncodeableFunction.ts\");\n\n\n\n/**\n * A web worker running on a browser. Implements the IMessenger interface\n * and provides support for sending functions between workers.\n */\nclass WebWorker {\n    constructor(worker) {\n        this.worker = worker;\n        this.encodedFunctionPrefix = \"<<<<<\";\n    }\n    /**\n     * Maps every value of given type in given object.\n     */\n    _mapTypeInObj(obj, type, transformer) {\n        return ((new _data_structures_pub_DeepMappableObject__WEBPACK_IMPORTED_MODULE_0__[\"default\"](obj)).map((value) => (typeof value === type ?\n            transformer(value) :\n            value)).wrappee);\n    }\n    /**\n     * Encodes the given function into a string.\n     */\n    encodeFunction(f) {\n        return this.encodedFunctionPrefix + (new _types_EncodeableFunction__WEBPACK_IMPORTED_MODULE_2__[\"default\"](f)).encode();\n    }\n    /**\n     * Decodes a function that was stringified with .encodeFunction()\n     * back into being a function.\n     */\n    decodeFunction(f) {\n        return (new _types_EncodeableFunction__WEBPACK_IMPORTED_MODULE_2__[\"default\"](f.slice(this.encodedFunctionPrefix.length))).decode();\n    }\n    postMessage(msg) {\n        // Transform functions into a form where they can be\n        // sent via the worker.\n        if (typeof msg === \"function\") {\n            msg = this.encodeFunction(msg);\n        }\n        else if (msg instanceof Object) {\n            msg = this._mapTypeInObj(msg, \"function\", this.encodeFunction.bind(this));\n        }\n        this.worker.postMessage(msg);\n        return this;\n    }\n    onMessage(handler) {\n        this.worker.onmessage = (msg) => {\n            // If msg.data is an object.\n            if ((new _types_VariableType__WEBPACK_IMPORTED_MODULE_1__[\"default\"](msg.data)).isRealObject()) {\n                // Map all encoded functions back into real functions.\n                var data = ((new _data_structures_pub_DeepMappableObject__WEBPACK_IMPORTED_MODULE_0__[\"default\"](msg.data)).map((value) => {\n                    // If the value to be mapped is an encoded function.\n                    if (typeof value === \"string\" &&\n                        value.length >= this.encodedFunctionPrefix.length &&\n                        value.slice(0, this.encodedFunctionPrefix.length) === this.encodedFunctionPrefix) {\n                        // Decode the string back into a real function.\n                        return this.decodeFunction(value);\n                    }\n                    else {\n                        // Value to be mapped is not an encoded function. Thus, we do nothing to it.\n                        return value;\n                    }\n                }).wrappee);\n            }\n            else {\n                // msg.data is not an object. Thus, we do nothing to it.\n                var data = msg.data;\n            }\n            handler(data);\n        };\n        return this;\n    }\n    offMessage(handler) {\n        this.worker.onmessage = undefined;\n        return this;\n    }\n}\n\n\n//# sourceURL=webpack://bloxu-browser/../components/browser/pub/WebWorker.ts?");

/***/ }),

/***/ "../components/data_structures/pub/DeepMappableArray.ts":
/*!**************************************************************!*\
  !*** ../components/data_structures/pub/DeepMappableArray.ts ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ DeepMappableArray)\n/* harmony export */ });\n/* harmony import */ var _DeepMappableObject__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./DeepMappableObject */ \"../components/data_structures/pub/DeepMappableObject.ts\");\n/* harmony import */ var _types_VariableType__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../types/VariableType */ \"../components/types/VariableType.ts\");\n\n\n/**\n * Provides deep mapping for plain javascript arrays.\n */\nclass DeepMappableArray {\n    constructor(wrappee) {\n        this.wrappee = wrappee;\n    }\n    map(transformer) {\n        this.wrappee = this.wrappee.map((value) => {\n            if (Array.isArray(value)) {\n                return (new DeepMappableArray(value)).map(transformer).wrappee;\n            }\n            else if ((new _types_VariableType__WEBPACK_IMPORTED_MODULE_1__[\"default\"](value)).isRealObject()) {\n                return (new _DeepMappableObject__WEBPACK_IMPORTED_MODULE_0__[\"default\"](value)).map(transformer).wrappee;\n            }\n            else {\n                return transformer(value);\n            }\n        });\n        return this;\n    }\n}\n\n\n//# sourceURL=webpack://bloxu-browser/../components/data_structures/pub/DeepMappableArray.ts?");

/***/ }),

/***/ "../components/data_structures/pub/DeepMappableObject.ts":
/*!***************************************************************!*\
  !*** ../components/data_structures/pub/DeepMappableObject.ts ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ DeepMappableObject)\n/* harmony export */ });\n/* harmony import */ var _DeepMappableArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./DeepMappableArray */ \"../components/data_structures/pub/DeepMappableArray.ts\");\n/* harmony import */ var _types_VariableType__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../types/VariableType */ \"../components/types/VariableType.ts\");\n\n\n/**\n * Provides deep mapping for plain javascript objects.\n */\nclass DeepMappableObject {\n    constructor(wrappee) {\n        this.wrappee = wrappee;\n    }\n    /**\n     * Deep map through all the object's values. Deep maps through nested arrays as well.\n     */\n    map(transformer) {\n        var copyObj = {};\n        for (let propName in this.wrappee) {\n            let prop = this.wrappee[propName];\n            if (Array.isArray(prop)) {\n                copyObj[propName] = (new _DeepMappableArray__WEBPACK_IMPORTED_MODULE_0__[\"default\"](prop)).map(transformer).wrappee;\n            }\n            else if ((new _types_VariableType__WEBPACK_IMPORTED_MODULE_1__[\"default\"](prop)).isRealObject()) {\n                copyObj[propName] = (new DeepMappableObject(prop)).map(transformer).wrappee;\n            }\n            else {\n                copyObj[propName] = transformer(prop);\n            }\n        }\n        this.wrappee = copyObj;\n        return this;\n    }\n}\n\n\n//# sourceURL=webpack://bloxu-browser/../components/data_structures/pub/DeepMappableObject.ts?");

/***/ }),

/***/ "../components/events/pub/EventEmitter.ts":
/*!************************************************!*\
  !*** ../components/events/pub/EventEmitter.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ EventEmitter)\n/* harmony export */ });\nvar __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\nclass EventEmitter {\n    allowAllEvents() {\n        return this._allowAllEvents;\n    }\n    setAllowAllEvents(allowAllEvents) {\n        this._allowAllEvents = allowAllEvents;\n    }\n    _onEvent(event, callback) {\n        if (this._allowAllEvents || this._allowedEvents.includes(event)) {\n            this._eventListeners.push({\n                event: event,\n                callback: callback\n            });\n        }\n    }\n    _eventsFromEventString(eventsString) {\n        return eventsString.split(\" \").join(\"\").split(\",\");\n    }\n    constructor() {\n        this._eventListeners = [];\n        this._allowedEvents = [];\n        this._allowAllEvents = true;\n    }\n    on(eventsString, callback) {\n        var events = this._eventsFromEventString(eventsString);\n        for (var i = 0; i < events.length; i++) {\n            this._onEvent(events[i], callback);\n        }\n    }\n    off(event, callback) {\n        for (var i = this._eventListeners.length - 1; i >= 0; i--) {\n            if (this._eventListeners[i].event === event\n                &&\n                    this._eventListeners[i].callback === callback) {\n                this._eventListeners.splice(i, 1);\n            }\n        }\n    }\n    trigger(event, args) {\n        if (args === undefined)\n            args = [];\n        for (var i = 0; i < this._eventListeners.length; i++) {\n            if (this._eventListeners[i].event === event) {\n                this._eventListeners[i].callback.apply(null, args);\n            }\n        }\n    }\n    triggerAwait(event, args) {\n        return __awaiter(this, void 0, void 0, function* () {\n            if (args === undefined)\n                args = [];\n            for (var i = 0; i < this._eventListeners.length; i++) {\n                if (this._eventListeners[i].event === event) {\n                    yield this._eventListeners[i].callback.apply(null, args);\n                }\n            }\n        });\n    }\n    allowedEvents() {\n        return this._allowedEvents;\n    }\n    setAllowedEvents(allowedEvents) {\n        this._allowedEvents = allowedEvents;\n    }\n    addAllowedEvent(event) {\n        if (!this._allowedEvents.includes(event))\n            this._allowedEvents.push(event);\n    }\n    removeAllowedEvent(event) {\n        if (this._allowedEvents.includes(event))\n            this._allowedEvents.splice(this._allowedEvents.indexOf(event), 1);\n    }\n}\n\n\n//# sourceURL=webpack://bloxu-browser/../components/events/pub/EventEmitter.ts?");

/***/ }),

/***/ "../components/math/pub/ArithmeticSequence.ts":
/*!****************************************************!*\
  !*** ../components/math/pub/ArithmeticSequence.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ ArithmeticSequence)\n/* harmony export */ });\n/**\n * Represents an arithmetic sequence of numbers.\n */\nclass ArithmeticSequence {\n    constructor(start = 0, end, increment = 1) {\n        this.start = start;\n        this.end = end;\n        this.increment = increment;\n        this.currentValue = start;\n    }\n    /**\n     * Returns the current value of the sequence without advancing to the next value.\n     */\n    current() {\n        return this.currentValue;\n    }\n    /**\n     * Advances the sequence to the next value and returns the updated value.\n     */\n    next() {\n        const currentValue = this.currentValue;\n        const nextValue = currentValue + this.increment;\n        // Check if an end value is specified and if the next value exceeds it\n        if (this.end !== undefined && nextValue > this.end) {\n            throw new Error(\"Sequence has reached the end\");\n        }\n        this.currentValue = nextValue;\n        return nextValue;\n    }\n}\n\n\n//# sourceURL=webpack://bloxu-browser/../components/math/pub/ArithmeticSequence.ts?");

/***/ }),

/***/ "../components/messaging/pub/MessageFactory.ts":
/*!*****************************************************!*\
  !*** ../components/messaging/pub/MessageFactory.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ MessageFactory)\n/* harmony export */ });\n/**\n * Factory for creating objects implementing the\n * DMessage interface.\n */\nclass MessageFactory {\n    constructor(sender) {\n        this.sender = sender;\n    }\n    /**\n     * Create a new request DMessage.\n     */\n    createRequest(recipient, type, args = []) {\n        return {\n            recipient: recipient,\n            sender: this.sender,\n            type: \"request\",\n            message: {\n                type: type,\n                args: args\n            }\n        };\n    }\n    /**\n     * Create a new event DMessage.\n     */\n    createEvent(recipient, type, args = []) {\n        return {\n            recipient: recipient,\n            sender: this.sender,\n            type: \"event\",\n            message: {\n                type: type,\n                args: args\n            }\n        };\n    }\n    /**\n     * Create a new response DMessage.\n     */\n    createResponse(recipient, type, args = []) {\n        return {\n            recipient: recipient,\n            sender: this.sender,\n            type: \"event\",\n            message: {\n                type: type,\n                args: args\n            }\n        };\n    }\n}\n\n\n//# sourceURL=webpack://bloxu-browser/../components/messaging/pub/MessageFactory.ts?");

/***/ }),

/***/ "../components/messaging/pub/MessagePipe.ts":
/*!**************************************************!*\
  !*** ../components/messaging/pub/MessagePipe.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ MessagePipe)\n/* harmony export */ });\n/**\n * Can be used to join two IMessengers so that messages received from either one are\n * forwarded to the other one.\n */\nclass MessagePipe {\n    constructor(messenger1, messenger2) {\n        this.messenger1 = messenger1;\n        this.messenger2 = messenger2;\n    }\n    /**\n     * Joins the two IMessengers.\n     */\n    join() {\n        this.messenger1.onMessage(this.messenger2.postMessage.bind(this.messenger2));\n        this.messenger2.onMessage(this.messenger1.postMessage.bind(this.messenger1));\n        return this;\n    }\n}\n\n\n//# sourceURL=webpack://bloxu-browser/../components/messaging/pub/MessagePipe.ts?");

/***/ }),

/***/ "../components/messaging/pub/MessengerClass.ts":
/*!*****************************************************!*\
  !*** ../components/messaging/pub/MessengerClass.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ MessengerClass)\n/* harmony export */ });\n/* harmony import */ var _events_pub_EventEmitter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../events/pub/EventEmitter */ \"../components/events/pub/EventEmitter.ts\");\nvar __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\n\n/**\n * A wrapper for a given class that implements IMessenger\n * by simply calling the class's methods and using a ProxyMessenger.\n * The ProxyMessenger is assumed to be such that the wrappee class\n * has access to it and can thus use it to send and receive messages to and from MessengerClass.\n */\nclass MessengerClass {\n    constructor(wrappee, proxyMessenger, id = \"\") {\n        this.wrappee = wrappee;\n        this.proxyMessenger = proxyMessenger;\n        this.id = id;\n        this.emitter = new _events_pub_EventEmitter__WEBPACK_IMPORTED_MODULE_0__[\"default\"]();\n        proxyMessenger.onPostMessage((msg) => this.emitter.trigger(\"message\", [msg]));\n    }\n    /**\n     * Call a method on the wrapped class. If the class\n     * returns a result value, it will be emitted as a response message.\n     * The given msg is assumed to be of type \"request\".\n     */\n    _callMethod(msg) {\n        return __awaiter(this, void 0, void 0, function* () {\n            const result = yield this.wrappee[msg.message.type](...msg.message.args, msg);\n            // If the result is not the wrapped class itself or undefined then we assume \n            // that the result value matters and we send it as a response message.\n            if (result !== undefined &&\n                !(typeof result === \"object\" && result.constructor === this.wrappee.constructor)) {\n                const responseMsg = {\n                    sender: this.id,\n                    recipient: msg.sender,\n                    id: msg.id,\n                    type: \"response\",\n                    message: {\n                        type: msg.message.type,\n                        args: [result]\n                    }\n                };\n                this.emitter.trigger(\"message\", [responseMsg]);\n            }\n        });\n    }\n    postMessage(msg) {\n        if (msg.type === \"request\" &&\n            typeof this.wrappee === \"object\" &&\n            msg.message.type in this.wrappee) {\n            this._callMethod(msg);\n        }\n        else if (msg.type === \"response\") {\n            this.proxyMessenger.message(msg);\n        }\n        else if (msg.type === \"event\") {\n            if (typeof this.wrappee === \"object\" &&\n                \"eventHandlers\" in this.wrappee &&\n                typeof this.wrappee.eventHandlers === \"object\") {\n                // If the event type has a direct handler in the service class, \n                // we use it by default.\n                if (msg.message.type in this.wrappee.eventHandlers) {\n                    this.wrappee.eventHandlers[msg.message.type](...msg.message.args, msg);\n                }\n                else if (typeof this.wrappee.eventHandlers[\"*\"] === \"function\") {\n                    // Else, if the service class has a fallback event handler for \n                    // all events, we use that.\n                    this.wrappee.eventHandlers[\"*\"](msg);\n                }\n            }\n        }\n        return this;\n    }\n    onMessage(handler) {\n        this.emitter.on(\"message\", handler);\n        return this;\n    }\n    offMessage(handler) {\n        this.emitter.off(\"message\", handler);\n        return this;\n    }\n}\n\n\n//# sourceURL=webpack://bloxu-browser/../components/messaging/pub/MessengerClass.ts?");

/***/ }),

/***/ "../components/messaging/pub/ProxyMessenger.ts":
/*!*****************************************************!*\
  !*** ../components/messaging/pub/ProxyMessenger.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ ProxyMessenger)\n/* harmony export */ });\n/* harmony import */ var _events_pub_EventEmitter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../events/pub/EventEmitter */ \"../components/events/pub/EventEmitter.ts\");\n\nclass ProxyMessenger {\n    constructor() {\n        this.emitter = new _events_pub_EventEmitter__WEBPACK_IMPORTED_MODULE_0__[\"default\"]();\n    }\n    postMessage(msg) {\n        this.emitter.trigger(\"postMessage\", [msg]);\n        return this;\n    }\n    onMessage(handler) {\n        this.emitter.on(\"message\", handler);\n        return this;\n    }\n    offMessage(handler) {\n        this.emitter.off(\"message\", handler);\n        return this;\n    }\n    /**\n     * Listen to calls to postMessage.\n     */\n    onPostMessage(handler) {\n        this.emitter.on(\"postMessage\", handler);\n        return this;\n    }\n    /**\n     * Manually cause ProxyMessenger to send a message.\n     */\n    message(msg) {\n        this.emitter.trigger(\"message\", [msg]);\n        return this;\n    }\n}\n\n\n//# sourceURL=webpack://bloxu-browser/../components/messaging/pub/ProxyMessenger.ts?");

/***/ }),

/***/ "../components/messaging/pub/SyncMessenger.ts":
/*!****************************************************!*\
  !*** ../components/messaging/pub/SyncMessenger.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ SyncMessenger)\n/* harmony export */ });\n/* harmony import */ var _math_pub_ArithmeticSequence__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../math/pub/ArithmeticSequence */ \"../components/math/pub/ArithmeticSequence.ts\");\n/* harmony import */ var _strings_pub_StringSequence__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../strings/pub/StringSequence */ \"../components/strings/pub/StringSequence.ts\");\nvar __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\n\n\n/**\n * Provides the ability to perform synchronous messaging\n * with an IMessenger.\n */\nclass SyncMessenger {\n    constructor(messenger) {\n        this.idGenerator = new _strings_pub_StringSequence__WEBPACK_IMPORTED_MODULE_1__[\"default\"](new _math_pub_ArithmeticSequence__WEBPACK_IMPORTED_MODULE_0__[\"default\"]());\n        this.messenger = messenger;\n    }\n    /**\n     * Posts a synchronous message that will yield\n     * a response as a result.\n     */\n    postSyncMessage(req) {\n        return __awaiter(this, void 0, void 0, function* () {\n            if (req.id === undefined) {\n                req.id = req.sender + \":\" + this.idGenerator.next();\n            }\n            const waitForResponse = new Promise((resolve) => {\n                this.messenger.onMessage((res) => {\n                    if (res.type === \"response\" && res.recipient === req.sender && res.id === req.id) {\n                        resolve(res.message.args);\n                    }\n                });\n            });\n            this.messenger.postMessage(req);\n            return yield waitForResponse;\n        });\n    }\n}\n\n\n//# sourceURL=webpack://bloxu-browser/../components/messaging/pub/SyncMessenger.ts?");

/***/ }),

/***/ "../components/strings/pub/StringSequence.ts":
/*!***************************************************!*\
  !*** ../components/strings/pub/StringSequence.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ StringSequence)\n/* harmony export */ });\n/**\n * A sequence of string values.\n */\nclass StringSequence {\n    constructor(wrappee) {\n        this.wrappee = wrappee;\n        this.prefix = \"\";\n        this.suffix = \"\";\n    }\n    current() {\n        return this.prefix + this.wrappee.current().toString() + this.suffix;\n    }\n    next() {\n        return this.prefix + this.wrappee.next().toString() + this.suffix;\n    }\n}\n\n\n//# sourceURL=webpack://bloxu-browser/../components/strings/pub/StringSequence.ts?");

/***/ }),

/***/ "../components/types/EncodeableFunction.ts":
/*!*************************************************!*\
  !*** ../components/types/EncodeableFunction.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ EncodeableFunction)\n/* harmony export */ });\n/**\n * Provides the ability to transform a given function\n * into a string and vice versa.\n */\nclass EncodeableFunction {\n    constructor(f) {\n        this.wrappee = f;\n    }\n    /**\n     * The function as a string.\n     */\n    encode() {\n        if (typeof this.wrappee === \"function\") {\n            return \"return (\" + this.wrappee.toString() + \")\";\n        }\n        else {\n            return this.wrappee;\n        }\n    }\n    /**\n     * The function as a Function.\n     */\n    decode() {\n        if (typeof this.wrappee === \"string\") {\n            return (new Function(this.wrappee))();\n        }\n        else {\n            return this.wrappee;\n        }\n    }\n}\n\n\n//# sourceURL=webpack://bloxu-browser/../components/types/EncodeableFunction.ts?");

/***/ }),

/***/ "../components/types/VariableType.ts":
/*!*******************************************!*\
  !*** ../components/types/VariableType.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ VariableType)\n/* harmony export */ });\n/**\n * Provides utilities for testing the type of a variable.\n */\nclass VariableType {\n    constructor(variable) {\n        this.variable = variable;\n    }\n    isNothing() {\n        return (this.variable === null || this.variable === undefined);\n    }\n    isRealPrimitive() {\n        return !this.isNothing() && !this.isObject() && !this.isFunction();\n    }\n    isPrimitive() {\n        return !this.isObject() && !this.isFunction();\n    }\n    isFunction() {\n        return typeof this.variable === \"function\";\n    }\n    isObject() {\n        return typeof this.variable === \"object\";\n    }\n    isDataStructure() {\n        return this.isRealObject() || this.isArray();\n    }\n    isRealObject() {\n        return this.isObject() && !this.isNothing() && !this.isFunction() && !this.isArray();\n    }\n    isArray() {\n        return Array.isArray(this.variable);\n    }\n    isInstanceOf(classType) {\n        return (this.variable instanceof classType);\n    }\n}\n\n\n//# sourceURL=webpack://bloxu-browser/../components/types/VariableType.ts?");

/***/ })

}]);