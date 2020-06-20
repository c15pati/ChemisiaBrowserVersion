//=============================================================================
// DEV.js
//=============================================================================
//Version 1.4.1

/* jshint -W097 */
/* jshint -W117 */
/* jshint -W104 */

/*:
 * @plugindesc DEV funcs for testing and debbung new plugins.
 * @author Pheonix KageDesu.
 *
 * @param Show Console
 * @desc Show Console on game Start?
 * @type boolean
 * @on Show
 * @off Not
 * @default true
 *
 * @param Skip Title
 * @desc Skip title screen?
 * @type boolean
 * @on Skip
 * @off Not
 * @default true
 *
 * @param Mobile
 * @desc Simulate mobile
 * @type boolean
 * @on Yes
 * @off No
 * @default false
 *
 * @param Build
 * @desc Calculate build version
 * @type boolean
 * @on Yes
 * @off No
 * @default true
 *
 * @param Plugin
 * @desc Name of Plugin for calculate build version
 * @type string
 * @default
 *
 * @help
 * Allow you use Scene_Test class as a parent for test scenes, methods: update_test, create_test
 * Allow you create comment with text '[@TextToShow]' on event
 *
 */
var DEV = DEV || {};

(function ($) {
	"use strict";
	//Read Params
	var parameters = PluginManager.parameters('Dev14');
	var pShowConsole = JSON.parse(String(parameters['Show Console'] || 'true'));
	var pSkipTitle = JSON.parse(String(parameters['Skip Title'] || 'true'));
	var pCalcBuildVer = JSON.parse(String(parameters.Build || 'true'));
	var pSimulateMobile = JSON.parse(String(parameters.Mobile || 'false'));
	var pCalcBuildPlugin = String(parameters.Plugin || '');

	//Aliasing basic methods
	var Aliases = {
		SceneManager: {
			run: SceneManager.run
		},
		Scene_Boot: {
			start: Scene_Boot.prototype.start
		}
	};

	//------------------------------------------------------------------------------
	//SceneManager
	SceneManager.run = function (sceneClass) {
		Aliases.SceneManager.run.apply(this, arguments);
		if (pShowConsole)
			this.showConsole();
	}

	//NEW
	SceneManager.showConsole = function () {
		//Thanks to Yanfly
		if (Utils.isNwjs() && Utils.isOptionValid('test')) {
			var _debugWindow = nw.Window.get().showDevTools();
			window.focus();
		}
	}

	//END SceneManager
	//------------------------------------------------------------------------------

	//------------------------------------------------------------------------------
	//Scene_Boot
	Scene_Boot.prototype.start = function () {
		if(KDCore != undefined)
			KDCore.DevLog.EnableAllLogs();
		if (pSkipTitle) {
			SoundManager.preloadImportantSounds();
			if (DataManager.isBattleTest()) {
				DataManager.setupBattleTest();
				SceneManager.goto(Scene_Battle);
			} else if (DataManager.isEventTest()) {
				DataManager.setupEventTest();
				SceneManager.goto(Scene_Map);
			} else {
				this.checkPlayerLocation();
				DataManager.setupNewGame();
				SceneManager.goto(Scene_Map);
			}
		} else
			Aliases.Scene_Boot.start.apply(this, arguments);
	}
	//END Scene_Boot
	//------------------------------------------------------------------------------

	//------------------------------------------------------------------------------
	//NEW
	//Scene_Test
	class Scene_Test extends Scene_Base {
		constructor() {
			super();
		}

		create() {
			Scene_Base.prototype.create.call(this);
			this._draw_background();
			this.createWindowLayer();
			this.create_test();
		}

		update() {
			Scene_Base.prototype.update.call(this);
			this.update_test();
			//EXIT
			if (this.isExit()) {
				this.popScene();
			}
		}

		isExit() { //CAN BE OVERRIDE
			return (Input.isTriggered('cancel') || TouchInput.isCancelled());
		}

		create_test() {
			//CUSTOM CODE
		}

		update_test() {
			//CUSTOM CODE
		}

		//RPIVATE
		_draw_background() {
			this._backgroundSprite = new Sprite();
			this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
			this._backgroundSprite.setBlendColor([16, 16, 16, 128]);
			this.addChild(this._backgroundSprite);
		}

	}
	//END Scene_Test
	//------------------------------------------------------------------------------

	var _alias_Utils_isMobileDevice = Utils.isMobileDevice;
	Utils.isMobileDevice = function () {
		if (pSimulateMobile)
			return true;
		else
			_alias_Utils_isMobileDevice.call(this, arguments);
	};

	//Asign Scene_Test to DEV object
	$.Scene_Test = Scene_Test;

	$.isNeedBuild = pCalcBuildVer;
	$.pluginName = pCalcBuildPlugin;

})(DEV);

//=============================================================================
//EVENT MESSAGES
//=============================================================================
(function () {

	var FONT_NAME = 'Arial';
	var FONT_SIZE = 16;

	var EventMessages = {
		structAlias: {
			Game_CharacterBase: {
				initialize: Game_CharacterBase.prototype.initialize
			},
			Game_Event: {
				setupPageSettings: Game_Event.prototype.setupPageSettings
			},
			Sprite_Character: {
				initialize: Sprite_Character.prototype.initialize,
				update: Sprite_Character.prototype.update
			}
		}
	};

	Game_CharacterBase.prototype.initialize = function () {
		EventMessages.structAlias.Game_CharacterBase.initialize.apply(this);
		this.eText = null;
	};

	Game_Event.prototype.setupPageSettings = function () {
		EventMessages.structAlias.Game_Event.setupPageSettings.apply(this);
		if (this.list != null) {
			var lst = this.page().list;
			for (var i = 0; i < lst.length; i++) {
				var element = lst[i];
				if (element.code == 108) {
					var comment = element.parameters[0];
					if (comment.indexOf("[@") >= 0) {
						var regular = /\[@([^>]*)\]/;
						var match = regular.exec(comment);
						if (match) {
							this.eText = match[1];
						}
						break;
					}
				}
			}
		}
	}

	Sprite_Character.prototype.initialize = function (character) {
		EventMessages.structAlias.Sprite_Character.initialize.apply(this, arguments);
		this._charText = "";
		this._eventText = null; //Sprite
		this.createEventText();
	}

	Sprite_Character.prototype.update = function () {
		EventMessages.structAlias.Sprite_Character.update.apply(this);
		this.createEventText();
		this.updateEventText();
	}

	//NEW
	Sprite_Character.prototype.createEventText = function () {
		if (!this._character) return;
		if (!this._character.eText) return;
		if (this._character.eText == this._charText) return;

		if (this._eventText != null) {
			this.removeChild(this._eventText);
		}

		this._eventText = new Sprite_Character_Text(this._character, this);
		this._charText = this._character.eText;
		this.addChild(this._eventText);
	}

	//NEW
	Sprite_Character.prototype.updateEventText = function () {
		if (this._eventText == null) return;
		this._eventText.updatePosition(this._character, this);
	}

	//------------------------------------------------------------------------------
	//Sprite_Character_Text
	class Sprite_Character_Text extends Sprite_Base {
		constructor(character, sprite) {
			super();
			var textSize = character.eText || "";
			var w = 48 + ((FONT_SIZE / 2) * textSize.length);
			if (w < 48) w = 48;
			this.bitmap = new Bitmap(w, 48);
			this.bitmap.addLoadListener(function () {
				this.bitmap.fontFace = FONT_NAME;
				this.bitmap.fontSize = FONT_SIZE;
				this.bitmap.drawText(textSize, 0, 0, this.width, this.height, 'center');
			}.bind(this));
			this.updatePosition(character, sprite);
		}

		updatePosition(character, sprite) {
			if (character._erased) {
				this.visible = false;
				return;
			}
			this.x = 0 - this.width / 2;
			this.y = 0 - (sprite.height + this.height);
			this.z = character.screenZ();
			this.visible = character.isTransparent() ? false : true;
			this.opacity = character._opacity;
		}
	}
	//END Sprite_Character_Text
	//------------------------------------------------------------------------------
})();

//=============================================================================
//BUILD VERSION
//=============================================================================
(function () {

	String.prototype.hashCode = function () {
		var hash = 0,
			i, chr, len;
		if (this.length === 0) return hash;
		for (i = 0, len = this.length; i < len; i++) {
			chr = this.charCodeAt(i);
			hash = ((hash << 5) - hash) + chr;
			hash |= 0; // Convert to 32bit integer
		}
		return hash;
	};

	var saveBuild = function (build) {
		var data = LZString.compressToBase64(JsonEx.stringify(build));
		var fs = require('fs');
		fs.writeFileSync(_filePath(), data);
	}

	var savePluginBuild = function (build) {
		var data = LZString.compressToBase64(JsonEx.stringify(build));
		var fs = require('fs');
		fs.writeFileSync(_pluginBuildPath(), data);
	}

	var loadBuild = function () {
		var data = null;
		var fs = require('fs');
		var fp = _filePath();
		if (fs.existsSync(fp)) {
			data = fs.readFileSync(fp, {
				encoding: 'utf8'
			});
		} else {
			console.log("Build file not exists. Create new");
		}
		if (data) {
			return JSON.parse(LZString.decompressFromBase64(data));
		} else
			return 1;
	}

	var loadPluginBuild = function () {
		var data = null;
		var fs = require('fs');
		var fp = _pluginBuildPath();
		if (fs.existsSync(fp)) {
			data = fs.readFileSync(fp, {
				encoding: 'utf8'
			});
		} else {
			console.log("Plugin build file not exists. Create new");
		}

		if (data) {
			_pluginBuild = JSON.parse(LZString.decompressFromBase64(data));
		} else
			_pluginBuild = {
				build: 0,
				date: ''
			};
	}

	var _checkPluginNew = function () {
		var fs = require('fs');
		var fp = _pluginPath();
		if (fs.existsSync(fp)) {
			_pluginDate = String(fs.statSync(fp).mtime).hashCode();
		}

		if (_pluginDate == _pluginBuild.date) {
			return false;
		} else {
			return true;
		}
	}

	var _filePath = function () {
		var path = require('path');
		var base = path.dirname(process.mainModule.filename);
		var dir = path.join(base, 'data/');
		var filePath = dir + 'build.bin';
		return filePath;
	}

	var _pluginPath = function () {
		var path = require('path');
		var base = path.dirname(process.mainModule.filename);
		var dir = path.join(base, 'js/plugins/');
		var filePath = dir + DEV.pluginName + ".js";
		return filePath;
	}

	var _pluginBuildPath = function () {
		var path = require('path');
		var base = path.dirname(process.mainModule.filename);
		var dir = path.join(base, 'data/');
		var filePath = dir + DEV.pluginName + "_build.bin";
		return filePath;
	}

	var _build = 0;
	var _pluginBuild = {
		build: 0,
		date: ''
	};
	var _pluginDate = '';

	DataManager.checkBuild = function () {
		console.log("Build: " + _build);
		return _build;
	}

	DataManager.checkPluginBuild = function () {
		console.log("Build for " + DEV.pluginName + ": " + _pluginBuild.build);
		return _pluginBuild;
	}

	var _Scene_Boot_initialize = Scene_Boot.prototype.initialize;
	Scene_Boot.prototype.initialize = function () {
		if (Utils.isNwjs() == false) {
			_Scene_Boot_initialize.call(this);
			return;
		}

		if (DEV.isNeedBuild) {
			_build = loadBuild();
			_build += 1;
			console.log("Build: " + _build);
			saveBuild(_build);
		}
		if (DEV.pluginName != '') {
			loadPluginBuild();
			if (_checkPluginNew()) {
				_pluginBuild.build += 1;
				_pluginBuild.date = _pluginDate;
				savePluginBuild(_pluginBuild);
			}
			DataManager.checkPluginBuild();
		}
		_Scene_Boot_initialize.call(this);

	};
})();