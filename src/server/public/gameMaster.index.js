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

/***/ "../components/messaging/pub/Channel.ts":
/*!**********************************************!*\
  !*** ../components/messaging/pub/Channel.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ Channel)\n/* harmony export */ });\n/* harmony import */ var _messaging_pub_MessageFactory__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../messaging/pub/MessageFactory */ \"../components/messaging/pub/MessageFactory.ts\");\n/* harmony import */ var _messaging_pub_SyncMessenger__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../messaging/pub/SyncMessenger */ \"../components/messaging/pub/SyncMessenger.ts\");\nvar __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\n\n\n/**\n * Provides a more clean and convenient interface for\n * dealing with messaging to/from a specific destination.\n */\nclass Channel {\n    constructor(clientId, targetId, messenger) {\n        this.clientId = clientId;\n        this.targetId = targetId;\n        this.messenger = messenger;\n        this.syncMessenger = new _messaging_pub_SyncMessenger__WEBPACK_IMPORTED_MODULE_1__[\"default\"](this.messenger);\n        this.messageFactory = new _messaging_pub_MessageFactory__WEBPACK_IMPORTED_MODULE_0__[\"default\"](clientId);\n    }\n    /**\n     * Sends a request message to the target.\n     * Returns a promise that is fulfilled with the response of the target.\n     */\n    request(method_1) {\n        return __awaiter(this, arguments, void 0, function* (method, args = []) {\n            return yield (this.syncMessenger.postSyncMessage(this.messageFactory.createRequest(this.targetId, method, args)));\n        });\n    }\n    /**\n     * Sends an event message to the target.\n     */\n    sendEvent(eventName, args = []) {\n        this.messenger.postMessage(this.messageFactory.createEvent(this.targetId, eventName, args));\n    }\n}\n\n\n//# sourceURL=webpack://bloxu-browser/../components/messaging/pub/Channel.ts?");

/***/ }),

/***/ "../services/game_master/conf/level_logic.ts":
/*!***************************************************!*\
  !*** ../services/game_master/conf/level_logic.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ createLevelLogic)\n/* harmony export */ });\n/* harmony import */ var _components_messaging_pub_Channel__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../components/messaging/pub/Channel */ \"../components/messaging/pub/Channel.ts\");\n/* harmony import */ var _prv_LevelLogic__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../prv/LevelLogic */ \"../services/game_master/prv/LevelLogic.ts\");\n/* harmony import */ var _levels__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./levels */ \"../services/game_master/conf/levels.ts\");\nvar __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\n\n\n\nfunction createLevelLogic(proxyMessenger) {\n    // Create other service channels.\n    const players = [1, 2].map((num) => new _components_messaging_pub_Channel__WEBPACK_IMPORTED_MODULE_0__[\"default\"](\"gameMaster\", \"player-\" + num, proxyMessenger));\n    const playerCoordinator = new _components_messaging_pub_Channel__WEBPACK_IMPORTED_MODULE_0__[\"default\"](\"gameMaster\", \"playerCoordinator\", proxyMessenger);\n    const world = new _components_messaging_pub_Channel__WEBPACK_IMPORTED_MODULE_0__[\"default\"](\"gameMaster\", \"world3d\", proxyMessenger);\n    const allChannel = new _components_messaging_pub_Channel__WEBPACK_IMPORTED_MODULE_0__[\"default\"](\"gameMaster\", \"*\", proxyMessenger);\n    // Define variables shared by the level logic handlers.\n    const playerBodyIds = [];\n    let playerBodiesInPortal = [];\n    // Finally, we configure the LevelLogic instance.\n    const levelLogic = new _prv_LevelLogic__WEBPACK_IMPORTED_MODULE_1__[\"default\"]();\n    levelLogic.levels = (0,_levels__WEBPACK_IMPORTED_MODULE_2__[\"default\"])();\n    levelLogic.handleStartLevel = () => __awaiter(this, void 0, void 0, function* () {\n        for (let i = 0; i < players.length; i++) {\n            const playerBodyId = yield (players[i].request(\"bodyId\"));\n            playerBodyIds.push(playerBodyId);\n        }\n        const setPortalEnterListener = function (body) {\n            body.asPhysical.physicsAggregate.body.getCollisionObservable().add((event) => {\n                if (event.collidedAgainst.transformNode.id.includes(\"Interactables::portal\")) {\n                    this.proxyMessenger.postMessage(this.messageFactory.createEvent(\"gameMaster\", \"GameMaster:<event>playerEnterPortal\", [body.id]));\n                }\n            });\n            return true;\n        };\n        for (let i = 0; i < playerBodyIds.length; i++) {\n            yield world.request(\"modifyObject\", [playerBodyIds[i], { boundArgs: [], f: setPortalEnterListener }]);\n        }\n    });\n    levelLogic.handleEndLevel = () => {\n        playerBodiesInPortal = [];\n    };\n    levelLogic.handleEvent = (type, args) => __awaiter(this, void 0, void 0, function* () {\n        if (type === \"GameMaster:<event>playerEnterPortal\") {\n            const playerBodyId = args[0];\n            if (!playerBodiesInPortal.includes(playerBodyId)) {\n                playerBodiesInPortal.push(playerBodyId);\n                if (playerBodiesInPortal.length === players.length) {\n                    levelLogic.currentLevelIndex++;\n                    levelLogic.emitter.trigger(\"endLevel\", [levelLogic.levels[levelLogic.currentLevelIndex]]);\n                }\n                if (!levelLogic.isOnlineGame || playerBodyId.includes(levelLogic.localPlayerId)) {\n                    allChannel.sendEvent(\"GameMaster:<event>playerEnterPortal\", []);\n                }\n            }\n        }\n        else if (type === \"IOService:<event>pressKey\" && args[0] === \"r\") {\n            const selectedPlayerId = levelLogic.isOnlineGame ?\n                levelLogic.localPlayerId :\n                yield playerCoordinator.request(\"selectedCreature\");\n            const selectedPlayerBodyMeshId = playerBodiesInPortal.find((bodyId) => bodyId.includes(selectedPlayerId));\n            // If the selected player really is in the portal.\n            if (selectedPlayerBodyMeshId !== undefined) {\n                // Get the id of the player's body Object, which is different from\n                // the mesh ids stored in playerBodiesInPortal.\n                const selectedPlayerBodyId = playerBodyIds.find((bodyId) => bodyId.includes(selectedPlayerId));\n                // Unteleport the player.\n                unteleport(selectedPlayerBodyId, selectedPlayerBodyMeshId);\n                allChannel.sendEvent(\"GameMaster:<event>playerLeavePortal\", [selectedPlayerId, selectedPlayerBodyId, selectedPlayerBodyMeshId]);\n            }\n        }\n        else if (type === \"OnlineSynchronizer:GameMaster:<event>playerLeavePortal\") {\n            unteleport(args[1], args[2]);\n        }\n    });\n    function unteleport(playerBodyId, playerBodyMeshId) {\n        return __awaiter(this, void 0, void 0, function* () {\n            // The player should be marked as no longer in the portal.\n            playerBodiesInPortal = playerBodiesInPortal.filter((bodyId) => bodyId !== playerBodyMeshId);\n            // Make the portal unteleport the player's body.\n            yield world.request(\"modifyObject\", [playerBodyId, { boundArgs: [], f: function (body) {\n                        const portal = this.getObject(\"Interactables::portal?0\");\n                        portal.unteleport(body);\n                    } }]);\n        });\n    }\n    return levelLogic;\n}\n\n\n//# sourceURL=webpack://bloxu-browser/../services/game_master/conf/level_logic.ts?");

/***/ }),

/***/ "../services/game_master/conf/levels.ts":
/*!**********************************************!*\
  !*** ../services/game_master/conf/levels.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ getLevels)\n/* harmony export */ });\nfunction getLevels() {\n    return [\n        \"level1\",\n        \"level2\",\n        \"level3\",\n        \"level4\",\n        \"level5\",\n        \"level6\",\n        \"level7\"\n    ];\n}\n\n\n//# sourceURL=webpack://bloxu-browser/../services/game_master/conf/levels.ts?");

/***/ }),

/***/ "../services/game_master/conf/players.ts":
/*!***********************************************!*\
  !*** ../services/game_master/conf/players.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ getPlayers)\n/* harmony export */ });\nfunction getPlayers() {\n    return [\n        {\n            id: \"player-1\",\n            spawnLocation: { x: 4, y: 6, z: -7 }\n        },\n        {\n            id: \"player-2\",\n            spawnLocation: { x: 0, y: 6, z: -7 }\n        }\n    ];\n}\n\n\n//# sourceURL=webpack://bloxu-browser/../services/game_master/conf/players.ts?");

/***/ }),

/***/ "../services/game_master/prv/LevelLogic.ts":
/*!*************************************************!*\
  !*** ../services/game_master/prv/LevelLogic.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ LevelLogic)\n/* harmony export */ });\n/* harmony import */ var _components_events_pub_EventEmitter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../components/events/pub/EventEmitter */ \"../components/events/pub/EventEmitter.ts\");\n\n/**\n * Contains the game's logic relating to\n * level states, such as when the level has ended.\n * LevelLogic does not implement any of this logic\n * but is intended for the client to configure.\n */\nclass LevelLogic {\n    constructor() {\n        this.emitter = new _components_events_pub_EventEmitter__WEBPACK_IMPORTED_MODULE_0__[\"default\"]();\n        this.handleStartLevel = () => { };\n        this.handleEndLevel = () => { };\n        this.handleEvent = () => { };\n        this.currentLevelIndex = 0;\n        this.levels = [];\n        this.isOnlineGame = false;\n    }\n    /**\n     * Sets an event listener for the 'endLevel' event,\n     * which is triggered when LevelLogic concludes\n     * that the level has ended.\n     */\n    onEndLevel(callback) {\n        this.emitter.on(\"endLevel\", callback);\n    }\n    offEndLevel(callback) {\n        this.emitter.off(\"endLevel\", callback);\n    }\n}\n\n\n//# sourceURL=webpack://bloxu-browser/../services/game_master/prv/LevelLogic.ts?");

/***/ }),

/***/ "../services/game_master/pub/GameMaster.ts":
/*!*************************************************!*\
  !*** ../services/game_master/pub/GameMaster.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ GameMaster)\n/* harmony export */ });\n/* harmony import */ var _components_messaging_pub_ProxyMessenger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../components/messaging/pub/ProxyMessenger */ \"../components/messaging/pub/ProxyMessenger.ts\");\n/* harmony import */ var _components_messaging_pub_SyncMessenger__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../components/messaging/pub/SyncMessenger */ \"../components/messaging/pub/SyncMessenger.ts\");\n/* harmony import */ var _components_messaging_pub_MessageFactory__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../components/messaging/pub/MessageFactory */ \"../components/messaging/pub/MessageFactory.ts\");\n/* harmony import */ var _components_messaging_pub_Channel__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../components/messaging/pub/Channel */ \"../components/messaging/pub/Channel.ts\");\n/* harmony import */ var _conf_level_logic__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../conf/level_logic */ \"../services/game_master/conf/level_logic.ts\");\n/* harmony import */ var _conf_players__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../conf/players */ \"../services/game_master/conf/players.ts\");\nvar __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\n\n\n\n\n\n\n/**\n * Class that contains the operations and state\n * of the LocalGameMaster service.\n */\nclass GameMaster {\n    constructor() {\n        this.proxyMessenger = new _components_messaging_pub_ProxyMessenger__WEBPACK_IMPORTED_MODULE_0__[\"default\"]();\n        this.messageFactory = new _components_messaging_pub_MessageFactory__WEBPACK_IMPORTED_MODULE_2__[\"default\"](\"gameMaster\");\n        this.gameRunning = false;\n        this.cubeSize = 1.34;\n        this.characterHeight = 1.8;\n        this.worldIsRunning = false;\n        this.syncMessenger = new _components_messaging_pub_SyncMessenger__WEBPACK_IMPORTED_MODULE_1__[\"default\"](this.proxyMessenger);\n        this.worldChannel = new _components_messaging_pub_Channel__WEBPACK_IMPORTED_MODULE_3__[\"default\"](\"gameMaster\", \"world3d\", this.proxyMessenger);\n        this.players = (0,_conf_players__WEBPACK_IMPORTED_MODULE_5__[\"default\"])();\n        this.levelLogic = (0,_conf_level_logic__WEBPACK_IMPORTED_MODULE_4__[\"default\"])(this.proxyMessenger);\n        this.eventHandlers = {\n            \"Player:<event>die\": this.onPlayerDeath.bind(this),\n            \"OnlineSynchronizer:<event>remotePlayerJoined\": this.onPlayerJoined.bind(this),\n            \"OnlineSynchronizer:GameMaster:<event>remoteStartGame\": this.onRemoteStartGame.bind(this),\n            \"*\": this.onAnyEvent.bind(this)\n        };\n        this.initialized = false;\n    }\n    /**\n     * Create a new standard-sized cube island in the world\n     * at the given position.\n     */\n    createCubeIsland(id, position) {\n        this.proxyMessenger.postMessage({\n            sender: \"gameMaster\",\n            recipient: \"world3d\",\n            type: \"request\",\n            message: {\n                type: \"createObject\",\n                args: [id, \"FloatingCube\", {\n                        boundArgs: [id, position, this.cubeSize],\n                        f: function (id, position, cubeSize) {\n                            return [\n                                id,\n                                cubeSize,\n                                new this.babylonjs.Vector3(position.x, position.y, position.z),\n                                this.scene\n                            ];\n                        }\n                    }]\n            }\n        });\n    }\n    /**\n     * Initialization procedure for the LocalGameMaster service.\n     */\n    initialize() {\n        return __awaiter(this, void 0, void 0, function* () {\n            this.initialized = true;\n            return true;\n        });\n    }\n    /**\n     * In-game id of the other player, which is the remote player.\n     * We assume the game is 2-player.\n     */\n    remotePlayerId() {\n        if (this.localPlayerId === this.players[0].id) {\n            return this.players[1].id;\n        }\n        else {\n            return this.players[0].id;\n        }\n    }\n    /**\n     * Host a new game. Returns the code that can be used\n     * to invite other players to the game.\n     */\n    hostGame() {\n        return __awaiter(this, void 0, void 0, function* () {\n            const [code, localPlayerId] = yield this.syncMessenger.postSyncMessage({\n                recipient: \"onlineSynchronizer\",\n                sender: \"gameMaster\",\n                type: \"request\",\n                message: {\n                    type: \"hostGame\",\n                    args: []\n                }\n            });\n            this.localPlayerId = localPlayerId;\n            this.levelLogic.localPlayerId = this.localPlayerId;\n            this.levelLogic.isOnlineGame = true;\n            return code;\n        });\n    }\n    /**\n     * Starts a local game against an AI opponent.\n     */\n    startLocalGame() {\n        return __awaiter(this, void 0, void 0, function* () {\n            const [code, localPlayerId] = yield this.syncMessenger.postSyncMessage({\n                recipient: \"onlineSynchronizer\",\n                sender: \"gameMaster\",\n                type: \"request\",\n                message: {\n                    type: \"hostGame\",\n                    args: []\n                }\n            });\n            this.localPlayerId = localPlayerId;\n            this.levelLogic.localPlayerId = this.localPlayerId;\n            this.levelLogic.isOnlineGame = false;\n            yield this._startGame(true);\n            return true;\n        });\n    }\n    /**\n     * Join an existing game by using a code given by\n     * the host of the game.\n     */\n    joinGame(code) {\n        return __awaiter(this, void 0, void 0, function* () {\n            const response = yield this.syncMessenger.postSyncMessage({\n                recipient: \"onlineSynchronizer\",\n                sender: \"gameMaster\",\n                type: \"request\",\n                message: {\n                    type: \"joinGame\",\n                    args: [code]\n                }\n            });\n            this.levelLogic.isOnlineGame = true;\n            if (typeof response === \"string\") {\n                this.localPlayerId = response;\n                this.levelLogic.localPlayerId = this.localPlayerId;\n            }\n            return response;\n        });\n    }\n    /**\n     * When a player has died.\n     */\n    onPlayerDeath(playerId) {\n        if (this.gameRunning) {\n            // Pause the game engine.\n            this.proxyMessenger.postMessage(this.messageFactory.createRequest(\"world3d\", \"pauseRenderLoop\"));\n            // Notify the service's environment that the game has ended.\n            this.proxyMessenger.postMessage(this.messageFactory.createEvent(\"*\", \"GameMaster:<event>endGame\"));\n            // Determine whether the local player has lost or won.\n            if (playerId === this.localPlayerId) {\n                // Notify the environment that the local player has lost.\n                this.proxyMessenger.postMessage(this.messageFactory.createEvent(\"*\", \"GameMaster:<event>loseGame\"));\n            }\n            else {\n                // Notify the environment that the local player has won.\n                this.proxyMessenger.postMessage(this.messageFactory.createEvent(\"*\", \"GameMaster:<event>winGame\"));\n            }\n            this.gameRunning = false;\n        }\n    }\n    /**\n     * When a player other than the main local player has joined the game.\n     */\n    onPlayerJoined(playerId) {\n        return __awaiter(this, void 0, void 0, function* () {\n            yield this._startGame();\n            this.proxyMessenger.postMessage(this.messageFactory.createEvent(\"*\", \"GameMaster:<event>remoteStartGame\", [this.levelLogic.currentLevelIndex]));\n        });\n    }\n    /**\n     * When a remote GameMaster has started a game.\n     */\n    onRemoteStartGame(levelIndex) {\n        return __awaiter(this, void 0, void 0, function* () {\n            yield this.selectLevel(levelIndex);\n            yield this._startGame();\n        });\n    }\n    /**\n     * Fallback for any event that does not\n     * have a specific handler.\n     */\n    onAnyEvent(msg) {\n        if (!this.gameRunning)\n            return;\n        this.levelLogic.handleEvent(msg.message.type, msg.message.args);\n    }\n    /**\n     * Returns the list of levels the game has.\n     */\n    levels() {\n        return this.levelLogic.levels;\n    }\n    /**\n     * Sets the given level as the level\n     * that will start once the game begins.\n     */\n    selectLevel(levelIndex_1) {\n        return __awaiter(this, arguments, void 0, function* (levelIndex, preview = false) {\n            this.levelLogic.currentLevelIndex = levelIndex;\n            if (preview)\n                this.previewLevel(levelIndex);\n            return true;\n        });\n    }\n    /**\n     * Selects and loads the level with the given index.\n     */\n    previewLevel(levelIndex) {\n        return __awaiter(this, void 0, void 0, function* () {\n            if (this.levelLogic.previewedLevel === levelIndex)\n                return;\n            if (!this.worldIsRunning) {\n                // Make the world run.\n                yield this.worldChannel.request(\"run\");\n                this.worldIsRunning = true;\n                // Adjust the camera.\n                const adjustCamera = function () {\n                    const target = new this.babylonjs.TransformNode(\"GameMaster:cameraTarget\");\n                    target.setAbsolutePosition(new this.babylonjs.Vector3(1.375, 3.5, -5.124));\n                    this.camera.lockedTarget = target;\n                    this.camera.radius = 16;\n                };\n                this.worldChannel.request(\"modify\", [{ boundArgs: [], f: adjustCamera }]);\n            }\n            // Select the preview level.\n            this.levelLogic.previewedLevel = levelIndex;\n            yield this.worldChannel.request(\"selectMap\", [this.levelLogic.levels[levelIndex]]);\n            return true;\n        });\n    }\n    /**\n     * Spawn everything needed for the game\n     * and make the 3D world run.\n     */\n    _startGame() {\n        return __awaiter(this, arguments, void 0, function* (isSinglePlayer = false) {\n            // vvv Setup environment. vvv\n            // Ensure world is running.\n            if (!this.worldIsRunning) {\n                yield this.worldChannel.request(\"run\");\n                this.worldIsRunning = true;\n            }\n            // Create map.\n            if (this.levelLogic.previewedLevel === undefined ||\n                this.levelLogic.previewedLevel !== this.levelLogic.currentLevelIndex) {\n                yield this.worldChannel.request(\"selectMap\", [this.levelLogic.levels[this.levelLogic.currentLevelIndex]]);\n            }\n            // vvv Setup players. vvv        \n            // Tell the player services who is the main player and who is the remote / AI player.\n            this.proxyMessenger.postMessage(this.messageFactory.createRequest(this.localPlayerId, \"beCreature\", [\"PlayerBody\", true]));\n            this.proxyMessenger.postMessage(this.messageFactory.createRequest(this.remotePlayerId(), !isSinglePlayer ? \"beRemoteCreature\" : \"beCreature\", [\"PlayerBody\"]));\n            // Initialize players.\n            yield this.syncMessenger.postSyncMessage(this.messageFactory.createRequest(this.localPlayerId, \"initialize\"));\n            yield this.syncMessenger.postSyncMessage(this.messageFactory.createRequest(this.remotePlayerId(), \"initialize\"));\n            // Initialize coordinator service for the players.\n            const selectablePlayers = this.levelLogic.isOnlineGame ? [this.localPlayerId] :\n                this.players.map((player) => player.id);\n            yield this.syncMessenger.postSyncMessage(this.messageFactory.createRequest(\"playerCoordinator\", \"initialize\", [selectablePlayers, this.localPlayerId === this.players[0].id ? 0 : 1]));\n            // Spawn players.\n            for (let i = 0; i < this.players.length; i++) {\n                const player = this.players[i];\n                yield this.syncMessenger.postSyncMessage(this.messageFactory.createRequest(player.id, \"spawn\", [player.spawnLocation]));\n            }\n            // vvv Setup level change logic. vvv\n            yield this.levelLogic.handleStartLevel();\n            // Setup event listener for when the level ends and the map should change.\n            this.levelLogic.onEndLevel((nextLevelId) => __awaiter(this, void 0, void 0, function* () {\n                if (nextLevelId !== undefined) {\n                    // Pause player services to make sure they don't handle inputs\n                    // while we are resetting the world and the creatures's\n                    // controllers and bodies in the world.\n                    for (let i = 0; i < this.players.length; i++) {\n                        yield this.syncMessenger.postSyncMessage(this.messageFactory.createRequest(this.players[i].id, \"pause\"));\n                    }\n                    // Select next map.\n                    yield this.worldChannel.request(\"selectMap\", [nextLevelId]);\n                    // Respawn players.\n                    this.players.forEach((player) => {\n                        this.proxyMessenger.postMessage(this.messageFactory.createRequest(player.id, \"respawn\", [player.spawnLocation]));\n                    });\n                    // Reset level change logic.\n                    yield this.levelLogic.handleEndLevel();\n                    yield this.levelLogic.handleStartLevel();\n                    // Resume player services.\n                    for (let i = 0; i < this.players.length; i++) {\n                        yield this.syncMessenger.postSyncMessage(this.messageFactory.createRequest(this.players[i].id, \"resume\"));\n                    }\n                    // Trigger event notifying of starting a new level.\n                    this.proxyMessenger.postMessage(this.messageFactory.createEvent(\"*\", \"GameMaster:<event>startLevel\", [this.levelLogic.currentLevelIndex]));\n                }\n                else {\n                    this.proxyMessenger.postMessage(this.messageFactory.createEvent(\"*\", \"GameMaster:<event>completeGame\"));\n                }\n            }));\n            this.proxyMessenger.postMessage(this.messageFactory.createEvent(\"*\", \"GameMaster:<event>startLevel\", [this.levelLogic.currentLevelIndex]));\n            this.proxyMessenger.postMessage(this.messageFactory.createEvent(\"*\", \"GameMaster:<event>startGame\", [this.levelLogic.currentLevelIndex]));\n            this.gameRunning = true;\n        });\n    }\n}\n\n\n//# sourceURL=webpack://bloxu-browser/../services/game_master/pub/GameMaster.ts?");

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