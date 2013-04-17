var domParse = function(g) {
		{
			var cParent = g.gamecanvas.parentNode;

			// 删除canvas节点
			cParent.removeChild(g.gamecanvas);

			g.gameDOM = document.createElement('div');
			g.gameDOM.id = g.id;
			g.gameDOM.style.position = 'relative';
			g.gameDOM.style.width = g.width + 'px';
			g.gameDOM.style.height = g.height + 'px';
			g.gameDOM.style.overflow = 'hidden';

			cParent.appendChild(g.gameDOM);
		}

		// 创建DOM
		function createDOM() {
			var dom = document.createElement('div');
			dom.style['position'] = 'absolute';
			g.gameDOM.appendChild(dom);
			return dom;
		}

		function createImage(url) {
			var dom = document.createElement('img');
			dom.style['position'] = 'absolute';
			dom.src = url;
			g.gameDOM.appendChild(dom);
			return dom;
		}

		/**
		 * Bitmap override
		 */
		Bitmap.prototype.renderDOM = function() {
			if(this.dataType != 'imagedata') {
				this.dom.src = this.image.src;
			} else {
				this.visible = false;
			}
		};

		/**
		 * Label override
		 */
		Label.prototype.renderDOM = function() {
			this.dom.innerHTML = this.text;
			this.dom.style.fontSize = this.fontSize;
			this.dom.style.fontFamily = this.font;
			this.dom.style.color = this.style;
		};

		/**
		 * Rect override
		 */
		Rect.prototype.renderDOM = function() {
			this.dom.style.width = this.width + 'px';
			this.dom.style.height = this.height + 'px';
			this.dom.style.backgroundColor = this.style;
			this.dom.style.borderWidth = this.border;
			this.dom.style.borderStyle = 'solid';
			this.dom.style.borderColor = this.borderStyle;
		};

		g.update = function() {
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

						if(!o.renderDOM) {
							o.visible = false;
							break;
						}

						if(!o.dom) {
							if(o.type == 'Bitmap') {
								o.dom = createImage(o.image.src);
							}
							else {
								o.dom = createDOM();
							}
						}

						if(o.size) {
							o.dom.style.width = o.size[0] + 'px';
							o.dom.style.height = o.size[1] + 'px';
						}

						if(o.position) {
							o.dom.style.left = o.position[0] + 'px';
							o.dom.style.top = o.position[1] + 'px';
						}

						// 层次
						o.dom.style.zIndex = o.zIndex;

						// 设置透明度
						if(o.alpha != null) {
							if(o.alpha >= 1) {
								o.alpha = 1;
							} else if(o.alpha < 0) {
								o.alpha = 0;
							}
							o.dom.style.opacity = o.alpha;
							o.dom.style.alpha = o.alpha;
						} else {
							o.dom.style.opacity = 1;
							o.dom.style.alpha = o.alpha;
						}

						var transform = '';

						// 坐标
						if(o.translate) {
							transform = 'translate(' + o.translate[0] + 'px, ' + o.translate[1] + 'px) ';
						}

						// 旋转角度
						if(o.rotate) {
							transform += 'rotate(' + (o.rotate * 180 / 2) + 'deg)';
						}

						// 缩放
						if(o.scale) {
							transform += 'scale(' + o.scale[0] + ', ' + o.scale[1] + ')';
						}

						if(this.prefix) {
							o.dom.style['-' + this.prefix + '-transform'] = transform;
						} else {
							o.dom.style['transform'] = transform;
						}

						o.renderDOM();
					}
					else{
						if(o.dom)
							o.dom.style['display'] = 'none';
					}
				}
			}
		};
	};