WebCom.Components.Navigation.MenuOptions = function (_options) {
    var SPEED_FAST = 200, SPEED_SLOW = 600, SPEED_DEFAULT = 400;
    var options = _options;
    function isBlock() {
      return !(options && options.display && (/inline/i).test(options.display));
    }
    function isMultiLine() {
      return !(options && options.singleline);
    }
    function isFlyout () {
      return (options && options.type && (/flyout/i).test(options.type));
    }
    function isHorizontal () {
      return (options && options.orientation && (/horizontal/i).test(options.orientation));
    }
    function getWidth () {
      return (options && options.width) || "default";
    }
    function getHeight () {
      return (options && options.height) || "default";
    }
    /** getButtonWidth
     *    returns 100 for default instead of 'default' as
     *    button width HAS to be specified
     **/
    function getButtonWidth () {
      return (options && options.button && options.button.width) || 100; 
    }
    function getButtonHeight () {
      return (options && options.button && options.button.height) || "default";
    }    
    function getDirectionX () {
      return (options && options.direction &&  options.direction.x) || "right";
    }
    function getDirectionY () {
      return (options && options.direction && options.direction.y) || "down";
    }
    function getAnimationEffect() {
      return (options.animation && options.animation.effect ) || "none";
    }
    function returnSpeed(s) {
      var sn = parseInt(s);
      if (isNaN(sn)) {
        if ((/fast/i).test(s)) {
          sn = SPEED_FAST;
        }
        else if ((/slow/i).test(s)) {
          sn = SPEED_SLOW;
        }
        else {
          sn = SPEED_DEFAULT;
        }
      }
      return sn;
    }
    
    function getAnimationSpeed() {
      return returnSpeed((options.animation && options.animation.speed) || "default");
    }
    function getDelay() {
      return returnSpeed((options && options.delay) || "default");
    }    
    function getVerticalOffset () {
      if (options && options.position && (/number/i).test(typeof(options.position.offsetV))) {
        return options.position.offsetV;
      }
      return 0;
    }
    function getHorizontalOffset () {
      if (options && options.position && (/number/i).test(typeof(options.position.offsetH))) {
        return options.position.offsetH;
      }
      return 0;
    }
    function getOffsetReference() {
      return (options && options.position && options.position.reference) || "self";
    }
        
    this.isBlock = isBlock;
    this.isMultiLine = isMultiLine;
    this.isFlyout = isFlyout;
    this.isHorizontal = isHorizontal;
    this.getWidth = getWidth;
    this.getButtonWidth = getButtonWidth;
    this.getHeight = getHeight;
    this.getButtonHeight = getButtonHeight;
    this.getDirectionX = getDirectionX;
    this.getDirectionY = getDirectionY;
    this.getAnimationEffect = getAnimationEffect;
    this.getAnimationSpeed = getAnimationSpeed;
    this.getDelay  = getDelay;
    this.getVerticalOffset    = getVerticalOffset;
    this.getHorizontalOffset = getHorizontalOffset;
    this.getOffsetReference = getOffsetReference;
};

WebCom.Components.Navigation.NavigationOptions = function (_options) {
  var options = _options;
  if (typeof(options) == "undefined" || options == null) {
    options = { primary : {}, secondary : {} };
  }
  else {
    if (!options.primary) {
      options.primary = {};
    }
    if (!options.secondary) {
      options.secondary = {}; 
    }
  }

  function getMenuOptions(level) {
    return  new WebCom.Components.Navigation.MenuOptions((level == 1) ? options.primary : options.secondary);
  }

  function getMenuDecorationOptions (/*int*/ level) {
    var NavOptions = (level == 1) ? options.primary : options.secondary;
    return _getDecorationOptions(NavOptions.decoration);
  }    
  function getButtonDecorationOptions(/*int*/ level) {
    var NavOptions = (level == 1) ? options.primary : options.secondary;
    return _getDecorationOptions(NavOptions.button);
  }

  function _getDecorationOptions (buttonConfig) {
    var btnOptions = [];
    btnOptions.push ('middle'); //always present

    if (buttonConfig && buttonConfig.middleDecoration) {
      var middleDecoration = buttonConfig.middleDecoration;
      if (middleDecoration.indexOf("right") != -1) {
        btnOptions.push ('middle-right'); 
      }

      if (middleDecoration.indexOf("left") != -1) {
        btnOptions.push ('middle-left'); 
      }

      if (middleDecoration.indexOf("top") != -1) {
        btnOptions.push ('middle-top'); 
      }

      if (middleDecoration.indexOf("bottom") != -1) {
        btnOptions.push ('middle-bottom'); 
      }
    }

    var vstretch = buttonConfig && buttonConfig.stretch && buttonConfig.stretch.indexOf("vertical") != -1;
    var hstretch = buttonConfig && buttonConfig.stretch && buttonConfig.stretch.indexOf("horizontal") != -1;    
    if (!hstretch && vstretch)  {
      btnOptions.push ('top','bottom','left','right');
    } else if (!vstretch && hstretch) {
      btnOptions.push ('left','right','top','bottom');        
    } else if (vstretch && hstretch) {
      btnOptions.push ('bottom-right', 'bottom-left', 'top-right', 'top-left', 'right', 'left', 'bottom', 'top');
    }
    return btnOptions;
  }

  this.getMenuOptions = getMenuOptions;
  this.getButtonDecorationOptions = getButtonDecorationOptions;
  this.getMenuDecorationOptions = getMenuDecorationOptions;    
};
  
WebCom.Components.Navigation.MenuUtil = {
  decorateMenu: function (/*JQueryElement*/ menu, /**/ options, level) {
    var menuOptions = options.getMenuDecorationOptions(level);
    var prefix = ((level == 1) ? 'primary-' : 'secondary-')  + 'webcomMenu-';
    // move out secondary from the rendering now,
    // saves processing time on navigation load
    var styleAttr = (level == 1) ? '' : 'style="position:absolute;top:-100000px;left:-10000px"';
    var menuBefore = '<div class="' + prefix + 'offset" ' + styleAttr + '>', menuAfter = '</div>';
    // set z-index
    menuBefore += '<div class="' + prefix + menuOptions[menuOptions.length-1] + '" style="z-index:2001">';
    menuAfter += '</div>';
    
    for (var i = menuOptions.length-2; i>=0; i--)  {
      menuBefore += '<div class="' + prefix + menuOptions[i] + '" >';
      menuAfter += '</div>';
    }
    menu.wrap(menuBefore + menuAfter);
    menuOptions = null;
  }
};

WebCom.Components.Navigation.ButtonUtil = {
  decorateButton: function (/*DomElement*/ button, /**/ options, level) {
    var btnOptions = options.getButtonDecorationOptions(level);
    var prefix = ((level == 1) ? "primary-" : "secondary-") + "webcomMenuItem";

    jQuery(button).addClass(prefix).children("a").each( function() { 
      var $a = jQuery(this);
      //$a.addClass(prefix + "-label");
      var buttonBefore = "", buttonAfter = "";
      for (var i=0; i<btnOptions.length; i++) {
        buttonBefore = '<div class="' + prefix + '-' + btnOptions[i] + '">' + buttonBefore;
        buttonAfter += '</div>';          
      } 
      $a.html(buttonBefore + $a.html() + buttonAfter);
    });
    btnOptions = null;
  }
};