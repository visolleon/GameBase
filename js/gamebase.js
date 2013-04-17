/*!
 * Gamebase v0.25
 * Copyright 2012, Wang Yu Xiang
 * Weibo : http://weibo.com/visolleon
 * Blog : http://www.cnblogs.com/visolleon
 * Email : visolleon@gmail.com
 * Date : 2012-12-06
 */
(function(global) {
	/*!
	 *	Game
	 *	arguments :
	 *		params :
	 *			{
	 *				id : string,
	 *				fps : 60,
	 *				height : 800,
	 *				width : 600,
	 *				vague : false,
	 *				success : function() {},
	 *				error : function () {},
	 *				ready : function() {},
	 *			}
	 */
	var game = function(params) {
			// Set the game ID
			this.id = params.id || this.NewGuid();

			this.gamecanvas = document.getElementById(params.id);
			try {
				this.context = this.gamecanvas.getContext("2d");
			} catch(e) {
				console.log('your browser not support canvas.');
			}

			if(!this.context) {
				params.error && params.error();
			}

			// Is game canvas drawed ready
			this.drawed = false;

			this.vagueDraw = !! params.vague || false;

			this.ready = params.ready;

			// The height of the canvas
			if(this.gamecanvas) {
				this.height = this.gamecanvas.height;
			}

			if(params.height && params.height > 0) {
				this.height = params.height;
				this.gamecanvas.height = this.height;
			}

			// The width of the canvas
			if(this.gamecanvas) {
				this.width = this.gamecanvas.width;
			}

			if(params.width && params.width > 0) {
				this.width = params.width;
				this.gamecanvas.width = this.width;
			}

			// The game sprite library
			this.spriteArray = [];

			// Expect FPS
			this.expectFPS = params.fps || 60;

			this.interval = (1000 / this.expectFPS) | 0;

			this.frameCount = 0;

			this.lastFrameTime = (new Date()).getTime();

			this.FPS = 0;

			// check browser is support full screen
			this.isSupportFullScreen = false;

			this.prefix = '';

			// the canvas element full screen status.
			this.isFullScreen = false;

			var prefixList = ['webkit', 'moz', 'o', 'ms', 'khtml'];

			// checking
			if(document.cancelFullScreen) {
				this.isSupportFullScreen = true;
			} else {
				for(var i = 0; i < prefixList.length; i++) {
					if(document[prefixList[i] + 'CancelFullScreen']) {
						this.prefix = prefixList[i];
						this.isSupportFullScreen = true;
						break;
					}
				}
			}
			params.success && params.success();
		};

	game.prototype = {

		// Animate function, instead of setTimeout or setInterval
		requestAnimateFrame: function(callback) {
			var anmiteFrame = global.requestAnimationFrame || global[this.prefix + 'RequestAnimationFrame'];
			if(!anmiteFrame) {
				anmiteFrame = function(callback) {
					global.setTimeout(callback, this.Interval);
				};
			}
			anmiteFrame(callback);
		},

		// Get new random guid
		newGuid: function() {
			var guid = '';
			for(var i = 1; i <= 32; i++) {
				var n = Math.floor(Math.random() * 16.0).toString(16);
				guid += n;
			}
			return guid;
		},

		// Add a new sprite for game
		add: function(sprite) {
			if(this.vagueDraw) {
				sprite.vagueDraw = this.vagueDraw;
			}
			this.spriteArray.push(sprite);
			this.sort();
		},

		// Sort sprites by zIndex
		sort: function() {
			for(var m = 0; m < this.spriteArray.length; m++) {
				for(var i = 0; i < this.spriteArray.length - m - 1; i++) {
					if(this.spriteArray[i].zIndex > this.spriteArray[i + 1].zIndex) {
						var temp = this.spriteArray[i];
						this.spriteArray[i] = this.spriteArray[i + 1];
						this.spriteArray[i + 1] = temp;
					}
				}
			}
		},

		// game start
		start: function() {
			if(this.frameCount >= this.expectFPS) {
				this.FPS = Math.round((this.frameCount * 10000) / ((new Date()).getTime() - this.lastFrameTime)) / 10;

				if(this.FPS < this.expectFPS - 0.5) {
					this.interval--;
				} else if(this.FPS > this.expectFPS + 0.5) {
					this.interval++;
				}
				this.frameCount = 0;
				this.lastFrameTime = (new Date()).getTime();
			}

			this.update();

			this.frameCount++;
			this.requestAnimateFrame(

			function() {
				if(!this.drawed) {
					this.drawed = true;
					this.ready && this.ready();
				}
				this.start();
			}.bind(this));
		},

		// refresh and redraw the canvas, the game can been manual redraw without 'Start' method
		update: function() {
			// clear canvas
			this.context.clearRect(0, 0, this.width, this.height);

			for(var i = 0; i < this.spriteArray.length; i++) {
				var o = this.spriteArray[i];
				//Dispose the sprite library, delete the obsolete sprite
				if(o.__destroy) {
					this.spriteArray[i] = null;
					this.spriteArray.splice(i, 1);
					continue;
				} else {
					if(o.visible) {
						// check sprite array need sort
						if(i > 0) {
							if(o.zIndex < this.spriteArray[i - 1].zIndex) {
								this.sort();
								break;
							}
						}
						this.context.save();
						if(o.alpha > 1) o.alpha = 1;
						if(o.alpha != null) {
							if(o.alpha >= 0 && o.alpha <= 1) {
								this.context.globalAlpha = o.alpha;
							} else if(o.alpha > 1) {
								this.context.globalAlpha = 1;
							} else {
								this.context.globalAlpha = 0;
							}
						}
						if(o.translate) this.context.translate(o.translate[0], o.translate[1]);

						if(o.rotate) this.context.rotate(o.rotate);

						if(o.scale) this.context.scale(o.scale[0], o.scale[1]);

						o.render(this.context);
						this.context.restore();
					}
				}
			}
		},

		// set canvas element to full screen
		fullScreen: function(id) {
			if(this.isSupportFullScreen) {
				if(this.prefix === '') {
					if(!id) {
						this.gamecanvas.requestFullScreen();
					}
					else {
						document.getElementById(id).requestFullScreen();
					}
				} else {
					if(!id) {
						this.gamecanvas[this.prefix + 'RequestFullScreen']();
					}
					else {
						document.getElementById(id)[this.prefix + 'RequestFullScreen']();
					}
				}
				this.isFullScreen = true;
			}
		},

		// cancel full screen
		cancelFullScreen: function() {
			if(this.isSupportFullScreen) {
				if(this.prefix === '') {
					document.cancelFullScreen();
				} else {
					document[this.prefix + 'CancelFullScreen']();
				}
				this.isFullScreen = false;
			}
		}
	};

	global.Game = global.vGamebase = game;

	/*!
	 * Game element extend method
	 * Necessary arguments:
	 *		Type : [string] this string as the class name of the element for window and Game
	 *		Init : [function] when new a instance, this method will be executed
	 *		Run  : [function, argument: context] this method will be executed in game runing
	 */
	Game.extend = function(obj) {

		var o = function() {

				// [width, height]
				this.size = null;

				this.zIndex = 0;

				// if need vague draw
				this.vagueDraw = false;

				// [x, y]
				this.position = [0, 0];

				//rotate angle
				this.rotate = null;

				// [x, y]
				this.translate = null;

				// 0-1
				this.alpha = 1;

				// [1, 1]
				this.scale = [1, 1];

				this.visible = true;

				// The flag of this sprite status, true for obsolete
				this.__destroy = false;

				// Mouse click event
				this.click = null;

				// Mouse drag event
				this.drag = null;

				// Destroy this sprite
				this.destroy = function() {
					this.__destroy = true;
				};

				if(arguments.length === 2 && arguments[0] === '_arguments_') {
					this.init.apply(this, arguments[1]);
				} else this.init.apply(this, arguments);
			};

		o.prototype = obj;

		global[obj.type] = game[obj.type] = o;
		game.prototype['create' + obj.type] = function() {
			var curObj = new o('_arguments_', arguments);
			this.add(curObj);
			return curObj;
		};
	};


	/*!
	 * Bitmap
	 * arguments:
	 * 		file : url, ImageData, image
	 */
	game.extend({

		type: 'Bitmap',

		datatype: 'url',

		image: null,

		setImage: function(obj, callback) {
			if(obj && obj.constructor.toString().match(/function ImageData/)) {
				//ImageData
				this.dataType = 'imagedata';
				this.image = obj;
				if(!this.size) this.size = [obj.width, obj.height];
				callback && callback.bind(this)();
			} else if(obj && obj.constructor.toString().match(/function String/)) {
				//URL
				this.dataType = 'url';
				this.image = new Image();
				this.image.src = obj;

				this.image.onload = function(e) {
					if(!this.size) this.size = [this.image.width, this.image.height];
					callback && callback.bind(this)();
				}.bind(this);
			} else {
				//Image object
				this.dataType = 'image';
				this.image = obj;
				if(!this.size) this.size = [obj.width, obj.height];
				callback && callback.bind(this)();
			}
		},

		init: function(obj, callback) {
			this.setImage(obj, callback);
		},

		render: function(context) {
			var p = this.position;
			if(this.vagueDraw) {
				if(p) {
					p = [(0.5 + p[0]) | 0, (0.5 + p[1]) | 0];
				}
			}
			if(!this.size) {
				if(this.dataType == 'imagedata') {
					context.putImageData(this.image, p[0], p[1]);
				} else {
					context.drawImage(this.image, p[0], p[1]);
				}
			} else {
				if(this.startPoint == null) {
					if(this.dataType == 'imagedata') {
						context.putImageData(this.image, p[0], p[1]);
					} else {
						context.drawImage(this.image, p[0], p[1], this.size[0], this.size[1]);
					}
				} else {
					var cutx = this.size[0];
					var cuty = this.size[1];
					if(this.image.width - this.startPoint[0] < this.size[0]) {
						cutx = this.image.width - this.startPoint[0];
					}
					if(this.image.height - this.startPoint[1] < this.size[1]) {
						cuty = this.image.height - this.startPoint[1];
					}
					if(this.dataType == 'imagedata') {
						context.putImageData(this.image, p[0], p[1], this.size[0], this.size[1]);
					} else {
						if(cutx > 0 && cuty > 0) {
							context.drawImage(this.image, this.startPoint[0], this.startPoint[1], cutx, cuty, p[0], p[1], cutx, cuty);
						}
					}
				}
			}
		}

	});


	/*!
	 *  Shape
	 *		do somestring by yourself with context of canvas
	 *	arguments:
	 *  	fn: function (contenxt) {
	 *				// do somestring...
	 *			}
	 *
	 */
	game.extend({

		type: "Shape",

		order: null,

		init: function(fn) {
			this.order = fn;
		},

		render:  function(context) {
			if(this.order) {
				this.order(context);
			}
		}
	});

	/*!
	 *  Arc
	 *	arguments:
	 *  	x: [integer]
	 *		y: [integer]
	 *		radius: [integer]
	 *		startAngle: [float]
	 *		endAngle: [float], e.g.: Math.PI
	 *		anticlockwise: [bool]
	 *		style: [string], e.g.: rgba(255,255,255,1) / #FF0000 / #fff
	 *		borderstyle: [string]
	 *		border: [integer]
	 */
	game.extend({

		type: "Arc",

		radius: 0,

		startAngle: 0,

		endAngle: 0,

		antiClockWise: false,

		style: null,

		borderStyle: null,

		border: 0,

		init: function(x, y, radius, startAngle, endAngle, anticlockwise, style, borderStyle, border) {
			this.position = [x, y];
			this.radius = radius;
			this.startAngle = startAngle;
			this.endAngle = endAngle;
			this.antiClockWise = anticlockwise;
			this.style = style;
			this.borderStyle = borderStyle;
			if(border) this.border = border;
		},

		render:  function(context) {
			var p = this.position;
			if(this.vagueDraw) {
				if(p) {
					p = [(0.5 + p[0]) | 0, (0.5 + p[1]) | 0];
				}
			}
			if(this.borderStyle) context.strokeStyle = this.borderStyle;
			else context.strokeStyle = 'rgba(0,0,0,0)';
			context.lineWidth = this.border;
			context.beginPath();
			context.arc(p[0], p[1], this.radius, this.startAngle, this.endAngle, this.antiClockWise);
			if(this.style) {
				context.fillStyle = this.style;
				context.fill();
			}
			context.stroke();
			context.closePath();
		}
	});

	/*!
	 *  Rect
	 *	arguments:
	 *  	x: position x
	 *		y: position y
	 *		width: height of this rectangle
	 *		height: this rectangle's width
	 *		style: fill style
	 *		borderstyle: line style of this rectangle
	 *		border: line width of this rectangle
	 */
	game.extend({

		type: "Rect",

		width: 0,

		height: 0,

		style: null,

		borderStyle: null,

		border: 0,

		init: function(x, y, width, height, style, borderStyle, border) {
			this.position = [x, y];
			this.width = width;
			this.height = height;
			this.style = style;
			this.borderStyle = borderStyle;
			if(border) this.border = border;
		},

		render:  function(context) {
			var p = this.position;
			if(this.vagueDraw) {
				if(p) {
					p = [(0.5 + p[0]) | 0, (0.5 + p[1]) | 0];
				}
			}
			context.lineWidth = this.border;
			if(this.style) {
				context.fillStyle = this.style;
			}
			context.fillRect(p[0], p[1], this.Width, this.Height);
			if(this.border) {
				if(this.borderStyle) context.strokeStyle = this.borderStyle;
				context.strokeRect(p[0], p[1], this.Width, this.Height);
			}
		}
	});

	/*!
	 *  Line
	 *	arguments:
	 *  	x: X of position
	 *		y: y of position
	 *		x2: X of end position
	 *		y2: Y of end position in canvas
	 *		style: line style
	 *		border: line width
	 */
	game.extend({

		type: "Line",

		endPosition: null,

		border: 1,

		style: null,

		init: function(x, y, x2, y2, style, border) {
			this.position = [x, y];
			this.endPosition = [x2, y2];
			this.style = style;
			if(border) this.border = border;
		},

		render:  function(context) {
			var p = this.position;
			if(this.vagueDraw) {
				if(p) {
					p = [(0.5 + p[0]) | 0, (0.5 + p[1]) | 0];
				}
			}
			context.strokeStyle = this.style;
			context.lineWidth = this.border;
			context.beginPath();
			context.moveTo(p[0], p[1]);
			context.lineTo(this.endPosition[0], this.endPosition[1]);
			context.stroke();
			context.closePath();
		}
	});

	/*!
	 *	Polygon
	 *	arguments:
	 *		points: [[x1,y1],[x2,y2]...]
	 *		style: e.g. : "#FF0000"
	 *		borderstyle: e.g. : "#FF0000"
	 *		border: [integer]
	 */
	game.extend({

		type: "Polygon",

		points: null,

		border: 1,

		style: null,

		borderStyle: null,

		init: function(points, style, borderstyle, border) {
			this.points = points;
			this.style = style;
			this.borderStyle = borderstyle;
			this.border = border;
		},

		render:  function(context) {
			var p = this.position;
			if(this.vagueDraw) {
				if(p) {
					p = [(0.5 + p[0]) | 0, (0.5 + p[1]) | 0];
				}
			}
			if(this.points) {
				context.strokeStyle = this.borderStyle;
				context.lineWidth = this.border;
				context.beginPath();

				context.moveTo(this.points[0][0], this.points[0][1]);
				for(var i = 1; i < this.points.length; i++) {
					if(p) {
						context.lineTo(this.points[i][0] + p[0], this.points[i][1] + p[1]);
					} else {
						context.lineTo(this.points[i][0], this.points[i][1]);
					}
				}
				context.lineTo(this.points[0][0], this.points[0][1]);
				context.stroke();
				if(this.style) {
					context.fillStyle = this.style;
					context.fill();
				}
				context.closePath();
			}
		}
	});

	/*!
	 * Label
	 * arguments:
	 *		str : string
	 */
	game.extend({

		type: "Label",

		text: '',

		// integer
		shadowX: null,

		// integer
		shadowY: null,

		// integer
		shadowBlur: null,

		// rgba(0, 0, 0, 0.5)
		shadowStyle: null,

		// rgba(0, 0, 0, 0.5)
		style: null,

		// "Arial"
		font: null,

		// 30px
		fontSize: null,

		init: function(str) {
			this.text = str;
		},

		render:  function(context) {
			if(this.shadowX) context.shadowOffsetX = this.shadowX;

			if(this.shadowY) context.shadowOffsetY = this.shadowY;

			if(this.shadowBlur) context.shadowBlur = this.shadowBlur;

			if(this.ShadowStyle) context.shadowStyle = this.ShadowStyle;

			if(this.font && this.fontSize) {
				context.font = this.fontSize + ' ' + this.font;
			}

			if(this.style) context.fillStyle = this.style;

			var p = this.position;
			if(this.vagueDraw) {
				if(p) {
					p = [(0.5 + p[0]) | 0, (0.5 + p[1]) | 0];
				}
			}
			context.fillText(this.text, p[0], p[1]);
		}

	});

	// the bind method for function object
	if(!Function.prototype.bind) {
		Function.prototype.bind = function(oThis) {
			if(typeof this !== "function") {
				// closest thing possible to the ECMAScript 5 internal IsCallable function  
				throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
			}

			var aArgs = Array.prototype.slice.call(arguments, 1),
				fToBind = this,
				fNOP = function() {},
				fBound = function() {
					return fToBind.apply(this instanceof fNOP ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
				};

			fNOP.prototype = this.prototype;
			fBound.prototype = new fNOP();

			return fBound;
		};
	}

	/*!
	 * Audio Manager
	 */
	var sound = function(url) {
			var notSupportModel = {
				loop: this.loop,
				isPlaying: this.isPlaying,
				Audio: {
					src: url
				},
				setVolume: function() {
					console.log('try to set audio volumn failed.');
				},
				canPlayType: function() {
					console.log('try to set audio volumn failed.');
				},
				setSrc: function() {
					console.log('try to set audio volumn failed.');
				},
				loop: function() {
					console.log('try to set audio volumn failed.');
				},
				play: function() {
					console.log('try to play audio failed.');
				},
				pause: function() {
					console.log('try to pause audio failed.');
				},
				stop: function() {
					console.log('try to stop audio failed.');
				}
			};

			if(!url) return notSupportModel;

			// Playing status
			this.isPlaying = false;

			var audio = null;

			this.setRate = function(r) {
				if(audio != null) {
					audio.playbackRate = r;
				}
			};

			this.getRate = function() {
				if(audio && audio.playbackRate) {
					return audio.playbackRate;
				} else {
					return audio.defaultPlaybackRate;
				}
			};

			this.canPlayType = function(mediaType) {
				if(audio) {
					var r = audio.canPlayType(mediaType);
					if(r != null && r.length > 0) {
						return true;
					}
				}
				return false;
			};

			this.setSrc = function(url) {
				this.stop();
				if(audio && audio.src) {
					audio.src = url;
					audio.load();
				} else {
					audio = new Audio(url);
					audio.load();
				}
			};

			if(global.Audio == void 0) {
				console.log('Your browser not support audio.');
				return notSupportModel;
			} else {
				audio = new Audio();
				audio.src = url;
				audio.preload = 'auto';
				audio.load();

				// set the volumn
				this.setVolume = function(value) {
					if(audio) audio.volume = value;
				};

				this.loop = function () {
					audio.loop = 'loop';
				};

				this.play = function() {
					audio.play();
					this.isPlaying = true;
					if(this.Loop) {
						audio.loop = 'loop';
						audio.addEventListener('ended', function() {
							audio.currentTime = 0;
						}.bind(this), false);
					} else {
						audio.addEventListener('ended', function() {
							this.isPlaying = false;
						}.bind(this), false);
					}
				};

				this.pause = function() {
					audio.pause();
					this.isPlaying = false;
				};

				this.stop = function() {
					try {
						audio.pause();
						audio.currentTime = 0;
						this.isPlaying = false;
					} catch(err) {}
				};
			}
		};

	global.Sound = sound;

	if(!global.console) {
		global.console = {
			log: function () {},
			debug: function () {},
			error: function () {}
		}
	}

})(window);