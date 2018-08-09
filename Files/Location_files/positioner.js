WebCom.Components.Navigation.Positioner  = {
  positions : null,
  wndWidth : 0,
  wndHeight : 0,
  options : null,
  parentOptions : null,

  root : null,
  subRoot : null,
  parentLi : null,

  rootPos : null,
  parentLiPos : null,
  rootBox : null,
  parentLiBox : null,
  subRootBox : null,
  
  reX: null,
  reY : null,
	
  release : function() {
    this.options = null;
    this.parentOptions = null;
    this.subRoot = null;
    this.parentLi = null;
    this.root = null;
    this.rootPos = null;
    this.parentLiPos = null;
    
    this.rootBox = null;
    this.parentLiBox = null;
    this.subRootBox = null;
    
    this.reX = null;
    this.reY = null;
    for (i=0; i < this.positions.length; i++) {
      this.positions[i] = null;
    }
    this.positions = null;
  },
	
  init : function(subNav, options, parentOptions) {
    this.options = options;
    this.parentOptions = parentOptions;
		
    this.subRoot = this.findRoot(subNav);
    
    this.parentLi = subNav.parents("li");
    this.parentLiPos = this.parentLi.offset();
    
    if (this.subRoot == null) 
      throw { err: "InvalidMenu" };

    this.root = this.findRoot(subNav.parents("ul[class*='webcomMenu']:first"));

    if (this.root == null) 
      throw { err: "InvalidMenu" };
	
    this.rootPos = this.root.offset();
    
    this.wndWidth = jQuery(window).width();
    this.wndHeight = jQuery(window).height();
		
    this.reX = new RegExp(this.getDirectionX() + "|any", "i");
    this.reY = new RegExp(this.getDirectionY()+ "|any", "i");
		
    this.positions = [];
    this.isOffsetFromParent = this.isOffsetReferenceFromParent();
    
    this.rootBox = { width : this.root.width(), height : this.root.height() };
    this.parentLiBox = { width : this.parentLi.width(), height : this.parentLi.height() };
    this.subRootBox = { width : this.subRoot.width(), height : this.subRoot.height() };
  },
		
  update : function (subNav, options, parentOptions, isFF2) {
    try {
      this.init(subNav, options, parentOptions);
      this.calculatePositions();
      
      var width = this.subRootBox.width;
      var height = this.subRootBox.height;
      
      var newPos = this.getNewPos();
      if (isFF2) {
        this.subRoot.css({ position: "relative", top: "0px", left: "0px", width : width + "px", height: height + "px"});
        this.subRoot.parent().css({ display: "none", position: "absolute", top: newPos.top+"px", left: newPos.left+"px", padding : newPos.padding.toString(), width : width + "px", height: height + "px" });
      }
      else {
        this.subRoot.css({ position: "relative", top: "0px", left: "0px"});
        this.subRoot.parent().css({ display: "none", position: "absolute", top: newPos.top+"px", left: newPos.left+"px", padding : newPos.padding.toString()});        
      }
     
      /*
      console_log("...................");
      console_log("newPos.left:" + newPos.left + ";newPos.top:" + newPos.top);
      console_log("subRoot.left:" + this.subRoot.offset().left + ";subRoot.top:" + this.subRoot.offset().top);
      console_log("subRoot.height:" + this.subRoot.height() + ";subRoot.width:" + this.subRoot.width());
      console_log("subRoot.oheight:" + this.subRoot.outerHeight() + ";subRoot.owidth:" + this.subRoot.outerWidth());
	  
      console_log("............................................................................");
      console_log("root.height:" + this.root.height() + ";root.width:" + this.root.width());      
      console_log("rootBox.height:" + this.rootBox.height + ";rootBox.width:" + this.rootBox.width);

      console_log("parentLi.height:" + this.parentLi.height() + ";parentLi.width:" + this.parentLi.width());      
      console_log("parentLiBox.height:" + this.parentLiBox.height + ";parentLiBox.width:" + this.parentLiBox.width);

      console_log("subRoot.height:" + this.subRoot.height() + ";subRoot.width:" + this.subRoot.width());      
      console_log("subRootBox.height:" + this.subRootBox.height + ";subRootBox.width:" + this.subRootBox.width);

      console_log("li.left:" + this.parentLiPos.left + ";li.top:" + this.parentLiPos.top);
      console_log("li.left:" + this.parentLi.offset().left + ";li.top:" + this.parentLi.offset().top);
      
      console_log("root.left:" + this.rootPos.left + ";li.top:" + this.rootPos.top);
      console_log("root.left:" + this.root.offset().left + ";li.top:" + this.root.offset().top);

      console_log("---------------------------------");
      console_log("root.padding-top:" + parseInt(this.root.css("padding-top")) + ";root.padding-bottom:" + parseInt(this.root.css("padding-bottom")));
      console_log("subRoot.padding-top:" + parseInt(this.subRoot.css("padding-top")) + ";subRoot.padding-bottom:" + parseInt(this.subRoot.css("padding-bottom")));
      console_log("subroot.css.left:" + this.subRoot.css("left") + ";subroot.css.top:" + this.subRoot.css("top"));
      console_log("subroot.css.position:" + this.subRoot.css("position"));
      console_log("...................");
      /**/	
      
      this.release();
    }
    catch (e) {
      var msg =  (e.err) ? e.err :  e;
      alert(msg);
    }		
  },
	
  calculatePositions : function() {
    if (this.isParentHorizontal()) {
      if (this.isHorizontal()) {
        this.calculateHorizHoriz();
      }
      else {
        this.calculateHorizVert();
      }
    }
    else {
      if (this.isHorizontal()) {
        this.calculateVertHoriz();
      }
      else {
        this.calculateVertVert();
      }		
    }
  },
		
  getDirectionX : function() {
    return this.options.getDirectionX();
  },
    
  getDirectionY : function() {
    return this.options.getDirectionY();
  },
    
  getVerticalOffset : function() {
    return parseInt(this.options.getVerticalOffset());
  },
  
  getHorizontalOffset : function() {
    return parseInt(this.options.getHorizontalOffset());
  },

  isOffsetReferenceFromParent : function() {
    return ((/parent/i).test(this.options.getOffsetReference()));
  },
        
  isHorizontal : function () {
    return this.options.isHorizontal();
  },
    
  isParentHorizontal : function() {
    return this.parentOptions.isHorizontal();
  },
	
  findRoot : function(menu) {
    var p = menu.parent("div[class*='webcomMenu-']");
    var $d = null;
    while (p.length > 0) {
      $d = p;
      p = p.parent("div[class*='webcomMenu-']:not([class*='webcomMenu-offset'])");
    }
    return $d;
  },
	
  fitVertical : function (pos) {
    if (pos.top < 0) {
      return  (this.rootPos.top + pos.top >= 0);
    }
    return ((this.rootPos.top + pos.top + this.subRootBox.height) <= this.wndHeight);
  },
	
  fitHorizontal : function (pos) {
    if (pos.left < 0) {
      return  (this.rootPos.left + pos.left >= 0);
    }	
    return ((this.rootPos.left + pos.left + this.subRootBox.width) <= this.wndWidth) ;
  },
	
  addPosition : function(pos) {
    if (this.fitHorizontal(pos) && this.fitVertical(pos)) {
      pos.fit = true;
    }
    if ( this.reX.test(pos.x)) {
      pos.priority++;
    }
    if ( this.reY.test(pos.y)) {
      pos.priority++;
    }
    this.positions.push(pos);	
  },

  getPaddingObject : function(t, r, b, l) {
    return { 
      top : t, right:r, bottom : b, left: l,
      toString : function() {
        return t + "px " + r + "px " + b + "px " + l + "px ";
      }
    };
  },
  
  getPosObject : function(l, t, x, y, p) {
    return { left : l, top : t, fit : false, x: x, y : y, priority : 0, padding: p };
  },
	
  calculateHorizHoriz : function () {
    var topBottom = 0, topTop = 0;
    var hOffset = this.getHorizontalOffset();
    var vOffset = this.getVerticalOffset();
    var paddingHoriz = (hOffset > 0) ? hOffset : 0;
    var paddingVert = (vOffset > 0) ? vOffset : 0;
    
    if (this.isOffsetFromParent) {
      topTop = - vOffset;
      topBottom = (vOffset < 0) ? vOffset : 0;
    }
    else {
      var topOffset = this.parentLiPos.top  - this.rootPos.top;
      topTop = topOffset - (this.subRootBox.height + vOffset);
      topBottom = topOffset + this.parentLiBox.height + ((vOffset < 0) ? vOffset : 0);
    }

    var leftOffset = this.parentLiPos.left - this.rootPos.left;
    var leftRight = leftOffset + ((hOffset < 0) ? hOffset : 0);
    var leftLeft =  leftOffset + this.parentLiBox.width - this.subRootBox.width  - hOffset;
    
    // Top Right
    this.addPosition(this.getPosObject(leftRight, topTop, 'right', 'up', this.getPaddingObject(0, 0, paddingVert, paddingHoriz)));
    // Top Left
    this.addPosition(this.getPosObject(leftLeft, topTop, 'left', 'up', this.getPaddingObject(0, paddingHoriz, paddingVert, 0)));
    // Bottom Right
    this.addPosition(this.getPosObject(leftRight, topBottom, 'right', 'down', this.getPaddingObject(paddingVert, 0, 0, paddingHoriz)));
    // Bottom Left
    this.addPosition(this.getPosObject(leftLeft, topBottom, 'left', 'down', this.getPaddingObject(paddingVert, paddingHoriz, 0, 0)));
  },
	
  calculateHorizVert : function () {
    var topTop = 0, topBottom = 0;
    var hOffset = this.getHorizontalOffset();
    var vOffset = this.getVerticalOffset();
    var paddingHoriz = (hOffset > 0) ? hOffset : 0;
    var paddingVert = (vOffset > 0) ? vOffset : 0;
    
    if (this.isOffsetFromParent) {
      topTop = - vOffset;
      topBottom = (vOffset < 0) ? vOffset : 0;      
    }
    else {
      var topOffset = this.parentLiPos.top  - this.rootPos.top;
      topTop = topOffset - (this.subRootBox.height + vOffset);
      topBottom = topOffset + this.parentLiBox.height + ((vOffset < 0) ? vOffset : 0);
    }
    var leftOffset = this.parentLiPos.left - this.rootPos.left;
    var leftRight = leftOffset + ((hOffset < 0) ? hOffset : 0);
    var leftLeft = leftOffset - hOffset;
    
    // Top Right
    this.addPosition(this.getPosObject(leftRight, topTop, 'right', 'up', this.getPaddingObject(0, 0, paddingVert, paddingHoriz)));
    // Top Left
    this.addPosition(this.getPosObject(leftLeft, topTop, 'left', 'up', this.getPaddingObject(0, paddingHoriz, paddingVert, 0)));
    // Bottom Right
    this.addPosition(this.getPosObject(leftRight, topBottom, 'right', 'down', this.getPaddingObject(paddingVert, 0, 0, paddingHoriz)));
    // Bottom Left
    this.addPosition(this.getPosObject(leftLeft, topBottom, 'left', 'down', this.getPaddingObject(paddingVert, paddingHoriz, 0, 0)));
  },

  calculateVertHoriz : function () {
    var leftRight = 0, leftLeft = 0;
    var hOffset = this.getHorizontalOffset();
    var vOffset = this.getVerticalOffset();
    var paddingHoriz = (hOffset > 0) ? hOffset : 0;
    var paddingVert = (vOffset > 0) ? vOffset : 0;
    
    if (this.isOffsetFromParent) {
      leftRight = (hOffset < 0) ? hOffset : 0;
      leftLeft = - hOffset;
    }
    else {
      var leftOffset = this.parentLiPos.left  - this.rootPos.left;
      leftRight = leftOffset + this.parentLiBox.width + ((hOffset < 0) ? hOffset : 0);
      leftLeft =  leftOffset - this.subRootBox.width - hOffset;
    }
    var topOffset = this.parentLiPos.top - this.rootPos.top;
    var topTop = topOffset - vOffset;
    var topBottom = topOffset + ((vOffset < 0) ? vOffset : 0);
    
    // Top Right
    this.addPosition(this.getPosObject(leftRight, topTop, 'right', 'up', this.getPaddingObject(0, 0, paddingVert, paddingHoriz)));
    // Bottom Right
    this.addPosition(this.getPosObject(leftRight, topBottom, 'right', 'down', this.getPaddingObject(paddingVert, 0, 0, paddingHoriz)));
    // Top Left
    this.addPosition(this.getPosObject(leftLeft, topTop, 'left', 'up', this.getPaddingObject(0, paddingHoriz, paddingVert, 0)));
    // Bottom Left
    this.addPosition(this.getPosObject(leftLeft, topBottom, 'left', 'down', this.getPaddingObject(paddingVert, paddingHoriz, 0, 0)));
  },

  calculateVertVert : function () {
    var leftRight = 0, leftLeft = 0;
    var hOffset = this.getHorizontalOffset();
    var vOffset = this.getVerticalOffset();
    var paddingHoriz = (hOffset > 0) ? hOffset : 0;
    var paddingVert = (vOffset > 0) ? vOffset : 0;
    
    if (this.isOffsetFromParent) {
      leftRight = (hOffset < 0) ? hOffset : 0;
      leftLeft = - hOffset;
    }
    else {
      var leftOffset = this.parentLiPos.left  - this.rootPos.left;
      leftRight = leftOffset + this.parentLiBox.width + ((hOffset < 0) ? hOffset : 0);
      leftLeft =  leftOffset - this.subRootBox.width - hOffset;
    }
    var topOffset = this.parentLiPos.top - this.rootPos.top;
    var topBottom = topOffset + ((vOffset < 0) ? vOffset : 0);    
    var topTop = topOffset + this.parentLiBox.height - this.subRootBox.height - vOffset;
   
    // Top Right
    this.addPosition(this.getPosObject(leftRight, topTop, 'right', 'up', this.getPaddingObject(0, 0, paddingVert, paddingHoriz)));
    // Top Left
    this.addPosition(this.getPosObject(leftLeft, topTop, 'left', 'up', this.getPaddingObject(0, paddingHoriz, paddingVert, 0)));
    // Bottom Right  
    this.addPosition(this.getPosObject(leftRight, topBottom, 'right', 'down', this.getPaddingObject(paddingVert, 0, 0, paddingHoriz)));
    // Bottom Left
    this.addPosition(this.getPosObject(leftLeft, topBottom, 'left', 'down', this.getPaddingObject(paddingVert, paddingHoriz, 0, 0)));
  },
	
  getNewPos : function() {
    var choice = null;
    var fit = null;
    for (var i=0;i<this.positions.length;i++) {
      if (this.positions[i].priority == 2) {
        choice = this.positions[i];
      }
      else if (this.positions[i].fit && (fit == null || this.positions[i].priority > fit.priority)) {
        fit = this.positions[i];
      }
    }
    if  (choice == null) {
      throw { err : 'No direction selected!' };
    }
    // if choice doesn't fit use the first element which fits. If no element fit, just return choice as is
    return (!choice.fit && fit != null) ? fit : choice;
  }
};
