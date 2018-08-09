WebCom.Components.Navigation = {
  init : function (options) {
    if (jQuery.browser.msie && (/MSIE 6.0/i).test(navigator.userAgent)) {
      try {
        document.execCommand('BackgroundImageCache', false, true);
      } catch(e) {}
    }
    for (navId in options) {
      if ((/string/i).test(typeof(navId))) {
        jQuery("#"+navId).webcomNavigation(options[navId]);
      }
    }
  }
};

function console_log(text) {
  try {
    console.log(text);
  } catch(e) {
    text = jQuery('#logger').html() + ' <br>' + text;
    jQuery('#logger').html(text);
  }
}

(function($){
  $.webcomNavigation = {
    active : null,
    navOptions : null,
    optionsHash : {},
    hoverClass : 'hover',
    isFlyout : true,
    isBlockDisplay: true,
    hasMovies : true, 
    hasSelect : false,
    ieVersion : -1,
    ffVersion : -1,
    
    isIE6 : function() {
      if (this.ieVersion == -1) {
        this.ieVersion = ($.browser.msie) ? $.browser.version : 0;
      }
      return (/6/.test(this.ieVersion));
    },
    
    isFF2 : function() {
      if (this.ffVersion == -1) {
        this.ffVersion = ($.browser.mozilla) ? $.browser.version : 0;
      }
      return this.ffVersion && !(/1\.9/.test(this.ffVersion));
    },
		
    addCurrentOptions : function(id, options) {
      this.optionsHash[id] = options;
      this.setCurrentOptions(id);
    },

    setCurrentOptions : function(id) {
      this.navOptions = new WebCom.Components.Navigation.NavigationOptions(this.optionsHash[id]); 
    },
		
    getSFOptions : function() {
      var self = this;
      return {
        hoverClass : self.hoverClass,
                
        onBeforeShow : function() { 
          var o = $.superfish.op;
          var primaryUl = this;
          var level = self.getLevel(this);
          var prefix = (level == 1) ? "primary-" : "secondary-";
          if  (!self.isPrimary(this)) {
            primaryUl = this.parents("ul.primary-webcomMenu");
          }
          self.setCurrentOptions(primaryUl.parents("div[class='primary-webcomMenu-offset']").parent("div").attr("id"));

          var anim = self.getAnimationParams(level, this);
          o.speed = anim.speed;
          o.delay = anim.delay;
          o.animation = anim.animation;
          if (this.length > 0) {
            try {
              var options = self.navOptions.getMenuOptions(level);
              var parentOptions = self.navOptions.getMenuOptions(level-1);
							
              if (self.isFlyout) {
                if (self.hasSelect) {
                  $('select').blur();
                }
                WebCom.Components.Navigation.Positioner.update(this, options, parentOptions, self.isFF2());
                self.enableMovies(false);
              }
              else {
                this.parents("li:first").find("div[class^='" + prefix + "webcomMenu-']:first").css({ position : "relative", float : "left", top: "0px", left : "0px" });
              }
              this.parents('.secondary-webcomMenu-offset').show();
            }
            catch (e) {
              alert(e);
            }
          }
        },
                
        onHide : function() {
         this.each(function() {
           var elem = $(this).parents("li:first").find("div[class*='webcomMenu-']:first")[0];
           if (elem.style.top != "-100000px") {
             self.enableMovies(true);
           }
           elem.style.position = "absolute";
           elem.style.top = "-100000px";
           elem.style.left = "-100000px";
         });
        }
      };
    },

    updateRootDecorator : function(navNode, callback) {
      var menu = $(navNode);
      menu.parents("div[class*='webcomMenu-offset']:first").children("div[class*='webcomMenu-']").each(function() { callback($(this), menu); });
    },
        
    getAnimationParams : function (level, menu) {
      var options = this.navOptions.getMenuOptions(level);
      var d = options.getDelay();
      var s = options.getAnimationSpeed();
      var e = options.getAnimationEffect();
      var params = { speed : s, delay : d };
      if (e == "fade") {
        params['animation'] = { opacity: "show" };
      }
      else if (e == "slide") {
        if (options.isHorizontal()) {
          params['animation'] =  { width: "show" };
        }
        else {
          params['animation'] =  { height: "show" };
        }
			
        params["speed"] = s * menu.children("li").length;
      }
      else if (e == "show") {
        params['animation'] =  { height: "show", width: "show", opacity: "show" };
      } 
      else {
        params['animation'] = { opacity: "show" };
        params['speed'] = 1;
      }
      return params;
    },
    
    
    // calculate button height (max height of the items with wrapped text)
    normalizeHeight : function(navElem, options) {
      var self = this;
      var maxDMH = 0;
      var maxLiH = 0;
      var dist = { isSet: false, height : -1 };
      
      var bHeight = options.getButtonHeight();
      var hasHeight = !((/default/i).test(bHeight));
      var maxHeight = 0;
          
      var level = this.getLevel(navElem);
      var prefix = (level == 1) ? "primary-" : "secondary-";      
      var lis = navElem.children("li");
      lis.each(function() {
        var dm = $("div[class='" + prefix + "webcomMenuItem-middle']", this);
        var tmpH = dm.height();
        if (tmpH > maxDMH) {
          maxDMH = tmpH;
        }
        tmpH = $(this).height();
        if (tmpH > maxLiH) {
          maxLiH = tmpH;
        }
        if (hasHeight && !dist.isSet) {
          dist.isSet = true;
          dist.height = 0;
          $(this).find("div[class*='" + prefix + "webcomMenuItem-']").each(function() {
            var style = self.getCurrentStyle(this);
            var mt = parseInt(style.marginTop);
            var mb = parseInt(style.marginBottom);
            var pt = parseInt(style.paddingTop);
            var pb = parseInt(style.paddingBottom);
            dist.height += (isNaN(mt)? 0 : mt)  + (isNaN(mb)? 0 : mb) + (isNaN(pt)? 0 : pt) + (isNaN(pb)? 0 : pb);
          });
        }
      });
      
      var diff = 0;
      
      if (hasHeight) {
        if ((/auto/i).test(bHeight)) {
          bHeight = maxLiH;
        }
        maxHeight = bHeight - dist.height;
        if (maxDMH != maxHeight) {
          diff = maxDMH - maxHeight;
        }
      }
      else {
        bHeight = maxLiH;   
      }

      // set item height
      // also set padding for text so it keeps it in the middle vertically
      var xt = 0, xb = 0;
      lis.each(function() {
        $(this).height(bHeight);
        
        if (hasHeight) {
          $(this).find("div[class*='" + prefix + "webcomMenuItem-']").each(function() {
            var elem = $(this);
            var name = elem.attr("class");
            if ((prefix + "webcomMenuItem-middle") == name) {
              var style = self.getCurrentStyle(this);  
              var padding = 0;
              var tmpH = elem.height();
              
              if (tmpH != maxDMH || diff != 0) {
                padding = (maxDMH - tmpH - diff)/2;
                if (padding < 0) {
                  padding = 0;
                }
              }              
              
              xt = padding + parseInt(style.paddingTop);
              xb = padding + parseInt(style.paddingBottom);
              
              this.style.paddingTop = xt + "px";
              this.style.paddingBottom = xb + "px";
              if (self.isIE6()) {
                this.style.height = (maxHeight-padding*2) + "px"; 
              }
              else {
                this.style.height = maxHeight + "px"; 
              }
            }
            else {
              elem.height(bHeight);  
            }
          });
        }
        else {
          var dm = $("div[class='" + prefix + "webcomMenuItem-middle']:first", this);
          tmpH = dm.height();
          var style = self.getCurrentStyle(dm[0]);
          
          if (tmpH < maxDMH) {
            xt = (maxDMH - tmpH)/2 + parseInt(style.paddingTop);
            xb = (maxDMH - tmpH)/2 + parseInt(style.paddingBottom);
            dm[0].style.paddingTop = xt + "px";
            dm[0].style.paddingBottom = xb + "px";
          }
        }
      });
    },
        
    isPrimary : function(navElem) {
      return navElem.hasClass("primary-webcomMenu");
    },
		
    getLevel : function (navElem) {
      return this.isPrimary(navElem) ? 1 : 2;
    },
        
    getCurrentStyle : function(elem) {
      return (document.defaultView) ? document.defaultView.getComputedStyle(elem, null) : elem.currentStyle;
    },
    
    calcSetButtonSize : function(navElem, options) {
      var self = this;
      var bWidth = options.getButtonWidth();
      var bHeight = options.getButtonHeight();
      var css = {};
      var dist = { isSet: false, width : -1 };

      navElem.children("li").each(function() {
        var li = $(this);
        var item = li.children("a");
        var dm = $("div[class$='webcomMenuItem-middle']", item);
        
        // IE bugfix for width
        if (!dist.isSet) {
          dist.isSet = true;
          dist.width = 0;
          dist.height = 0;
          item.find("div[class*='webcomMenuItem-']").each(function() {
            var style = self.getCurrentStyle(this);
            
            var ml = parseInt(style.marginLeft);
            var mr = parseInt(style.marginRight);
            var pr = parseInt(style.paddingRight);
            var pl = parseInt(style.paddingLeft);
            dist.width += (isNaN(ml)? 0 : ml)  + (isNaN(mr)? 0 : mr) + (isNaN(pl)? 0 : pl) + (isNaN(pr)? 0 : pr);
          });
          
          css["width"] = (bWidth - dist.width)+"px";
        }
        
        dm.eq(0).css('width', css["width"]);
        li.eq(0).css('width', bWidth+"px");
      });
    },
    
    checkRemoveExtraItems : function (navElem, options) {
      var width = options.getWidth();
      var bWidth = options.getButtonWidth();
      if ((/default|auto/i).test(width)) {
        width = navElem.width();
      }
      var visibleItems = width/bWidth;
      if (!isNaN(visibleItems)) {
        visibleItems = Math.floor(visibleItems) - 1; // index starts at 0
        navElem.children("li:gt(" + visibleItems + ")").remove();
      }
    },
    
    initLevel : function(navNode) {
      var navElem = $(navNode);
      var level = this.getLevel(navElem);
      var options = this.navOptions.getMenuOptions(level);
      var width = options.getWidth();
      var height = options.getHeight();
      if (options.isHorizontal()) {
        if (!options.isMultiLine()) {
          this.checkRemoveExtraItems(navElem, options);
        }
        this.calcSetButtonSize(navElem, options);
        if ((/default/i).test(width)) {
          width = navElem.width();
        }
        navElem.css("width", ((/auto/i).test(width)) ? width : width+"px");
        if ((/default/i).test(height)) {
          height = navElem.height();
        }
        navElem.css("height", ((/auto/i).test(height)) ? height : height+"px");
        this.normalizeHeight(navElem, options);
      }  
      else {
        this.calcSetButtonSize(navElem, options);
        if (!(/default/i).test(height)) {
          navElem[0].style.height = ((/auto/i).test(height)) ? height : height+"px";
        }
        if ((/default/i).test(width)) {
          width = options.getButtonWidth();
        }
        navElem[0].style.width = ((/auto/i).test(width)) ? width : width+"px";
        if (!(/default/i).test(options.getButtonHeight())) {
          this.normalizeHeight(navElem, options);
        }
      }
      return level;
    },
        
    initButtons : function (menu) {
      var self = this;
      menu.find("li").each( function() {
        var level = self.getLevel($(this).parent("ul"));
        WebCom.Components.Navigation.ButtonUtil.decorateButton(this, self.navOptions, level);
      });
      WebCom.Components.Navigation.MenuUtil.decorateMenu($(".secondary-webcomMenu", menu), self.navOptions, 2);
      WebCom.Components.Navigation.MenuUtil.decorateMenu(menu, self.navOptions, 1);
    },
    
    initMainMenu : function (menu) {
      var level = this.getLevel(menu);
      var options = this.navOptions.getMenuOptions(level);
      this.isBlockDisplay = options.isBlock();
      this.initLevel(menu);
      this.updateRootDecorator(menu, function(decorator, menu) {
          if (!(/absolute|relative/i).test(decorator.css("position"))) {
            decorator.css({ position : "relative", left : "0px", top: "0px"});
          }
      });
      function removeAnimationCss() {        
        var navElem = $(menu);
        if (options.isHorizontal()) {
          if ((/default/i).test(options.getWidth())) {
            navElem.css("width", "");
          }
        }
        if ((/default/i).test(options.getHeight())) {
          navElem.css("height", "");
        }
      }
      var effect = options.getAnimationEffect() ;
      if (effect != "none") {
        var params = this.getAnimationParams(level, $(menu));
        $("ul.primary-webcomMenu").css("display","none").animate(params.animation,params.speed, removeAnimationCss);
      }
      else {
        removeAnimationCss();
      }
    },
    
    initSecondaryMenus : function (navMenu) {
      var self = this;
      $("ul.secondary-webcomMenu", navMenu).each(function() {
        self.initLevel(this);
      });      
    },
    
    initSelectedElements : function (navMenu) {
      $("li.selected", navMenu).parents("li[class*='webcomMenuItem']").addClass("selected");
    },
    
    enableMovies : function(isVisible) {
      var self = this;
      if (this.hasMovies) {
        this.hasMovies = false;
        $("object[classid]").each(function() {
          var elem = $(this);
          var val = elem.attr("classid");
          if ((/clsid:6bf52a52-394a-11d3-b153-00c04f79faa6/i).test(val) ||
              (/clsid:22d6f312-b0f6-11d0-94ab-0080c74c7e95/i).test(val) ||
              (/clsid:05589fa1-c356-11ce-bf01-00aa0055595a/i).test(val) ||
              (/clsid:02bf25d5-8c17-4b23-bc80-d3488abddc6b/i).test(val) ||
              (/clsid:cfcdaa03-8be4-11cf-b84b-0020afbbccfa/i).test(val)) {
                elem.css("visibility", isVisible ? "visible" : "hidden");
                self.hasMovies = true;
          }
        });
      }
    },
    
    init : function (navMenu, elem, id) { 
      this.initButtons(navMenu); 
      this.isFlyout = this.navOptions.getMenuOptions(2).isFlyout();
      this.initSecondaryMenus(navMenu);
      this.initMainMenu(navMenu);
      navMenu.parents("div[id="+ id + "]").css("visibility", "visible");
      if (this.isBlockDisplay) {
        elem.after("<div style='clear:both'></div>");
      }
      this.initSelectedElements(navMenu);
      this.hasSelect = $("select").length > 0 ? true : false;
    },

    render : function(elem, options) {
      var self = this;
      var id = elem.attr("id");
      self.addCurrentOptions(id, options);
      return $(".primary-webcomMenu", elem).each(function() {
        var menu = $(this);
        self.init(menu, elem, id);
        $(".primary-webcomMenu", elem).superfish(self.getSFOptions())
          .find(">li:has(ul)").mouseover(function(){
            $("div[class='secondary-webcomMenu-offset']", this).bgIframe({opacity:true, src:''});
          });
      });
    }
  };
    
  $.fn.webcomNavigation  = function(options) {
    var nav =  $.webcomNavigation;
    return nav.render(this, options);
  };
})(jQuery);
