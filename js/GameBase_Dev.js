/*!
 * Gamebase v0.2
 * Copyright 2012, Wang Yu Xiang
 * Weibo : http://weibo.com/visolleon
 * Blog : http://www.cnblogs.com/visolleon
 * Email : visolleon@gmail.com
 * Date : 2012-07-02
 */
 (function (global){
 	/*!
 	 *	Game
 	 *	arguments :
 	 *		params : 
 	 *			{
	 *				id : string,
	 *				success : function() {},
	 *				error : function () {}
 	 *			} 
 	 */
 	var Game = function (params){
 		// Set the game ID
		this.ID = params.id || this.NewGuid();

    	this.gamecanvas = document.getElementById(params.id);
		this.context = this.gamecanvas.getContext("2d");

		if(!this.context){
			params.error && params.error();
		}
		else{
			params.success && params.success();
		}

		// The height of the canvas
    	this.Height = this.gamecanvas.height;

    	// The width of the canvas
    	this.Width = this.gamecanvas.width;

    	// The game sprite library
    	this.SpriteArray = [];
    	
    	// Expect FPS
    	this.ExpectFPS = 60;

    	this.Interval = parseInt(1000 / this.ExpectFPS, 10);

    	this.FrameCount = 0;

    	this.LastFrameTime = (new Date()).getTime();

    	this.FPS = 0;

    	// check browser is support full screen
    	this.IsSupportFullScreen = false;

    	this.Prefix = '';

    	// the canvas element full screen status.
    	this.IsFullScreen = false;

    	var prefixList = ['webkit', 'moz', 'o', 'ms', 'khtml'];

    	// checking
    	if(document.cancelFullScreen){
    		this.IsSupportFullScreen = true;
    	}
    	else{
    		for(var i=0; i<prefixList.length; i++){
    			if(document[prefixList[i] + 'CancelFullScreen']){
    				this.Prefix = prefixList[i];
    				this.IsSupportFullScreen = true;
    				break;
    			}
    		}
    	}
 	};

 	Game.prototype = {

    	// Get new random guid
    	NewGuid : function () {
		    var guid = '';
		    for (var i = 1; i <= 32; i++) {
		        var n = Math.floor(Math.random() * 16.0).toString(16);
		        guid += n;
		    }
		    return guid;
		},

		// Add a new sprit for game
		Add : function (sprite) {
	        this.SpriteArray.push(sprite);
	        for (var m = 0; m < this.SpriteArray.length; m++) {
	            for (var i = 0; i < this.SpriteArray.length - m - 1; i++) {
	                if (this.SpriteArray[i].zIndex > this.SpriteArray[i + 1].zIndex) {
	                    var temp = this.SpriteArray[i];
	                    this.SpriteArray[i] = this.SpriteArray[i + 1];
	                    this.SpriteArray[i + 1] = temp;
	                }
	            }
	        }
	    },

   		// game start
	    Start : function () {
	        if (this.FrameCount >= this.ExpectFPS) {
	            this.FPS = Math.round((this.FrameCount * 10000) / ((new Date()).getTime() - this.LastFrameTime)) / 10;

	            if (this.FPS < this.ExpectFPS - 0.5) {
	                this.Interval--;
	            }
	            else if (this.FPS > this.ExpectFPS + 0.5) {
	                this.Interval++;
	            }
	            this.FrameCount = 0;
	            this.LastFrameTime = (new Date()).getTime();
	        }

	        this.Update();

	        this.FrameCount++;
	        setTimeout(function () { this.Start(); }.bind(this), this.Interval);
	    },

	    // refresh and redraw the canvas, the game can been manual redraw without 'Start' method
	    Update : function () {
	        //Dispose the sprite library, delete the obsolete sprite
	        for (var i = 0; i < this.SpriteArray.length; i++) {
	            var o = this.SpriteArray[i];
	            if (o.__destroy) {
	                this.SpriteArray[i] = null;
	                this.SpriteArray.splice(i, 1);
	            }
	        }

	        // clear canvas
	        this.context.save();
	        this.context.clearRect(0, 0, this.Width, this.Height);
	        this.context.restore();

	        for (var i = 0; i < this.SpriteArray.length; i++) {
	            var o = this.SpriteArray[i];
	            if (o.Visible) {
	                this.context.save();
	                if (o.Alpha > 1) o.Alpha = 1;
	                if (o.Alpha) {
	                    if (o.Alpha >= 0 && o.Alpha <= 1) {
	                        this.context.globalAlpha = o.Alpha;
	                    }
	                    else if(o.Alpha > 1){
	                        this.context.globalAlpha = 1;
	                    }
	                    else {
	                        this.context.globalAlpha = 0;
	                    }
	                }
	                if (o.Translate) this.context.translate(o.Translate[0], o.Translate[1]);

	                if (o.Rotate) this.context.rotate(o.Rotate);

	                if (o.Scale) this.context.scale(o.Scale[0], o.Scale[1]);

	                o.Run(this.context);
	                this.context.restore();
	            }
	        }
	    },

	    // set canvas element to full screen
	    FullScreen : function () {
	    	if(this.IsSupportFullScreen){
	    		if(this.Prefix === ''){
	    			this.gamecanvas.requestFullScreen();
	    		}
	    		else{
	    			this.gamecanvas[this.Prefix + 'RequestFullScreen']();
	    		}
	    		this.IsFullScreen = true;
	    	}
	    },

	    // cancel full screen
	    CancelFullScreen : function () {
	    	if(this.IsSupportFullScreen){
	    		if(this.Prefix === ''){
	    			document.cancelFullScreen();
	    		}
	    		else{
	    			document[this.Prefix + 'CancelFullScreen']();
	    		}
	    		this.IsFullScreen = false;
	    	}
	    }
 	};

 	global.Game = global.vGamebase = Game;

 	/*!
 	 * Game element extend method
 	 * Necessary arguments:
 	 *		Type : [string] this string as the class name of the element for window and Game
 	 *		Init : [function] when new a instance, this method will be executed
 	 *		Run  : [function, argument: context] this method will be executed in game runing
 	 */
 	Game.Extend = function(obj){

    	var o = function (){

	 		// [width, height]
	 		this.Size = null;

	 		this.zIndex = 0;

	 		// [x, y]
	 		this.Position = [0, 0];

	 		//Rotate angle
	 		this.Rotate = null;

	 		// [x, y]
	 		this.Translate = null;

	 		// 0-1
		    this.Alpha = 1;

		    // [1, 1]
		    this.Scale = [1, 1];

		    this.Visible = true;

		    // The flag of this sprite status, true for obsolete
		    this.__destroy = false;

		    // Mouse click event
		    this.Click = null;

		    // Mouse drag event
		    this.Drag = null;

		    // Destroy this sprite
		    this.Destroy = function () {
		        this.__destroy = true;
		    };

 			this.Init.apply(this, arguments);
    	};

    	o.prototype = obj;

    	global[obj.Type] = Game[obj.Type] = o;
	};


 	/*!
	 * Bitmap
	 * arguments:
	 * 		file : url, ImageData, image
 	 */
 	Game.Extend({

 		Type : 'Bitmap',

 		DataType : 'url',

 		image : null,

 		SetImage : function (obj) {
		    if (obj && obj.constructor.toString().match(/function Image/)) {
		        //Image object
		        this.DataType = 'image';
		        this.image = obj;
		        if(!this.Size) this.Size = [obj.width, obj.height];
		    }
		    else if (obj && obj.constructor.toString().match(/function ImageData/)) {
		        //ImageData
		        this.DataType = 'imagedata';
		        this.image = obj;
		    }
		    else {
		        //URL
		        this.DataType = 'url';
		        this.image = new Image();
		        this.image.src = obj;

		        this.image.onload = function (e) {
		            if(!this.Size) this.Size = [this.image.width, this.image.height];
		        }.bind(this);
		    }
	    },

	    Init : function (obj){
	    	this.SetImage(obj);
	    },

	    Run : function (context) {
	        if (!this.Size) {
	            context.drawImage(this.image, this.Position[0], this.Position[1]);
	        }
	        else {
	            if (this.StartPoint == null) {
	                if (this.DataType == 'imagedata') {
	                    context.putImageData(this.image, this.Position[0], this.Position[1]);
	                }
	                else {
	                    context.drawImage(this.image, this.Position[0], this.Position[1], this.Size[0], this.Size[1]);
	                }
	            }
	            else {
	                var cutx = this.Size[0];
	                var cuty = this.Size[1];
	                if (this.image.width - this.StartPoint[0] < this.Size[0]) {
	                    cutx = this.image.width - this.StartPoint[0];
	                }
	                if (this.image.height - this.StartPoint[1] < this.Size[1]) {
	                    cuty = this.image.height - this.StartPoint[1];
	                }
	                if (this.DataType == 'imagedata') {
	                    context.putImageData(this.image, this.Position[0], this.Position[1]);
	                }
	                else {
	                    if (cutx > 0 && cuty > 0) {
	                        context.drawImage(this.image, this.StartPoint[0], this.StartPoint[1], cutx, cuty, this.Position[0], this.Position[1], cutx, cuty);
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
	Game.Extend({

		Type : "Shape",

		Order : null,

		Init : function (fn) {
			this.Order = fn;
		},

		Run : function (context) {
	        if (this.Order) {
            	this.Order(context);
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
	 *		borderStyle: [string]
	 *		border: [integer]
	 */
	Game.Extend({

		Type : "Arc",

		Radius : 0,

		StartAngle : 0,

		EndAngle : 0,

		AntiClockWise : false,

		Style : null,

		BorderStyle : null,

		Border : 0,

		Init : function (x, y, radius, startAngle, endAngle, anticlockwise, style, borderStyle, border) {
			this.Position = [x, y];
			this.Radius = radius;
			this.StartAngle = startAngle;
			this.EndAngle = endAngle;
			this.AntiClockWise = anticlockwise;
			this.Style = style;
			this.BorderStyle = borderStyle;
			if(border) this.Border = border;
		},

		Run : function (context) {
            if(this.BorderStyle) context.strokeStyle = this.BorderStyle;
            context.lineWidth = this.Border;
            context.beginPath();
            context.arc(this.Position[0], this.Position[1], this.Radius, this.StartAngle, this.EndAngle, this.AntiClockWise);
            if (this.Style) {
                context.fillStyle = this.Style;
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
	Game.Extend({

		Type : "Rect",

		Width : 0,

		Height : 0,

		Style : null,

		BorderStyle : null,

		Border : 0,

		Init : function (x, y, width, height, style, borderStyle, border) {
			this.Position = [x, y];
			this.Width = width;
			this.Height = height;
			this.Style = style;
			this.BorderStyle = borderStyle;
			if(border) this.Border = border;
		},

		Run : function (context) {
            context.lineWidth = this.Border;
            if (this.Style) {
            	context.fillStyle = this.Style;
        	}
            context.fillRect(this.Position[0], this.Position[1], this.Width, this.Height);
            if(this.Border) {
	            if(this.BorderStyle) context.strokeStyle = this.BorderStyle;
            	context.strokeRect(this.Position[0], this.Position[1], this.Width, this.Height);
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
	Game.Extend({

		Type : "Line",

		EndPosition : null,

		Border : 1,

		Style : null,

		Init : function (x, y, x2, y2, style, border) {
			this.Position = [x, y];
			this.EndPosition = [x2, y2];
			this.Style = style;
			if(border) this.Border = border;
		},

		Run : function (context) {
            context.strokeStyle = this.Style;
            context.lineWidth = this.Border;
            context.beginPath();
            context.moveTo(this.Position[0], this.Position[1]);
            context.lineTo(this.EndPosition[0], this.EndPosition[1]);
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
	Game.Extend({

		Type : "Polygon",

		Points : null,

		Border : 1,

		Style : null,

		BorderStyle : null,

		Init : function (points, style, borderstyle, border) {
			this.Points = points;
			this.Style = style;
			this.BorderStyle = borderstyle;
			this.Border = border;
		},

		Run : function (context) {
			if(this.Points){
	            context.strokeStyle = this.BorderStyle;
	            context.lineWidth = this.Border;
	            context.beginPath();

	            context.moveTo(this.Points[0][0], this.Points[0][1]);
	            for(var i = 1; i < this.Points.length; i++){
	            	if(this.Position){
	            		context.lineTo(this.Points[i][0] + this.Position[0], this.Points[i][1] + this.Position[1]);
	            	}
	            	else{
	            		context.lineTo(this.Points[i][0], this.Points[i][1]);
	            	}
	            }
	            context.lineTo(this.Points[0][0], this.Points[0][1]);
	            context.stroke();
	            if (this.Style) {
	            	context.fillStyle = this.Style;
	            	context.fill();
	        	}
	            context.closePath();
			}
		}
	});

	/*!
	 * Lable
	 * arguments:
	 *		str : string
	 */
	Game.Extend({

		Type : "Label",

		Text : '',

		// integer
		ShadowX : null,

		// integer
		ShadowY : null,

		// integer
		ShadowBlur : null,

		// rgba(0, 0, 0, 0.5)
		ShadowStyle : null,

		// rgba(0, 0, 0, 0.5)
		Style : null,

		// "30px Arial"
		Font : null,

		Init : function (str) {
			this.Text = str;
		},

		Run : function (context) {
	        if (this.ShadowX) context.shadowOffsetX = this.ShadowX;

	        if (this.ShadowY) context.shadowOffsetY = this.ShadowY;

	        if (this.ShadowBlur) context.shadowBlur = this.ShadowBlur;

	        if (this.ShadowStyle) context.shadowStyle = this.ShadowStyle;

	        if (this.Font) context.font = this.Font;

	        if (this.Style) context.fillStyle = this.Style;

	        context.fillText(this.Text, this.Position[0], this.Position[1]);
	    }

	});

	// the bind method for function object
 	if (!Function.prototype.bind) {
		Function.prototype.bind = function (oThis) {
		    if (typeof this !== "function") {
		      // closest thing possible to the ECMAScript 5 internal IsCallable function  
		      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
		    }
		  
		    var aArgs = Array.prototype.slice.call(arguments, 1),
		        fToBind = this,
		        fNOP = function () {},
		        fBound = function () {
		          return fToBind.apply(this instanceof fNOP
		                                 ? this
		                                 : oThis,
		                               aArgs.concat(Array.prototype.slice.call(arguments)));
		        };
		  
		    fNOP.prototype = this.prototype;
		    fBound.prototype = new fNOP();
		  
		    return fBound;
		};
	}

	/*!
	 * Audio Manager
	 */
	var Sound = function (url) {

	    // Loop for play
	    this.Loop = false;

	    // Playing status
	    this.IsPlaying = false;

	    if (!Audio) {
    		console.log('Your browser not support audio.');
		    return {
		    	Loop : this.Loop,
		    	IsPlaying : this.IsPlaying,
		    	Audio : {
		    		src : url
		    	},
		    	SetVolume : function(){
		    		console.log('try to set audio volumn failed.');
		    	},
		    	Play : function(){
		    		console.log('try to play audio failed.');
		    	},
		    	Pause : function(){
		    		console.log('try to pause audio failed.');
		    	},
		    	Stop : function(){
		    		console.log('try to stop audio failed.');
		    	}
		    };
	    }
	    else {
		    this.Audio = new Audio();
		    this.Audio.src = url;
		    this.Audio.preload = 'auto';
		    this.Audio.load();

		    // set the volumn
		    this.SetVolume = function (value) {
		        this.Audio.volume = value;
		    };

		    this.Play = function () {
		        this.IsPlaying = true;
		        if (this.Loop) {
		            this.Audio.loop = 'loop';
		            this.Audio.addEventListener('ended', function () {
		                this.Audio.currentTime = 0;
		            }.bind(this), false);
		        }
		        else {
		            this.Audio.addEventListener('ended', function () {
		                this.IsPlaying = false;
		            }.bind(this), false);
		        }
		        this.Audio.play();
		    };

		    this.Pause = function () {
		        this.Audio.pause();
		        this.IsPlaying = false;
		    };

		    this.Stop = function () {
		        try{
		            this.Audio.pause();
		            this.Audio.currentTime = 0;
		            this.IsPlaying = false;
		        }
		        catch(err){
		        }
		    };
		}
	};

	global.Sound = Sound;

 })(window);