/*
 * 
1 You can have an svg in an svg, groups are probably better
2 g style="pointer-events:all" and :none
put all the non-editable things in the :none
Though with the delete tool, everything is editable on way or another...

on mouseovers, show the resize points in a different group. (small circles.) On circle mouse over, grow the circle.

*/


var Pen = function() {
		var self = this;

		var _color = "#000000";
		var _opacity = 1.0;
		var _width = 5;
		var _offset = null;
		var _mode = 0;
		var _scale = 1;//should always be stored as 1, only impact incoming points

		// Drawing state
		var _drawing = false;
		var _c = null;
		var _points = [];

		self.scale = function(value) {
			if (value === undefined || value === 0 || value === 0.0){
		      	return _scale;
		    }

			_scale = value;

			return self;
		};
		
		self.color = function(value) {
			if (value === undefined){
		      	return _color;
		    }

			_color = value;

			return self;
		};

		self.width = function(value) {
			if (value === undefined) {
				return _width;
			} 

			_width = value;

			return self;
		}

		self.opacity = function(value) {
			if (value === undefined) {
				return _opacity;
			} 

			if (value < 0) {
				value = 0;
			} else if (value > 1) {
				value = 1;
			}

			_opacity = value;

			return self;
		}
		
		self.mode = function(i) {
			if (i === undefined) {
				return _mode;
			} 
			_mode = i;
			
			return self;
		}

		self.start = function(e, offset) {
			_drawing = true;

			_offset = offset;
			
			var x = (e.pageX - _offset.left) / _scale,
				y = (e.pageY - _offset.top) / _scale;
			_points.push([x, y]);
			_c = {};
			_c["stroke"] = _color;
			_c["stroke-opacity"] = _opacity;
			_c["stroke-width"] = _width;
			_c["stroke-linecap"] = "round";
			_c["fill"]="none";
			
			if(_mode === 2) {
				//Spotlight? Kill any other spotlights
				//wait for it...
				var last, node = document.getElementById("selectors");
				if (node) while (last = node.lastChild) node.removeChild(last);//does not have access to parent's removechilds
				//Ideally, remove only the correct selector group, but only the spotlight selectors should be visible, and there should be at most one spotlight
				$('#mysvg path[fill-rule=evenodd]').remove();
				//evenodd is (currently) a unique identifier. If you need that for your thing, add more selectors here. .editable, perhaps.
				
				//There can be only one!
			}
			

		};
		
		rectangleSVG = function() {
			var pstart = _points[0];
			var pend = p = _points[_points.length-1];
			var x1 = parseInt(Math.min(pstart[0], pend[0]));
			var y1 = parseInt(Math.min(pstart[1], pend[1]));
			//var width = Math.abs(firstX-curX);
			//var height = Math.abs(firstY-curY);
			////would be req for Rect, but cramming rect in here would be tricky with all the action history and saving and whatnot. See also the hack needed to get fill-rule to work
			var x2 = parseInt(Math.max(pstart[0], pend[0]));
			var y2 = parseInt(Math.max(pstart[1], pend[1]));
			return "M" + x1 + "," + y1 +
				" L" + x1 + "," + y2 +
				" L" + x2 + "," + y2 + 
				" L" + x2 + "," + y1;
		}

		rectangle = function() {
			var pstart = _points[0];
			var pend = p = _points[_points.length-1];
			var x1 = parseInt(Math.min(pstart[0], pend[0]));
			var y1 = parseInt(Math.min(pstart[1], pend[1]));
			//var width = Math.abs(firstX-curX);
			//var height = Math.abs(firstY-curY);
			////would be req for Rect, but cramming rect in here would be tricky with all the action history and saving and whatnot. See also the hack needed to get fill-rule to work
			var x2 = parseInt(Math.max(pstart[0], pend[0]));
			var y2 = parseInt(Math.max(pstart[1], pend[1]));
console.log('[' + x1 + ', ' + y1 + ", " +  x2 + ", " + y2 + '],');
		}
		self.finish = function(e) {
			var path = null;
			
			//rectangle();
			
			if (_c != null) {
				if (_points.length <= 1) {
					_c = {};
				} else {
					path = _c;
					
					if (_mode === 1) {

						path["d"]= 
							//Walk widdershins around the 4 points of the bounding rectangle
							 rectangleSVG() +
							" Z"//close the loop
						;//will reset the path attr "d"
						path["fill"]='#000';
						path["fill-opacity"]="1";
						path["class"] = "editable";
						path["pen"] = 1;
					}
					if(_mode === 2) {
						//spotlight is going to be trickier
						//Add an intersecting black box the size of the screen?
						
						path["d"]= "M0,0L0,10000L10000,10000L10000,0Z " + 
						//Walk widdershins around the 4 points of the bounding rectangle
							rectangleSVG() +
							" Z"//close the loop
						;//will reset the path attr "d"
						path["fill"]='#000';
						path["fill-rule"]="evenodd";
						path["fill-opacity"]="1";
						path["class"] = "editable";
						path["pen"] = 2;
						//fill rule required a minor hack to raphael-min.js. Find '"fill-opacity": 1,' insert '"fill-rule":"evenodd",'
					}
					
				}
			}
			
			_drawing = false;
			_c = null;
			_points = [];
			
			
			
			return path;
		};

		self.move = function(e) {
			if (_drawing == true) {
				var x = (e.pageX - _offset.left) / _scale,
					y = (e.pageY - _offset.top) / _scale;			
				_points.push([x, y]);
				if (_mode) {
					//new transulcent rectangle mode
					_c["d"] = 
							//Walk widdershins around the 4 points of the bounding rectangle
							 rectangleSVG() +
							" Z"//close the loop
						;
						_c["fill-opacity"]="0.6";
						_c["fill"] ='rgba(0, 0, 0, 0.6)';
					_c["stroke"]= 'rgba(0, 0, 0, 0.8)';
				} else {
					_c["d"] = points_to_svg();
				}
				return _c;
			}
			return null;
		};

		function points_to_svg() {
			if (_points != null && _points.length > 1) {
				var p = _points[0];
				var path = "M" + parseInt(p[0]) + "," + parseInt(p[1]);
				for (var i = 1, n = _points.length; i < n; i++) {
					p = _points[i];
					path += " L" + parseInt(p[0]) + "," + parseInt(p[1]); 
				} 
				return path;
			} else {
				return "";
			}
		};
	};
	
	
	
	var neosvg = function(svg) {
		var self = this;
		var _pen = new Pen();
		var _svg = svg;
		var _idcntr = 1;
		var _editing;
		
		var dragging = false;
		
		self.pen = function(value) {
			if (value === undefined) {
				return _pen;
			}
			_pen = value;
			return self; // function-chaining
		};
		
		function _drawdown(e) {
			if (!dragging) {
				_pen.start(e, _svg.offset());
			}
		};

		function _drawmove(e) {
			if (!dragging) {
				var opts = _pen.move(e);
				if (opts != null) {
					//I want this to be the only child, and there may or may not be any number of existing nodes.
					removeChilds(document.getElementById('tmplayer'));
					document.getElementById('tmplayer').appendChild(createSVGobj(opts));
				}
			}
		};

		function _drawup(e) {
			if (!dragging) {
				var opts = _pen.finish(e);
				if (opts != null) {
					while(document.getElementById("sobj"+ _idcntr) != undefined) {
						_idcntr = _idcntr+1;
					}
					opts['id'] = "sobj"+ _idcntr;
					
					//$('#tmplayer').html('');//removeChildren
					removeChilds(document.getElementById('tmplayer'));
					var obj = createSVGobj(opts);
					document.getElementById('drawlayer').appendChild(obj);
					if (_pen.mode()) {
						//obj needs handles
						showdraggables(obj.getAttributeNS(null, 'id'), obj.getAttributeNS(null, 'd'), obj.getAttributeNS(null, 'pen'));
					}
				}
			}
		};
		
		function _delclick(e) {
			removeChilds(document.getElementById("selectors"));
			e.toElement.remove();
		}
		
		function _del2click(e) {
			var idval = $(e.toElement).data('origid');
			var orig = document.getElementById(idval);
			orig.remove();
			var orig = document.getElementById("selectorgroup"+idval);
			orig.remove();
		}
		
		function _del3click(e) {
			//get the real coords from the click
			var root = $('#mysvg')[0]
			var rpos = root.createSVGRect();//svg doc root, not the doc doc root, which will not have the SVG functions
			var _offset = _svg.offset();
			var _scale = _pen.scale();
			rpos.x = (e.pageX - _offset.left) / _scale,
			rpos.y = (e.pageY - _offset.top) / _scale;
			//calculate the death zone: a rectangle that pretends to cover the circle icon, as if the icon could do something.
			rpos.x = rpos.x; rpos.y = rpos.y - 21;
			rpos.width = rpos.height = 18;
			//search the entire svg tree for objects that have any points within the death zone
			/*
			//Problem: getIntersectionList occasionally returns random objects
			//Other problem: pts in rect only works on the actual points in the path, not the points drawn between them.
			var list = $('#drawlayer path');
			for(var i = 0; i < list.length; i++) {
				//if the rects intersect, do the more indepth analysis
				if (root.checkIntersection(list[i], rpos)) {
					//should check if this is a mask/spotlight
					var path = list[i].getAttributeNS(null, 'd');
					var tokens = path.split(" ");
					for (var j = 0, n = tokens.length; j < n; j++) {
						points = tokens[j].split(",");
						if (points.length == 2) {
							var x = parseInt(points[0].substr(1));
							var y = parseInt(points[1]);
			//is this point in the death zone
							if (x >= rpos.x && x <= rpos.x + rpos.width
								&& y >= rpos.y && y <= rpos.y + rpos.height) {
								list[i].remove();
			continue; //2
							}
						}
					}
				}
			}
			*/
			var list = root.getIntersectionList(rpos, null);
			//that is actually way more convenient that I was expecting
			//also bug filled: https://code.google.com/p/chromium/issues/detail?id=370012
			for(var i = 0; i < list.length; i++)
			{
				//delete that object, or reshape it.
				list[i].remove();
			}
			
		}
		
		
		/**
		 * user is dragging a resize hot spot
		 * @param {type} e
		 * @returns {undefined}
		 */
		var _sizedown = function (e) {
			//grow the dragspot
			//$(this).animate({width:32,height:32});//this is where snap would be nice
			dragging = this;
			e.stopPropagation();
			$(this).parent().css('opacity',0);
		}
		/**
		 * move both the drag spot, and the related corner
		 * @param {type} e
		 * @returns {undefined}
		 */
		var _sizemove = function (e) {
			if (dragging) {
				//current pts (incl offset and scale)
				var _offset = _svg.offset();
				var _scale = _pen.scale();
				var x = parseInt((e.pageX - _offset.left) / _scale),
						y = parseInt((e.pageY - _offset.top) / _scale);
				var origpts = $(dragging).data('origpts');
				points = origpts.split(",");
				var ptsstr = origpts.substr(0,1)+x+','+y;
				//find the original.
				var idval = $(dragging).data('origid');
				var orig = document.getElementById(idval);
				//replace that data with new pts
				var str = orig.getAttributeNS(null, 'd');
				var oldx = parseInt(points[0].substr(1)),
								oldy = parseInt(points[1]);
				str = str.replace(oldx+',',x+',');
				str = str.replace(oldx+',',x+',');//both corners
				str = str.replace(','+oldy,','+y);//just the one is nice, too
				str = str.replace(','+oldy,','+y);//drag each corner independantly
				orig.setAttributeNS(null, 'd', str);
				//replace our own data with new pts (including data-origpts)
				dragging.setAttributeNS(null, 'x', x);
				dragging.setAttributeNS(null, 'y', y);
				$(dragging).data('origpts', ptsstr);
				e.stopPropagation();
			}
		}
		var dragx = undefined;
		var dragy = undefined;
		var dragdrag = false;//can't re-use dragging
		var _dragboxstart = function (e) {
			dragdrag = this;
			dragx = e.pageX;
			dragy = e.pageY;
			$(this).parent().css('opacity',0);
			e.stopPropagation();
		}
		var _dragboxstop = function (e) {
			if (dragdrag) {
				var idval = $(dragdrag).data('origid');
				var orig = document.getElementById(idval);
				showdraggables(idval, orig.getAttributeNS(null, 'd'), orig.getAttributeNS(null, 'pen'));
				dragdrag = false;
				e.stopPropagation();
			}
		}
		var _dragbox = function (e) {
			if (dragdrag) {
				//need to get the offset, then apply that to all the coords in the path
				//and the other handles (or just kill them all)
				var _scale = _pen.scale();
				var xdiff = dragx - e.pageX;
				var ydiff = dragy - e.pageY;
				dragx = e.pageX;
				dragy = e.pageY;
				//alternately translate the object from its initial point.
				
				var _offset = _svg.offset();
				var x = parseInt((e.pageX - _offset.left) / _scale),
						y = parseInt((e.pageY - _offset.top) / _scale);
		
				var idval = $(dragdrag).data('origid');
				var orig = document.getElementById(idval);
				//replace that data with new pts
				var str = orig.getAttributeNS(null, 'd');
				var tokens = str.split(" ");
				var outstr = '';
				for (var i = 0, n = tokens.length; i < n; i++) {
					points = tokens[i].split(",");
					if (points.length == 2 //tokens[i] !== "M0,0L0,10000L10000,10000L10000,0Z" 
					//skip the weirdness for the mask. Or weirdness in general.
									&& points[1]) {
						outstr = outstr + points[0].substr(0,1) + (parseInt(points[0].substr(1))-xdiff) + ',' + (parseInt(points[1])-ydiff) + ' ';
					} else {
						outstr = outstr + tokens[i] + ' ';
					}
				}
				orig.setAttributeNS(null, 'd', outstr);
		
				this.setAttributeNS(null, 'x', x-8);
				this.setAttributeNS(null, 'y', y-8);
			}
			//e.stopPropagation();
		}
		var _sizeup = function (e) {
			//shrink the dragspot
			//$(this).animate({width:16,height:16});
			if (dragging) {
				var idval = $(dragging).data('origid');
				var orig = document.getElementById(idval);
				showdraggables(idval, orig.getAttributeNS(null, 'd'), orig.getAttributeNS(null, 'pen'));
				dragging=false;
				e.stopPropagation();
			}
		}
		
		createSVGstr = function(opts) {
			
			var str = '<path ';
			
			$.each(opts, function(k, v){
				str += k + "=\"" + v + "\" "; 
			});
			return str+ "></path>";
		}
		createSVGobj = function(opts) {
			var obj = document.createElementNS("http://www.w3.org/2000/svg", "path");
			$.each(opts, function(k, v){
				obj.setAttributeNS(null, k, v);
			});
			return obj;
		}
		var removeChilds = function (node) {
			var last;
			if (node) while (last = node.lastChild) node.removeChild(last);
		};
		
		movething = function(centerx, centery, idval,  tokensi) {
			
				var r = document.createElementNS("http://www.w3.org/2000/svg", "path");
					r.setAttributeNS(null, "fill", "#000000");//63 102 255
					r.setAttributeNS(null, "stroke", "#3F66FF");
					r.setAttributeNS(null, "stroke-width", "2");
					r.setAttributeNS(null, "style", "cursor:move");
					r.setAttributeNS(null, "data-origid", idval);
					r.setAttributeNS(null, "data-origpts", tokensi);
					r.setAttributeNS(null, "class", "yozo");
					r.setAttributeNS(null, "d", "M"+(centerx-15)+","+(centery-8)
									+" L"+(centerx-22)+","+(centery-0)
									+" L"+(centerx-15)+","+(centery+8)
					+" Z"
	+" M"+(centerx+15)+","+(centery-8)
									+" L"+(centerx+22)+","+(centery-0)
									+" L"+(centerx+15)+","+(centery+8)
					+" Z"
	+" M"+(centerx-8)+","+(centery-15)
									+" L"+(centerx-0)+","+(centery-22)
									+" L"+(centerx+8)+","+(centery-15)
					+" Z"
	+" M"+(centerx-8)+","+(centery+15)
									+" L"+(centerx-0)+","+(centery+22)
									+" L"+(centerx+8)+","+(centery+15)
					+" Z"
	+" M "+(centerx-8)+","+(centery)
	        +" a 4,4  0 1,0 16,0"
        +" a 4,4  0 1,0 -16,0"
									
								);
				return r
		}
		showdraggables = function(idval, path, pen) {
			//removeChilds(document.getElementById("selectors"));//Touchscreen can not hover
			
			var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
			g.setAttributeNS(null, "id", "selectorgroup" + idval);
			var tokens = path.split(" ");
			
			var minx = Infinity, maxx = 0, miny = Infinity, maxy = 0;
			for (var i = 0, n = tokens.length; i < n; i++) {
				points = tokens[i].split(",");
				if (points.length == 2) {
					var x = parseInt(points[0].substr(1));
					var y = parseInt(points[1]);
					maxx = Math.max(maxx, x);
					maxy = Math.max(maxy, y);
					minx = Math.min(minx, x);
					miny = Math.min(miny, y);
					//p0 may start with an M or L p1 may end with a Z, but parseint has no prob with that.
					var r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
					r.setAttributeNS(null, "width", "16");
					r.setAttributeNS(null, "height", "16");
					r.setAttributeNS(null, "fill", "#3F66FF");
					r.setAttributeNS(null, "stroke", "#3F66FF");
					r.setAttributeNS(null, "style", "cursor:cell");//there is no generic resize, this looks cool
					r.setAttributeNS(null, "x", (x-8));
					r.setAttributeNS(null, "y", (y-8));
					r.setAttributeNS(null, "data-origid", idval);
					r.setAttributeNS(null, "data-origpts", tokens[i]);
					r.setAttributeNS(null, "class", "drsz");
					g.appendChild(r);
				}
			}
			if (pen == 1) {
				//specifically the mask, because the middle of the spotlight is in the open space.
				var centerx = (maxx-minx) / 2 + minx;
				var centery = (maxy-miny) / 2 + miny;
				g.appendChild(movething(centerx, centery, idval, tokens[i]));
			}
			if (pen == 2) {
				//and they want the spotlight too.
				var centerx = (maxx-minx) / 2 + minx;
				var centery = miny - 32;
				g.appendChild(movething(centerx, y-32, idval, tokens[i]));
			}
			
			document.getElementById('selectors').appendChild(g);
		}
		
		

		self.editing = function(mode) {
			removeChilds(document.getElementById("selectors"));
			if (mode === undefined) {
				return _editing;
			}
			
			_editing = mode;
			if (_editing) {
				if (_editing == "erase") {
					$(_svg).off('mousedown',_drawdown);
					$(_svg).off('mousemove',_drawmove);
					$(_svg).off('mouseup',_drawup);
					$(_svg).off('mousedown','.drsz',_sizedown);
					$(_svg).off('mousedown','.yozo',_dragboxstart);
					//$(_svg).on('mousedown','.deletor',_del2click);
					$(_svg).off('mousemove',_dragbox);
					$(_svg).off('mouseup',_dragboxstop);
					$(_svg).off('mousemove',_sizemove);
					$(_svg).off('mouseup',_sizeup);
					
				$(_svg).on('click',_del3click);
				} else {
		
					$(_svg).on('mousedown',_drawdown);
					$(_svg).on('mousemove',_drawmove);
					$(_svg).on('mouseup',_drawup);
					$(_svg).on('mousedown','.drsz',_sizedown);
					$(_svg).on('mousedown','.yozo',_dragboxstart);
					//$(_svg).on('mousedown','.deletor',_del2click);
					$(_svg).on('mousemove',_dragbox);
					$(_svg).on('mouseup', _dragboxstop);
					$(_svg).on('mousemove',_sizemove);
					$(_svg).on('mouseup',_sizeup);
					
				$(_svg).off('click',_del3click);
				}
			} else {
				$(_svg).off('mousedown',_drawdown);
					$(_svg).off('mousemove',_drawmove);
					$(_svg).off('mouseup',_drawup);
					$(_svg).off('mousedown','.drsz',_sizedown);
					$(_svg).off('mousedown','.yozo',_dragboxstart);
					//$(_svg).on('mousedown','.deletor',_del2click);
					$(_svg).off('mousemove',_dragbox);
					$(_svg).off('mouseup',_dragboxstop);
					$(_svg).off('mousemove',_sizemove);
					$(_svg).off('mouseup',_sizeup);
					
					$(_svg).off('click',_del3click);
				
			}
			
			return self;
		}
		
		self.clear = function() {
			removeChilds(document.getElementById("drawlayer"));
			removeChilds(document.getElementById("templayer"));
			removeChilds(document.getElementById("selectors"));
		}
		
				
		self.mode = function(i) {
			_pen.mode(i);
			
			if (i > 0) {
				$('#drawlayer path.editable').each(function(i, obj) {
					showdraggables(obj.getAttributeNS(null, 'id'), obj.getAttributeNS(null, 'd'), obj.getAttributeNS(null, 'pen'));
				});
			}
			
			return self;
		}
		
	};
