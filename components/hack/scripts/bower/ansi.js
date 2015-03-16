require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Attributes = {
	1 : {
		'name' : 'bold/bright',
		'attribute' : 0x08
	},
	5 : {
		'name' : 'blink',
		'attribute' : 0x80
	},
	30 : {
		'name' : 'black',
		'attribute' : 0,
		'htmlLow' : '#000000',
		'htmlHigh' : '#545454'
	},
	31 : {
		'name' : 'red',
		'attribute' : 4,
		'htmlLow' : '#A80000',
		'htmlHigh' : '#FC5454'
	},
	32 : {
		'name' : 'green',
		'attribute' : 2,
		'htmlLow' : '#00A800',
		'htmlHigh' : '#54FC54'
	},
	33 : {
		'name' : 'yellow',
		'attribute' : 6,
		'htmlLow' : '#A85400',
		'htmlHigh' : '#FCFC54'
	},
	34 : {
		'name' : 'blue',
		'attribute' : 1,
		'htmlLow' : '#0000A8',
		'htmlHigh' : '#5454FC'
	},
	35 : {
		'name' : 'magenta',
		'attribute' : 5,
		'htmlLow' : '#A800A8',
		'htmlHigh' : '#FC54FC'
	},
	36 : {
		'name' : 'cyan',
		'attribute' : 3,
		'htmlLow' : '#00A8A8',
		'htmlHigh' : '#54FCFC'
	},
	37 : {
		'name' : 'white',
		'attribute' : 7,
		'htmlLow' : '#A8A8A8',
		'htmlHigh' : '#FFFFFF'
	},
	40 : {
		'name' : 'black',
		'attribute' : 0,
		'htmlLow' : '#000000',
	},
	41 : {
		'name' : 'red',
		'attribute' : (4<<4),
		'htmlLow' : '#A80000',
	},
	42 : {
		'name' : 'green',
		'attribute' : (2<<4),
		'htmlLow' : '#00A800',
	},
	43 : {
		'name' : 'yellow',
		'attribute' : (6<<4),
		'htmlLow' : '#A85400',
	},
	44 : {
		'name' : 'blue',
		'attribute' : (1<<4),
		'htmlLow' : '#0000A8',
	},
	45 : {
		'name' : 'magenta',
		'attribute' : (5<<4),
		'htmlLow' : '#A800A8',
	},
	46 : {
		'name' : 'cyan',
		'attribute' : (3<<4),
		'htmlLow' : '#00A8A8',
	},
	47 : {
		'name' : 'white',
		'attribute' : (7<<4),
		'htmlLow' : '#A8A8A8',
	}
};

ASCIItoHTML = {
	0 : {
		'entityNumber'	: 160,
		'entityName'	: "nbsp"
	},
	1 : {
		'entityNumber'	: 9786,
		'entityName'	: null
	},
	2 : {
		'entityNumber' : 9787,
		'entityName'	: null
	},
	3 : {
		'entityNumber'	: 9829,
		'entityName'	: "hearts"
	},
	4 : {
		'entityNumber'	: 9830,
		'entityName'	: "diams"
	},
	5 : {
		'entityNumber'	: 9827,
		'entityName'	: "clubs"
	},
	6 : {
		'entityNumber'	: 9824,
		'entityName'	: "spades"
	},
	7 : {
		'entityNumber'	: 8226,
		'entityName'	: "bull"
	},
	8 : {
		'entityNumber' : 9688,
		'entityName' : null
	},
	9 : {
		'entityNumber' : 9702,
		'entityName' : null
	},
	10 : {
		'entityNumber' : 9689,
		'entityName' : null
	},
	11 : {
		'entityNumber' : 9794,
		'entityName' : null
	},
	12 : {
		'entityNumber' : 9792,
		'entityName' : null
	},
	13 : {
		'entityNumber' : 9834,
		'entityName' : null
	},
	14 : {
		'entityNumber' : 9835,
		'entityName' : null
	},
	15 : {
		'entityNumber' : 9788,
		'entityName' : null
	},
	16 : {
		'entityNumber' : 9654,
		'entityName' : null
	},
	17 : {
		'entityNumber' : 9664,
		'entityName' : null
	},
	18 : {
		'entityNumber' : 8597,
		'entityName' : null
	},
	19 : {
		'entityNumber' : 8252,
		'entityName' : null
	},
	20 : {
		'entityNumber'	: 182,
		'entityName'	: "para"
	},
	21 : {
		'entityNumber'	: 167,
		'entityName'	: "sect"
	},
	22 : {
		'entityNumber'	: 9644,
		'entityName'	: null
	},
	23 : {
		'entityNumber'	: 8616,
		'entityName'	: null
	},
	24 : {
		'entityNumber' : 8593,
		'entityName'	: "uarr"
	},
	25 : {
		'entityNumber' : 8595,
		'entityName'	: "darr"
	},
	26 : {
		'entityNumber' : 8594,
		'entityName'	: "rarr"
	},
	27 : {
		'entityNumber' : 8592,
		'entityName'	: "larr"
	},
	28 : {
		'entityNumber'	: 8985,
		'entityName'	: null
	},
	29 : {
		'entityNumber' : 8596,
		'entityName'	: "harr"
	},
	30 : {
		'entityNumber'	: 9650,
		'entityName'	: null
	},
	31 : {
		'entityNumber'	: 9660,
		'entityName'	: null
	},
	128 : {
		'entityNumber' : 199,
		'entityName' : "Ccedil"
	},
	129 : {
		'entityNumber' : 252,
		'entityName' : "uuml"	
	},
	130 : {
		'entityNumber' : 233,
		'entityName' : "eacute"
	},
	131 : {
		'entityNumber' : 226,
		'entityName' : "acirc"
	},
	132 : {
		'entityNumber' : 228,
		'entityName' : "auml"	
	},
	133 : {
		'entityNumber' : 224,
		'entityName' : "agrave"
	},
	134 : {
		'entityNumber' : 229,
		'entityName' : "aring"
	},
	135 : {
		'entityNumber' : 231,
		'entityName' : "ccedil"
	},
	136 : {
		'entityNumber' : 234,
		'entityName' : "ecirc"
	},
	137 : {
		'entityNumber' : 235,
		'entityName' : "euml"	
	},
	138 : {
		'entityNumber' : 232,
		'entityName' : "egrave"
	},
	139 : {
		'entityNumber' : 239,
		'entityName' : "iuml"	
	},
	140 : {
		'entityNumber' : 238,
		'entityName' : "icirc"
	},
	141 : {
		'entityNumber' : 236,
		'entityName' : "igrave"
	},
	142 : {
		'entityNumber' : 196,
		'entityName' : "Auml"	
	},
	143 : {
		'entityNumber' : 197,
		'entityName' : "Aring"
	},
	144 : {
		'entityNumber' : 201,
		'entityName' : "Eacute"
	},
	145 : {
		'entityNumber' : 230,
		'entityName' : "aelig"
	},
	146 : {
		'entityNumber' : 198,
		'entityName' : "AElig"
	},
	147 : {
		'entityNumber' : 244,
		'entityName' : "ocirc"
	},
	148 : {
		'entityNumber' : 246,
		'entityName' : "ouml"	
	},
	149 : {
		'entityNumber' : 242,
		'entityName' : "ograve"
	},
	150 : {
		'entityNumber' : 251,
		'entityName' : "ucirc"
	},
	151 : {
		'entityNumber' : 249,
		'entityName' : "ugrave"
	},
	152 : {
		'entityNumber' : 255,
		'entityName' : "yuml"	
	},
	153 : {
		'entityNumber' : 214,
		'entityName' : "Ouml"	
	},
	154 : {
		'entityNumber' : 220,
		'entityName' : "Uuml"	
	},
	155 : {
		'entityNumber' : 162,
		'entityName' : "cent"	
	},
	156 : {
		'entityNumber' : 163,
		'entityName' : "pound"
	},
	157 : {
		'entityNumber' : 165,
		'entityName' : "yen"	
	},
	158 : {
		'entityNumber' : 8359,
		'entityName' : null	
	},
	159 : {
		'entityNumber' : 402,
		'entityName' : null	
	},
	160 : {
		'entityNumber' : 225,
		'entityName' : "aacute"
	},
	161 : {
		'entityNumber' : 237,
		'entityName' : "iacute"
	},
	162 : {
		'entityNumber' : 243,
		'entityName' : "oacute"
	},
	163 : {
		'entityNumber' : 250,
		'entityName' : "uacute"
	},
	164 : {
		'entityNumber' : 241,
		'entityName' : "ntilde"
	},
	165 : {
		'entityNumber' : 209,
		'entityName' : "Ntilde"
	},
	166 : {
		'entityNumber' : 170,
		'entityName' : "ordf"	
	},
	167 : {
		'entityNumber' : 186,
		'entityName' : "ordm"	
	},
	168 : {
		'entityNumber' : 191,
		'entityName' : "iquest"
	},
	169 : {
		'entityNumber' : 8976,
		'entityName' : null	
	},
	170 : {
		'entityNumber' : 172,
		'entityName' : "not"	
	},
	171 : {
		'entityNumber' : 189,
		'entityName' : "frac12"
	},
	172 : {
		'entityNumber' : 188,
		'entityName' : "frac14"
	},
	173 : {
		'entityNumber' : 161,
		'entityName' : "iexcl"
	},
	174 : {
		'entityNumber' : 171,
		'entityName' : "laquo"
	},
	175 : {
		'entityNumber' : 187,
		'entityName' : "raquo"
	},
	176 : {
		'entityNumber' : 9617,
		'entityName' : null	
	},
	177 : {
		'entityNumber' : 9618,
		'entityName' : null	
	},
	178 : {
		'entityNumber' : 9619,
		'entityName' : null	
	},
	179 : {
		'entityNumber' : 9474,
		'entityName' : null	
	},
	180 : {
		'entityNumber' : 9508,
		'entityName' : null	
	},
	181 : {
		'entityNumber' : 9569,
		'entityName' : null	
	},
	182 : {
		'entityNumber' : 9570,
		'entityName' : null	
	},
	183 : {
		'entityNumber' : 9558,
		'entityName' : null	
	},
	184 : {
		'entityNumber' : 9557,
		'entityName' : null	
	},
	185 : {
		'entityNumber' : 9571,
		'entityName' : null	
	},
	186 : {
		'entityNumber' : 9553,
		'entityName' : null	
	},
	187 : {
		'entityNumber' : 9559,
		'entityName' : null	
	},
	188 : {
		'entityNumber' : 9565,
		'entityName' : null	
	},
	189 : {
		'entityNumber' : 9564,
		'entityName' : null	
	},
	190 : {
		'entityNumber' : 9563,
		'entityName' : null	
	},
	191 : {
		'entityNumber' : 9488,
		'entityName' : null	
	},
	192 : {
		'entityNumber' : 9492,
		'entityName' : null	
	},
	193 : {
		'entityNumber' : 9524,
		'entityName' : null	
	},
	194 : {
		'entityNumber' : 9516,
		'entityName' : null	
	},
	195 : {
		'entityNumber' : 9500,
		'entityName' : null
	},
	196 : {
		'entityNumber' : 9472,
		'entityName' : null
	},
	197 : {
		'entityNumber' : 9532,
		'entityName' : null
	},
	198 : {
		'entityNumber' : 9566,
		'entityName' : null
	},
	199 : {
		'entityNumber' : 9567,
		'entityName' : null
	},
	200 : {
		'entityNumber' : 9562,
		'entityName' : null
	},
	201 : {
		'entityNumber' : 9556,
		'entityName' : null
	},
	202 : {
		'entityNumber' : 9577,
		'entityName' : null
	},
	203 : {
		'entityNumber' : 9574,
		'entityName' : null
	},
	204 : {
		'entityNumber' : 9568,
		'entityName' : null
	},
	205 : {
		'entityNumber' : 9552,
		'entityName' : null
	},
	206 : {
		'entityNumber' : 9580,
		'entityName' : null
	},
	207 : {
		'entityNumber' : 9575,
		'entityName' : null
	},
	208 : {
		'entityNumber' : 9576,
		'entityName' : null
	},
	209 : {
		'entityNumber' : 9572,
		'entityName' : null
	},
	210 : {
		'entityNumber' : 9573,
		'entityName' : null
	},
	211 : {
		'entityNumber' : 9561,
		'entityName' : null
	},
	212 : {
		'entityNumber' : 9560,
		'entityName' : null
	},
	213 : {
		'entityNumber' : 9554,
		'entityName' : null
	},
	214 : {
		'entityNumber' : 9555,
		'entityName' : null
	},
	215 : {
		'entityNumber' : 9579,
		'entityName' : null
	},
	216 : {
		'entityNumber' : 9578,
		'entityName' : null
	},
	217 : {
		'entityNumber' : 9496,
		'entityName' : null
	},
	218 : {
		'entityNumber' : 9484,
		'entityName' : null
	},
	219 : {
		'entityNumber' : 9608,
		'entityName' : null
	},
	220 : {
		'entityNumber' : 9604,
		'entityName' : null
	},
	221 : {
		'entityNumber' : 9612,
		'entityName' : null
	},
	222 : {
		'entityNumber' : 9616,
		'entityName' : null
	},
	223 : {
		'entityNumber' : 9600,
		'entityName' : null
	},
	224 : {
		'entityNumber' : 945,
		'entityName' : null
	},
	225 : {
		'entityNumber' : 223,
		'entityName' : "szlig"
	},
	226 : {
		'entityNumber' : 915,
		'entityName' : null
	},
	227 : {
		'entityNumber' : 960,
		'entityName' : null
	},
	228 : {
		'entityNumber' : 931,
		'entityName' : null
	},
	229 : {
		'entityNumber' : 963,
		'entityName' : null
	},
	230 : {
		'entityNumber' : 181,
		'entityName' : "micro"
	},
	231 : {
		'entityNumber' : 964,
		'entityName' : null
	},
	232 : {
		'entityNumber' : 934,
		'entityName' : null
	},
	233 : {
		'entityNumber' : 920,
		'entityName' : null
	},
	234 : {
		'entityNumber' : 937,
		'entityName' : null
	},
	235 : {
		'entityNumber' : 948,
		'entityName' : null
	},
	236 : {
		'entityNumber' : 8734,
		'entityName' : null
	},
	237 : {
		'entityNumber' : 966,
		'entityName' : "oslash"
	},
	238 : {
		'entityNumber' : 949,
		'entityName' : null
	},
	239 : {
		'entityNumber' : 8745,
		'entityName' : null
	},
	240 : {
		'entityNumber' : 8801,
		'entityName' : null
	},
	241 : {
		'entityNumber' : 177,
		'entityName' : "plusmn"
	},
	242 : {
		'entityNumber' : 8805,
		'entityName' : null
	},
	243 : {
		'entityNumber' : 8804,
		'entityName' : null
	},
	244 : {
		'entityNumber' : 8992,
		'entityName' : null
	},
	245 : {
		'entityNumber' : 8993,
		'entityName' : null
	},
	246 : {
		'entityNumber' : 247,
		'entityName' : "divide"
	},
	247 : {
		'entityNumber' : 8776,
		'entityName' : null
	},
	248 : {
		'entityNumber' : 176,
		'entityName' : "deg"
	},
	249 : {
		'entityNumber' : 8729,
		'entityName' : null
	},
	250 : {
		'entityNumber' : 183,
		'entityName' : "middot"
	},
	251 : {
		'entityNumber' : 8730,
		'entityName' : null
	},
	252 : {
		'entityNumber' : 8319,
		'entityName' : null
	},
	253 : {
		'entityNumber' : 178,
		'entityName' : "sup2"
	},
	254 : {
		'entityNumber' : 9632,
		'entityName' : null
	},
	255 : {
		'entityNumber' : 160,
		'entityName' : "nbsp"
	} 
};

module.exports.ASCIItoHTML = ASCIItoHTML;
module.exports.Attributes = Attributes;
},{}],"ansi-graphics":[function(require,module,exports){
var defs = require('./defs.js');

var copyObject = function(obj) {
	var ret = {};
	for(var property in obj)
		if(Array.isArray(obj[property]))
			ret[property] = obj[property];
		else if(typeof obj[property] == "object")
			ret[property] = copyObject(obj[property]);
		else if(typeof obj[property] != "undefined")
			ret[property] = obj[property];
	return ret;
};

// Very shallow comparison
var compareObjects = function(obj1, obj2) {
	var ret = true;
	for(var property in obj1) {
		if(obj1[property] === obj2[property])
			continue;
		ret = false;
		break;
	}
	return ret;
};

var ANSI = function() {

	var self = this;

	this.data = [];
	var width = 0;
	var height = 0;

	this.__defineGetter__(
		"width",
		function() {
			return width + 1;
		}
	);

	this.__defineGetter__(
		"height",
		function() {
			return height + 1;
		}
	);

	this.__defineGetter__(
		"pixelWidth",
		function() {
			return (9 * (width + 1));
		}
	);

	this.__defineGetter__(
		"pixelHeight",
		function() {
			return (16 * (height + 1));
		}
	);

	this.fromString = function(ansiString) {

		var plain = "";

		var cursor = {
			'x' : 0,
			'y' : 0
		};

		var cursorStore = {
			'x'	: 0,
			'y' : 0
		};

		var graphics = {
			'bright'		: false,
			'blink'			: false,
			'foreground'	: 37,
			'background'	: 40
		};

		while(ansiString.length > 0) {
			var regex = /^\u001b\[(\d*;?)*[a-zA-Z]/;
			var result = regex.exec(ansiString);
			if(result === null) {
				var chr = {
					'cursor' : copyObject(cursor),
					'graphics' : copyObject(graphics),
					'chr' : ansiString.substr(0, 1)
				};
				switch(chr.chr.charCodeAt(0)) {
					case 13:
						cursor.x = 0;
						break;
					case 10:
						cursor.y++;
						break;
					default:
						cursor.x++;
						// if(cursor.x == 80) {
						// 	cursor.x = 0;
						// 	cursor.y++;
						// }
						this.data.push(chr);
						break;
				}
				ansiString = ansiString.substr(1);
			} else {
				var ansiSequence = ansiString.substr(0, result[0].length).replace(/^\u001b\[/, "");
				var cmd = ansiSequence.substr(ansiSequence.length - 1);
				var opts = ansiSequence.substr(0, ansiSequence.length - 1).split(";");
				opts.forEach(
					function(e, i, a) {
						a[i] = parseInt(e);
					}
				);
				ansiString = ansiString.substr(result[0].length);
				switch(cmd) {
					case 'A':
						if(isNaN(opts[0]))
							opts[0] = 1;
						cursor.y = Math.max(cursor.y - opts[0], 0);
						break;
					case 'B':
						if(isNaN(opts[0]))
							opts[0] = 1;
						cursor.y = cursor.y + opts[0];
						break;
					case 'C':
						if(isNaN(opts[0]))
							opts[0] = 1;
						cursor.x = Math.min(cursor.x + opts[0], 79);
						break;
					case 'D':
						if(isNaN(opts[0]))
							opts[0] = 1;
						cursor.x = Math.max(cursor.x - opts[0], 0);
						break;
					case 'f':
						cursor.y = (isNaN(opts[0])) ? 1 : opts[0];
						cursor.x = (opts.length < 2) ? 1 : opts[1];
						break;
					case 'H':
						cursor.y = (isNaN(opts[0])) ? 1 : opts[0];
						cursor.x = (opts.length < 2) ? 1 : opts[1];
						break;
					case 'm':
						for(var o in opts) {
							var i = parseInt(opts[o]);
							if(opts[o] == 0) {
								graphics.foreground = 37;
								graphics.background = 40;
								graphics.bright = false;
								graphics.blink = false;
							} else if(opts[o] == 1) {
								graphics.bright = true;
							} else if(opts[o] == 5) {
								graphics.blink = true;
							} else if(opts[o] >= 30 && opts[o] <= 37) {
								graphics.foreground = opts[o];
							} else if(opts[o] >= 40 && opts[o] <= 47) {
								graphics.background = opts[o];
							}
						}
						break;
					case 's':
						cursorStore = copyObject(cursor);
						break;
					case 'u':
						cursor = copyObject(cursorStore);
						break;
					case 'J':
						if(opts.length == 1 && opts[0] == 2) {
						/*	for(var d in this.data) {
								var o = copyObject(this.data[d]);
								o.chr = " ";
								this.data.push(o);
								cursor.y = 0;
								cursor.x = 0;
							} */
							for(var y = 0; y < 24; y++) {
								for(var x = 0; x < 80; x++) {
									this.data.push(
										{	'cursor' : {
												'x' : x,
												'y' : y
											},
											'graphics' : {
												'bright' : false,
												'blink' : false,
												'foreground' : 37,
												'background' : 40
											},
											'chr' : " "
										}
									);
								}
							}
						}
						break;
					case 'K':
						for(var d in this.data) {
							if(this.data[d].cursor.y != cursor.y || this.data[d].cursor.x < cursor.x)
								continue;
							var o = copyObject(this.data[d]);
							o.chr = " ";
							this.data.push(o);
						}
						break;
					default:
						// Unknown or unimplemented command
						break;
				}
			}
			width = Math.max(cursor.x, width);
			height = Math.max(cursor.y, height);
		}

	};


	this.__defineGetter__(
		"matrix",
		function() {
			var ret = {};
			for(var d = 0; d < self.data.length; d++) {
				if(typeof ret[self.data[d].cursor.y] == "undefined")
					ret[self.data[d].cursor.y] = {};
				ret[self.data[d].cursor.y][self.data[d].cursor.x] = {
					'graphics' : copyObject(self.data[d].graphics),
					'chr' : self.data[d].chr
				};
			}
			for(var y = 0; y <= height; y++) {
				if(typeof ret[y] == "undefined")
					ret[y] = {};
				for(var x = 0; x <= width; x++) {
					if(typeof ret[y][x] != "undefined")
						continue;
					ret[y][x] = {
						'graphics' : {
							'bright'		: false,
							'blink'			: false,
							'foreground'	: 37,
							'background'	: 40
						},
						'chr' : " "
					};
				}
			}
			return ret;
		}
	);
	
	this.__defineGetter__(
		"HTML",
		function() {

			var graphics = {
				'bright' : false,
				'blink' : false,
				'foreground' : 37,
				'background' : 40
			};

			var graphicsToSpan = function(graphics) {
				var bgcolor = defs.Attributes[graphics.background].htmlLow;
				var forecolor = graphics.bright ? defs.Attributes[graphics.foreground].htmlHigh : defs.Attributes[graphics.foreground].htmlLow;
				var span = '<span style="background-color: ' + bgcolor + '; color: ' + forecolor + ';">';
				return span;
			};

			var lines = [
				graphicsToSpan(graphics)
			];

			var matrix = self.matrix;
			for(var y in matrix) {
				var line = "";
				// var chars = y + ' ';
				if (Object.keys(matrix[y]).length == 2) {
					lines.push(matrix[y][0].chr);
				}
				else {
					for(var x in matrix[y]) {
						// chars += matrix[y][x].chr;
						if(!compareObjects(matrix[y][x].graphics, graphics)) {
							// style change - close the old span and start a new one
							line += "</span>" + graphicsToSpan(matrix[y][x].graphics);
							graphics = copyObject(matrix[y][x].graphics);
						}
						
						if (typeof defs.ASCIItoHTML[matrix[y][x].chr.charCodeAt(0)] == "undefined") {
							if (matrix[y][x].chr == " ") { line += "&nbsp;";}
							else { line += matrix[y][x].chr; }
						}
						else {
							line += "&#" + defs.ASCIItoHTML[matrix[y][x].chr.charCodeAt(0)].entityNumber + ";";
						}
					}
				lines.push(line + '<br/>');
				}
				// console.log(chars);
			}
			lines.push("</span>");
			return lines.join("");

		}
	);
};

// Lazily ported and modified from my old HTML5 ANSI editor
// Could be simplified and folded into ANSI.toGIF() at some point

module.exports = ANSI;
},{"./defs.js":1}]},{},[]);
