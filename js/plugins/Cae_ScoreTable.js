//=========================================================
// Cae_ScoreTable.js
//=========================================================

/*:
 * @plugindesc v1.2 - Adds a customisable high-score scene to the game.
 * @author Caethyril
 *
 * @help Plugin Commands:
 *   ShowScores
 *     - goes to the new score scene
 *   ResetScores
 *     - resets the score list to default
 *   AddScore score name
 *     - adds a new score to the list
 *     - underscores will be replaced by spaces if necessary
 *     - v[x] will be replaced with the value of variable x
 *     - n[x] will be replaced with the name of actor id x
 *     - p[x] will be replaced with the name of party member x
 *     - examples:
 *         AddScore 500 Player
 *         AddScore 14.43 Best_Time
 *         AddScore v[2] p[0]
 *         AddScore 1000 n[v[5]]
 *     - numerical scores are sorted largest -> smallest
 *       non-numerical scores are sorted A -> Z
 *
 *   Alternatively, you can use a script call:
 *       CAE.ScoreTable.addScore([score, name]);
 *   For example:
 *       var score = $gameVariables.value(1);     // game variable 1
 *       var name = $gameActors.actor(1).name();  // name of actor 1
 *       CAE.ScoreTable.addScore([score, name]);  // add score
 *
 * Help (Score Format):
 *   Each score will appear as dictated by the Score Format plugin parameter.
 *   A format comprises a number of "components".
 *   Each component displays one piece of data for the score item.
 *   Each component has its own box width, text alignment, and text colour.
 *   Available component types:
 *    - Data: display a value based on the current score
 *      -> Ext = Score: the score value
 *      -> Ext = Name:  the associated name
 *      -> Ext = Index: the position of the score in the list (starting at 1)
 *    - Text: display some text
 *      -> Ext: the text to display
 *    - Eval: display some text resulting from a code expression
 *      -> Ext: the code to evaluate
 *         (Available local values include score.Score, score.Name, and index.)
 *
 * Compatibility:
 *   Aliases:
 *      StorageManager:      webStorageKey, localFilePath
 *      DataManager:         loadDatabase, isDatabaseLoaded
 *      Window_TitleCommand: makeCommandList
 *      Scene_Title:         createCommandWindow
 *      Window_MenuCommand:  makeCommandList
 *      Scene_Menu:          createCommandWindow
 *   Defines:
 *      Scene_Title:         commandScoreTable
 *      Scene_Menu:          commandScoreTable
 *   New:
 *      Window_ScoreTable
 *      Scene_ScoreTable
 *   Saves score data to new global save file.
 *
 * Terms of use:
 *   Free to use and modify.
 *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * Update log:
 *   1.2: Fix for non-numerical score sort, should actually work now...
 *   1.1: Removed unnecessary file extension from web storage key.
 *        Added n[x] and p[x] for plugin command inputs! \o/
 *        Score window now auto-selects the newest score this session.
 *        Non-numerical score sort is no longer case-sensitive.
 *        New scene & window prototypes now have global scope.
 *        Tidied up some code and descriptions.
 *   1.0: Initial release.
 *
 * @param --- Scores ---
 * @text --- Scores ---
 * @type select
 * @desc Options relating to scores, including storage and display formatting.
 *
 * @param Score Count
 * @text Score Count
 * @parent --- Scores ---
 * @type number
 * @min 1
 * @desc Maximum number of scores to track
 * Default: 10
 * @default 10
 *
 * @param Default Score List
 * @text Default Score List
 * @parent --- Scores ---
 * @type struct<CaeTypeScoreTable>[]
 * @desc Starting score list, before any player scores have been logged.
 * @default []
 *
 * @param Score Format
 * @text Score Format
 * @parent --- Scores ---
 * @type struct<CaeTypeScoreFormatComponent>[]
 * @desc Rules that determine how each score displays in the list.
 * @default ["{\"Type\":\"Data\",\"Ext\":\"Index\",\"Width\":\"32\",\"Align\":\"center\",\"Colour\":\"1\"}","{\"Type\":\"Data\",\"Ext\":\"Name\",\"Width\":\"this.contentsWidth() / 2 - 32 - this.formatPadding()\",\"Align\":\"left\",\"Colour\":\"0\"}","{\"Type\":\"Data\",\"Ext\":\"Score\",\"Width\":\"this.contentsWidth() / 2 - 2 * this.formatPadding()\",\"Align\":\"right\",\"Colour\":\"14\"}","{\"Type\":\"Text\",\"Ext\":\"\",\"Width\":\"0\",\"Align\":\"left\",\"Colour\":\"0\"}"]
 *
 * @param Format Padding
 * @text Format Padding
 * @parent --- Scores ---
 * @type number
 * @min -1
 * @desc Horizontal padding (px) between each format component.
 * Use -1 for standardPadding (default 24 px).
 * @default -1
 *
 * @param --- Title Command ---
 * @text --- Title Command ---
 * @type select
 * @desc Options relating to the Show Scores command on the title menu.
 *
 * @param Title Command Name
 * @text Title Command Name
 * @parent --- Title Command ---
 * @type text
 * @desc Name of the score table command on the title menu.
 * Leave blank to not add the command.
 * @default View Scores
 *
 * @param Title Command Position
 * @text Title Command Position
 * @parent --- Title Command ---
 * @type number
 * @min -999999
 * @desc Where to insert the score table title command.
 * Negative numbers count from the end of the list.
 * @default 10000
 *
 * @param Title Command Symbol
 * @text Title Command Symbol
 * @parent --- Title Command ---
 * @type text
 * @desc Internal symbol used for the score table title command.
 * @default scoreTable
 *
 * @param --- Pause Command ---
 * @text --- Pause Command ---
 * @type select
 * @desc Options relating to the Show Scores command on the pause menu.
 *
 * @param Pause Command Name
 * @text Pause Command Name
 * @parent --- Pause Command ---
 * @type text
 * @desc Name of the score table command on the pause menu.
 * Leave blank to not add the command.
 * @default
 *
 * @param Pause Command Position
 * @text Pause Command Position
 * @parent --- Pause Command ---
 * @type number
 * @min -999999
 * @desc Where to insert the score table pause menu command.
 * Negative numbers count from the end of the list.
 * @default -3
 *
 * @param Pause Command Symbol
 * @text Pause Command Symbol
 * @parent --- Pause Command ---
 * @type text
 * @desc Internal symbol used for the score table pause menu command.
 * @default scoreTable
 *
 * @param --- Table Settings ---
 * @text --- Table Settings ---
 * @type select
 * @desc Options relating to the position and appearance of the score table on-screen.
 *
 * @param Table X
 * @text Table X
 * @parent --- Table Settings ---
 * @type combo
 * @option 20
 * @option 48
 * @option Graphics.boxWidth * 1 / 10
 * @desc Distance in px between left edge of the screen and left edge of score window. Evals permitted.
 * @default Graphics.boxWidth * 1 / 10
 *
 * @param Table Y
 * @text Table Y
 * @parent --- Table Settings ---
 * @type combo
 * @option 20
 * @option 48
 * @option Graphics.boxHeight * 2 / 8
 * @desc Distance in px between top edge of the screen and top edge of score window. Evals permitted.
 * @default Graphics.boxHeight * 2 / 8
 *
 * @param Table Width
 * @text Table Width
 * @parent --- Table Settings ---
 * @type combo
 * @option 200
 * @option 550
 * @option Graphics.boxWidth * 8 / 10
 * @desc Width of score table in px. Evals permitted.
 * @default Graphics.boxWidth * 8 / 10
 *
 * @param Table Height
 * @text Table Height
 * @parent --- Table Settings ---
 * @type combo
 * @option 200
 * @option 400
 * @option Graphics.boxHeight * 5 / 8
 * @option 10 * this.lineHeight() - 2 * this.standardPadding()
 * @desc Height of score table in px. Evals permitted.
 * @default 10 * this.lineHeight() + 2 * this.standardPadding()
 *
 * @param Table Background Type
 * @text Table Background Type
 * @parent --- Table Settings ---
 * @type select
 * @option 0 - Normal
 * @value 0
 * @option 1 - Dim
 * @value 1
 * @option 2 - Transparent
 * @value 2
 * @desc Determines the type of window background.
 * Default: 0 - Normal
 * @default 0
 *
 * @param --- Scene Extras ---
 * @text --- Scene Extras ---
 * @type select
 * @desc Options for additional score scene features like a custom background and BGM!
 *
 * @param Scores Title
 * @text Scores Title
 * @parent --- Scene Extras ---
 * @type struct<CaeTypeScoreTitle>
 * @desc Optional title to display, including various text settings.
 * @default {"Text":"Scores","X":"0","Y":"(this.y - this.lineHeight()) / 2","Width":"-1","Font Size":"60","Align":"center","Colour":"white","Outline Colour":"black","Outline Width":"6"}
 *
 * @param Scores Background 1
 * @text Scores Background 1
 * @parent --- Scene Extras ---
 * @type file
 * @dir img/titles1
 * @require 1
 * @desc Optional background image for this scene.
 * If omitted, the default blurred snapshot will be used.
 * @default
 *
 * @param Scores Background 2
 * @text Scores Background 2
 * @parent --- Scene Extras ---
 * @type file
 * @dir img/titles2
 * @require 1
 * @desc Optional background overlay for this scene.
 * @default
 *
 * @param Scores BGM
 * @text Scores BGM
 * @parent --- Scene Extras ---
 * @type struct<CaeTypeBGM>
 * @desc Optional BGM track for this scene.
 * @default
 *
 * @param --- File Settings ---
 * @text --- File Settings ---
 * @type select
 * @desc Options determining where the scores are saved.
 *
 * @param Score File (Web Key)
 * @text Score File (Web Key)
 * @parent --- File Settings ---
 * @type text
 * @desc Key used for web storage.
 * @default Scores
 *
 * @param Score File (Local)
 * @text Score File (Local)
 * @parent --- File Settings ---
 * @type text
 * @desc File name used for system storage.
 * @default scores
 */
//==================================================
/*~struct~CaeTypeScoreTable:
 * @param Name
 * @text Name
 * @type text
 * @desc The name associated with this score.
 * @default Player Name
 *
 * @param Score
 * @text Score
 * @type text
 * @desc The score value!
 * @default 0
 */
//==================================================
/*~struct~CaeTypeScoreFormatComponent:
 * @param Type
 * @text Type
 * @type combo
 * @option Data
 * @option Text
 * @option Eval
 * @desc Determines the type of component.
 * Check the help description for details.
 * @default Data
 *
 * @param Ext
 * @text Ext
 * @type combo
 * @option Name
 * @option Score
 * @option Index
 * @desc Determines how the chosen type displays.
 * Check the help description for details.
 * @default
 *
 * @param Width
 * @text Width
 * @type text
 * @desc This component's horizontal width. Evals permitted.
 * @default 
 *
 * @param Align
 * @text Align
 * @type select
 * @option left
 * @option center
 * @option right
 * @desc This component's horizontal alignment within its box width.
 * @default left
 *
 * @param Colour
 * @text Colour
 * @type text
 * @desc The system colour of this component's text. Evals permitted.
 * Default: 0
 * @default 0
 */
//==================================================
/*~struct~CaeTypeBGM:
 * @param name
 * @text name
 * @type file
 * @dir audio/bgm
 * @require 1
 * @desc BGM file name.
 * @default
 *
 * @param volume
 * @text volume
 * @type number
 * @min 0
 * @max 100
 * @desc BGM volume
 * @default 50
 *
 * @param pitch
 * @text pitch
 * @type number
 * @min 50
 * @max 150
 * @desc BGM pitch
 * @default 100
 *
 * @param pan
 * @text pan
 * @type number
 * @min -100
 * @max 100
 * @desc BGM pan
 * @default 0
 */
//==================================================
/*~struct~CaeTypeScoreTitle:
 * @param Text
 * @text Text
 * @type text
 * @desc The title text to show.
 * @default Scores
 *
 * @param X
 * @text X
 * @type text
 * @desc X-position (px) of the top-left of the title box.
 * Evals permitted (score window context).
 * @default 0
 *
 * @param Y
 * @text Y
 * @type text
 * @desc Y-position (px) of the top-left of the title box.
 * Evals permitted (score window context).
 * @default (this.y - this.lineHeight()) / 2
 *
 * @param Width
 * @text Width
 * @type number
 * @min -1
 * @desc Maximum width (px) of the title text. Evals permitted (score window context). Use -1 for the game screen width.
 * @default -1
 *
 * @param Font Size
 * @text Font Size
 * @type number
 * @min 24
 * @desc Title text font size.
 * Default: 60
 * @default 60
 *
 * @param Align
 * @text Align
 * @type select
 * @option left
 * @option center
 * @option right
 * @desc Alignment of the title text in its box.
 * Default: center
 * @default center
 *
 * @param Colour
 * @text Colour
 * @type text
 * @desc CSS colour for the title text body.
 * Default: white
 * @default white
 *
 * @param Outline Colour
 * @text Outline Colour
 * @type text
 * @desc CSS colour for the title text outline.
 * Default: black
 * @default black
 *
 * @param Outline Width
 * @text Outline Width
 * @type number
 * @min 0
 * @desc Outline width for the title text.
 * Default: 6 px
 * @default 6
 */

var Imported = Imported || {};			// Import namespace, var can redefine
Imported.Cae_ScoreTable = 1.2;			// Import declaration

var CAE = CAE || {};				// Author namespace, var can redefine
CAE.ScoreTable = CAE.ScoreTable || {};		// Plugin namespace

(function(_) {

'use strict';

	const PLUGIN_NAME  = 'Cae_ScoreTable';
	const ERR_PRE      = PLUGIN_NAME + '.js ';
	const ERR_NOPARAMS = ERR_PRE + 'could not find its parameters!\nCheck you have named the plugin correctly and try again.';
	const ERR_EVAL     = ERR_PRE + 'eval error!\n\n%1';
	const ERR_WATFORM  = ERR_PRE + 'encountered unexpected \'%1\' format definition:';
	const WARN_NOSCORE = ERR_PRE + 'could not add score to list:';

	const SAVE_ID      = PLUGIN_NAME;	// Internal save ID for passing to StorageManager
	const FILE_EXT     = '.rpgsave';	// Local save file extension (matches other save files)

// ========== Parameter stuff ========== //

	_.params = PluginManager.parameters(PLUGIN_NAME);
	if (_.params === undefined) throw new Error(ERR_NOPARAMS);

	// UTILITY: wrapper for parseInt with a default handler for NaN results
	_.getInt = function(input, dFault) { let out = parseInt(input, 10); return isNaN(out) ? dFault : out; };

	// Score/format stuff
	_.scoreNum = _.getInt(_.params['Score Count'], 10);
	_.initList = JSON.parse(_.params['Default Score List'] || '[]').map(JSON.parse);
	_.format   = JSON.parse(_.params['Score Format'] || '[]').map(JSON.parse);
	_.formPad  = _.getInt(_.params['Format Padding'], -1);

	// Menu commands
	_.cTitleN = _.params['Title Command Name'];
	_.cTitleP = _.getInt(_.params['Title Command Position'], 10000);
	_.cTitleS = _.params['Title Command Symbol'] || 'scoreTable';
	_.cPauseN = _.params['Pause Command Name'];
	_.cPauseP = _.getInt(_.params['Pause Command Position'], -3);
	_.cPauseS = _.params['Pause Command Symbol'] || 'scoreTable';

	// Table position and style
	_.pos    = { 	x: _.params['Table X'], w: _.params['Table Width'],
			y: _.params['Table Y'], h: _.params['Table Height']	};
	_.bgType = _.getInt(_.params['Table Background Type'], 0);

	// Save settings
	_.webKey = _.params['Score File (Web Key)'] || 'ScoreTable';
	_.locKey = _.params['Score File (Local)'] || 'Scores';

	// Scene ambience
	_.back1 = _.params['Scores Background 1'];
	_.back2 = _.params['Scores Background 2'];
	_.bgm = (function(p) { if (p.name === '') return;
		p.pan    = _.getInt(p.pan, 0);
		p.pitch  = _.getInt(p.pitch, 100);
		p.volume = _.getInt(p.volume, 50);
		return p;
	})(JSON.parse(_.params['Scores BGM'] || '{}'));

	// Score scene title settings
	_.title = JSON.parse(_.params['Scores Title'] || '{}');
	_.title['Font Size']     = _.getInt(_.title['Font Size'],    60);
	_.title['Outline Width'] = _.getInt(_.title['Outline Width'], 6);
	_.title.Height = 48;		// 48 seems OK and not sure what it affects, so... ^_^'

	// Tracks index of most recently-added score this session
	_.latestScoreIx = -1;

// ============== Utility ============== //

	// Informal struct
	_.Score = function(score, name) { return { Score: score, Name: name }; };

	// Should show title/pause menu commands?
	_.showTitleCommand = function() { return !!_.cTitleN; };
	_.showPauseCommand = function() { return !!_.cPauseN; };

	// Is a BGM set for the score scene?
	_.hasBgm = function() { return _.bgm && _.bgm.name !== ''; };

	// Check if this is the score scene
	_.isSceneScoreTable = function() { return SceneManager._scene instanceof Scene_ScoreTable; };

	// Sort numerical scores descending by value, non-numerical ascending by charcode
	_.scoreSort = function(a, b) {
		if (isNaN(a.Score) || isNaN(b.Score)) {
			return String(b.Score).toUpperCase() > String(a.Score).toUpperCase() ? -1 : 1;
		} else {
			return Number(b.Score) - Number(a.Score);
		}
	};

	// Sort scores and cull excess items
	_.refreshScores = function() {
		_.scores.sort(_.scoreSort);
		while (_.scores.length > _.scoreNum) _.scores.pop();
	};

	// Refresh if the current scene is the score scene
	_.refreshTable = function() {
		_.refreshScores();
		if (_.isSceneScoreTable()) SceneManager._scene._scoreWindow.refresh();		
	};

	// Save score data to file
	_.saveScoreData = function() {
		StorageManager.save(SAVE_ID, JSON.stringify(_.scores));
	};

	// Load score data from file and refresh
	_.loadScoreData = function() {
		_.scores = JSON.parse(StorageManager.load(SAVE_ID) || '[]');
		if (!_.scores.length) { _.resetScores(); } else { _.refreshTable(); };
	};

	// Reset score data to default and refresh
	_.resetScores = function() {
		_.scores = _.initList;
		_.refreshTable();
		_.saveScoreData();
	};

	// Substitute v[x], n[x], p[x] for appropriate values (var, actor name, party member name)
	// From Window_Base...two v replacers for nesting, I think~
	_.substituteArgs = function(input) {
		let out = String(input);
		out = out.replace(/V\[(\d+)\]/gi, function() {
			let ix = _.getInt(arguments[1], 0);
			if (ix < 1) return 0;
			return $gameVariables.value(ix);
		}.bind(this));
		out = out.replace(/V\[(\d+)\]/gi, function() {
			let ix = _.getInt(arguments[1], 0);
			if (ix < 1) return 0;
			return $gameVariables.value(ix);
		}.bind(this));
		out = out.replace(/N\[(\d+)\]/gi, function() {
			let ix = _.getInt(arguments[1], 0);
			if (ix < 1) return '';
			let actor = $gameActors.actor(ix);
			if (!actor) return '';
			return actor.name();
		}.bind(this));
		out = out.replace(/P\[(\d+)\]/gi, function() {
			let ix = _.getInt(arguments[1], -1);
			if (ix < 0) return '';
			let actor = $gameParty.members()[ix];
			if (!actor) return '';
			return actor.name();
		}.bind(this));
		return out;
	};

	// Returns true if input score object will be added to the table
	_.scoreAddable = function(obj) {
		if (obj === undefined || obj.Score === undefined) return false;
		let len = _.scores.length;
		return len < _.scoreNum || _.scoreSort(_.scores[len - 1], obj) > 0;
	};

	// Returns last index of score in current table
	_.findScoreIx = function(score) {
		return _.scores.map(function(s) { return String(s.Score); }).lastIndexOf(String(score));
	};

	// Add new score to table, sort/refresh, save changes
	_.addScore = function(args) {
		let subArgs = args.map(function(arg) { return _.substituteArgs(arg) });
		let newScore = _.Score.apply(null, subArgs);
		let addable = _.scoreAddable(newScore);
		if (addable) {
			_.scores.push(newScore);
			_.refreshScores();
			_.saveScoreData();
			let findIx = _.findScoreIx(newScore.Score);
			if (findIx >= 0) _.latestScoreIx = findIx;
		} else if (newScore.Score === undefined) {
			console.warn(WARN_NOSCORE, newScore);
		}
	};

	// Go to score scene~
	_.showScores = function() { SceneManager.push(Scene_ScoreTable); };

// ============== Extends ============== //

	// ===== new win ===== //

	/** @constructor */
	window['Window_ScoreTable'] = function() { this.initialize.apply(this, arguments); };

	Window_ScoreTable.prototype = Object.create(Window_Selectable.prototype);
	Window_ScoreTable.prototype.constructor = Window_ScoreTable;

	// Attempt to eval code, return dFault on error; score and index are eval references
	Window_ScoreTable.prototype.tryEval = function(code, dFault, score, index) {
		let out;
		try {
			out = eval(code);
		} catch (ex) {
			console.error(ERR_EVAL.format(code));
			out = dFault;
		} finally {
			return out;
		}
	};

	Window_ScoreTable.prototype.tryEvalInt = function(code, dFault, score, index) {
		return _.getInt(this.tryEval(code, dFault, score, index), dFault);
	};

	// Get padding between format components
	Window_ScoreTable.prototype.formatPadding = function() {
		return _.formPad === -1 ? this.standardPadding() : _.formPad;
	};

	// Max items per page (scrolling) and total (list length)
	Window_ScoreTable.prototype.maxPageItems = function() { return Math.floor(this.contentsHeight() / this.lineHeight()); };
	Window_ScoreTable.prototype.maxItems = function() { return _.scores.length; };

	// Initialise position and size, reset to top row, refresh, hand over controls
	Window_ScoreTable.prototype.initialize = function() {
		let x = this.tryEvalInt(_.pos.x, 50);
		let y = this.tryEvalInt(_.pos.y, 30);
		let w = this.tryEvalInt(_.pos.w, Graphics.boxWidth - 2 * x);
		let h = this.tryEvalInt(_.pos.h, Graphics.boxHeight - 2 * y);
		Window_Selectable.prototype.initialize.call(this, x, y, w, h);
		this.setBackgroundType(_.bgType);
		this.select(_.latestScoreIx >= 0 ? _.latestScoreIx : 0);
		this.refresh();
		this.activate();
	};

	// Convert array/item index to display value
	Window_ScoreTable.prototype.displayIndex = function(index) { return index + 1; };

	// Functions for parsing format values
	Window_ScoreTable.prototype.parseFormatProp = {
		v: function(c, score, index) {
			let s = c.Type.toUpperCase();
			let e = c.Ext;
			switch (s) {
				case 'DATA':
					return e === 'Index' ? this.displayIndex(index) : score[e];
				case 'TEXT':
					return e;
				case 'EVAL':
					return this.tryEval(e, '', score, index);
				default:
					console.error(ERR_WATFORM.format('Component Value Type'), s);
			}
			return '';
		},
		w: function(c, score, index) {
			return this.tryEvalInt(c.Width, 0, score, index);
		},
		a: function(c, score, index) {
			return c.Align || 'left';
		},
		c: function(c, score, index) {
			return this.tryEvalInt(c.Colour, 0, score, index);
		}
	};

	// Parse a single component of the format specification (value, width, align, colour)
	Window_ScoreTable.prototype.parseFormatComponent = function(c, score, index) {
		let out = {};
		Object.keys(this.parseFormatProp).forEach(function(k) {
			out[k] = this.parseFormatProp[k].call(this, c, score, index);
		}, this);
		return out;
	};

	// Get parsed data, colour, etc for specified score/index from format object
	Window_ScoreTable.prototype.getFormat = function(score, index) {
		let out = [];
		_.format.forEach(function(c) {
			out.push(this.parseFormatComponent(c, score, index));
		}, this);
		return out;
	};

	// Draw a single score on the scoreboard
	Window_ScoreTable.prototype.drawItem = function(index) {
		let score = _.scores[index];
		let rect = this.itemRect(index);
		let x = rect.x, y = rect.y, pad = this.formatPadding();
		this.getFormat(score, index).forEach(function(f) {
			this.changeTextColor(this.textColor(f.c));
			this.drawText(f.v, x, y, f.w, f.a);
			x += f.w + pad;
		}, this);
		this.resetTextColor();
	};

	// ==== new scene ==== //

	/** @constructor */
	window['Scene_ScoreTable'] = function() { this.initialize.apply(this, arguments); };

	Scene_ScoreTable.prototype = Object.create(Scene_Base.prototype);
	Scene_ScoreTable.prototype.constructor = Scene_ScoreTable;

	// Pop the scene off the stack
	Scene_ScoreTable.prototype.endScores = function() { this.popScene(); };

	// Create background sprites
	Scene_ScoreTable.prototype.createBackground = function() {
		this._backSprite0 = new Sprite(SceneManager.backgroundBitmap());
		this.addChild(this._backSprite0);
		if (_.back1) {
			this._backSprite1 = new Sprite(ImageManager.loadTitle1(_.back1));
			this.addChild(this._backSprite1);
		}
		if (_.back2) {
			this._backSprite2 = new Sprite(ImageManager.loadTitle2(_.back2));
			this.addChild(this._backSprite2);
		}
	};

	// Create scrollable score window
	Scene_ScoreTable.prototype.createScoreWindow = function() {
		this._scoreWindow = new Window_ScoreTable();
		this._scoreWindow.setHandler('cancel', this.endScores.bind(this));
		this.addWindow(this._scoreWindow);
	};

	// Draw score table title
	Scene_ScoreTable.prototype.drawTitle = function() {
		let o = _.title;
		let text = o.Text;
		if (text) {
			this._title = new Sprite(new Bitmap(Graphics.boxHeight, Graphics.boxWidth));
			let x = this._scoreWindow.tryEvalInt(o.X, 0);
			let y = this._scoreWindow.tryEvalInt(o.Y, 48);
			let w = this._scoreWindow.tryEvalInt(o.Width, Graphics.boxWidth);
			let h = o.Height;	// iiam
			if (isNaN(w) || w < 0) w = Graphics.boxWidth;
			if (isNaN(h) || h < 0) h = 48;
			let fSize = o['Font Size'], align = o.Align, colour = o.Colour;
			let ow = o['Outline Width'], oc = o['Outline Colour'];
			this._title.bitmap.color = colour || 'white';
			this._title.bitmap.outlineWidth = ow || 6;
			this._title.bitmap.outlineColor = oc || 'black';
			this._title.bitmap.fontSize = fSize || 48;
			this._title.bitmap.drawText(text, x, y, w, h, align);
			this.addChild(this._title);
		}
	};

	// Create background, title, windows
	Scene_ScoreTable.prototype.create = function() {
		Scene_Base.prototype.create.call(this);
		this.createBackground();
		this.createWindowLayer();
		this.createScoreWindow();
		this.drawTitle()
	};

	// Play BGM if assigned
	Scene_ScoreTable.prototype.playBgm = function() { if (_.hasBgm()) AudioManager.playBgm(_.bgm); };

	// Play BGM if appropriate
	Scene_ScoreTable.prototype.start = function() {
		Scene_Base.prototype.start.call(this);
		this.playBgm();
	};

	// === new methods === //

	// Show score table from title menu
	Scene_Title.prototype.commandScoreTable = function() {
		SceneManager.snapForBackground();
		_.showScores();
	};

	// Show score table from pause menu
	Scene_Menu.prototype.commandScoreTable = function() { _.showScores(); };

// ============ Alterations ============ //

	// Get name of key for web storage of scores
	_.StorageManager_webStorageKey = StorageManager.webStorageKey;
	StorageManager.webStorageKey = function(saveFileId) {
		if (saveFileId === SAVE_ID) return _.webKey;
		return _.StorageManager_webStorageKey.call(this, saveFileId);
	};

	// Get name of file for local storage of scores
	_.StorageManager_localFilePath = StorageManager.localFilePath;
	StorageManager.localFilePath = function(saveFileId) {
		if (saveFileId === SAVE_ID) return this.localFileDirectoryPath() + _.locKey + FILE_EXT;
		return _.StorageManager_localFilePath.call(this, saveFileId);
	};

	// Load score data along with the database
	_.DataManager_loadDatabase = DataManager.loadDatabase;
	DataManager.loadDatabase = function() {
		_.DataManager_loadDatabase.call(this);
		_.loadScoreData();
	};

	// Wait for scores to be loaded, too
	_.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
	DataManager.isDatabaseLoaded = function() {
		return _.DataManager_isDatabaseLoaded.call(this) && Array.isArray(_.scores);
	};

	// Add command to title menu if appropriate
	_.Window_TitleCommand_makeCommandList = Window_TitleCommand.prototype.makeCommandList;
	Window_TitleCommand.prototype.makeCommandList = function() {
		_.Window_TitleCommand_makeCommandList.call(this);
		if (_.showTitleCommand()) {
			let com = { name: _.cTitleN, symbol: _.cTitleS, enabled: true, ext: null };
			this._list.splice(_.cTitleP, 0, com);
		}
	};

	// Bind new command symbol to new "show scores" method
	_.Scene_Title_createCommandWindow = Scene_Title.prototype.createCommandWindow;
	Scene_Title.prototype.createCommandWindow = function() {
		_.Scene_Title_createCommandWindow.call(this);
		if (_.showTitleCommand()) {
			this._commandWindow.setHandler(_.cTitleS, this.commandScoreTable.bind(this));
		}
	};

	// Add command to pause menu if appropriate
	_.Window_MenuCommand_makeCommandList = Window_MenuCommand.prototype.makeCommandList;
	Window_MenuCommand.prototype.makeCommandList = function() {

		_.Window_MenuCommand_makeCommandList.call(this);
		if (_.showPauseCommand()) {
			let com = { name: _.cPauseN, symbol: _.cPauseS, enabled: true, ext: null };
			this._list.splice(_.cPauseP, 0, com);
		}
	};

	// Bind new command symbol to new "show scores" method
	_.Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
	Scene_Menu.prototype.createCommandWindow = function() {
		_.Scene_Menu_createCommandWindow.call(this);
		if (_.showPauseCommand()) {
			this._commandWindow.setHandler(_.cPauseS, this.commandScoreTable.bind(this));
		}
	};

	// Plugin commands!
	_.Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		_.Game_Interpreter_pluginCommand.call(this, command, args);
		switch (command.toUpperCase()) {
			case 'SHOWSCORES':
				_.showScores();
				break;
			case 'ADDSCORE':
				_.addScore(args.map(function(arg) { return arg.replace(/_/g, ' '); }));
				break;
			case 'RESETSCORES':
				_.resetScores();
				break;
		}
	};

})(CAE.ScoreTable);