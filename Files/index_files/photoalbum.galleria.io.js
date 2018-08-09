function WebCom_Components_PhotoAlbumGalleriaIo(lib){
    
  WebCom.Components.Component.apply(this, [lib]);
  
  var self = this;
  this.galleria = null;
       
  this.init = function(id, config){
    self.id = id;
    self.isDelayed = config.isDelayed;
    self.renderMode = config.miscData.renderMode;
    self.onCompleteCallback = config.miscData.onCompleteCallback || null;
    
    self.galleryOptions = config.componentData.settings || {};
    
    self.theme = config.componentData.theme;
    
    self.galleryOptions['debug'] = false; // to improve the performance
    self.galleryOptions['trueFullscreen'] = false, // 1.2.7
    self.galleryOptions['autoplay'] = self.getAutoplay(self.galleryOptions['isAutoplay'],self.galleryOptions['delay']);
    delete self.galleryOptions['isAutoplay']; 
    self.galleryOptions['showImagenav'] = self.galleryOptions['hasNavigation'];
    delete self.galleryOptions['hasNavigation']; 
    
    self.galleryOptions.data_source = [];
    var compData = null, i = 0, layerHtml = null;

    /* data used to manage the facebook buttons in the galleria */
    self.imageLikeShareArray = new Array();
    self.isAlbumShareSelected = false;
    self.isAlbumLikeSelected = false;
    self.isAnyImgLikeSelected = false;
    self.isAnyImgShareSelected = false;

    self.likeButtonUrl = config.componentData.likeButtonUrl;

    /* tiles doenst rotate through the images, so need to capture an image level url */
    self.firstImgLikeButtonUrl = ''; 

    var ts = new Date().getTime();

    self.isAlbumLikeSelected = (config.componentData.hasLike == true);
    self.isAlbumShareSelected = (config.componentData.hasShare == true);
    
    while (config.componentData['image_' + i]) {
        var img = {};
        compData = config.componentData['image_' + i];
        jQuery.extend(true, img, compData);
      
        if(self.isAlbumShareSelected == false || self.isAlbumLikeSelected == false){
          //perform page level checks for like and share  
          var isImgShareSelected = false, isImgLikeSelected = false;
          if (img.hasShare == true || img.hasLike == true) {
             var imgTrack = {
                index:i,
                hasShare:img.hasShare,
                hasLike:img.hasLike,
                likeButtonUrl:img.likeButtonUrl
             };
             self.imageLikeShareArray.push(imgTrack);
             if(img.hasLike){ 
               self.isAnyImgLikeSelected = true;
               if(self.firstImgLikeButtonUrl == ''){
                 self.firstImgLikeButtonUrl = img.likeButtonUrl;
               }
             }
             if(img.hasShare){
               self.isAnyImgShareSelected = true;
             }
          }
        }
 
        img.image = img.webcom_fileasset.src;
        if (config.miscData.renderMode != 'Publish') {
          //DD: MTX-4289, Some images get displayed via ShowAsset and already have a ?, some via assets.myregisteredsite.com and dont have a ?
          var delimiter = (img.image.indexOf("?") != -1)?'&':'?';
          img.image = img.image + delimiter +"ts="+ts;
        }
        
        img.title = compData.title;
        img.description = compData.description;
        
        delete img.src;
        delete img.caption;
        delete img.webcom_fileasset; // galleria does not need anything from webcom_fileasset object  
        
        self.galleryOptions.data_source.push(img);
        i++;
    }
    
    /* add the facebook options */
    layerHtml = '<div id="' + self.id + '-layer" class="layerSettings">';
    //protocol relative
//        layerHtml += '<div class="photoalbum-share" style="display:none"><a name="fb_share" type="button"></a><script src="http://static.ak.fbcdn.net/connect.php/js/FB.Share" type="text/javascript"></script></div>';
    layerHtml += '<div class="photoalbum-share" style="display:none"><a name="fb_share" type="button"></a><script src="//static.ak.fbcdn.net/connect.php/js/FB.Share" type="text/javascript"></script></div>';
    layerHtml += '<div class="photoalbum-like" style="display:none"></div>';          
    layerHtml += '</div>'; 
    
    self.layer = layerHtml;
    
    if (config.listeners) {
      for (var eventName in config.listeners) {
        self.on(eventName, config.listeners[eventName].handler, config.listeners[eventName].scope);
      }
    }
    self.on("renderComplete", self.onRenderComplete, self);
    formattingValues = {
      instanceId: self.id,
      theme: config.componentData.theme,
      data: config.componentData.data,
      albumBgColor: config.componentData.appearance.bgcolor,
      albumTitle: config.componentData.name,
      albumDescription: config.componentData.description,
      albumTitleColor: config.componentData.appearance.captionFont.color,
      albumTitleFamily: config.componentData.appearance.captionFont.family,
      albumTitleWeight: self.getWeight(config.componentData.appearance.captionFont.style),
      albumTitleStyle: self.getStyle(config.componentData.appearance.captionFont.style),
      albumTitleSize: config.componentData.appearance.captionFont.size,
      albumDesColor: config.componentData.appearance.descriptionFont.color,
      albumDesFamily: config.componentData.appearance.descriptionFont.family,
      albumDesWeight: self.getWeight(config.componentData.appearance.descriptionFont.style),
      albumDesStyle: self.getStyle(config.componentData.appearance.descriptionFont.style),
      albumDesSize: config.componentData.appearance.descriptionFont.size,
      imageCaptionColor: config.componentData.appearance.imageCaptionFont.color,
      imageCaptionFamily: config.componentData.appearance.imageCaptionFont.family,
      imageCaptionWeight: self.getWeight(config.componentData.appearance.imageCaptionFont.style),
      imageCaptionStyle: self.getStyle(config.componentData.appearance.imageCaptionFont.style),
      imageCaptionSize: config.componentData.appearance.imageCaptionFont.size,
      imageDesColor: config.componentData.appearance.imageDescriptionFont.color,
      imageDesFamily: config.componentData.appearance.imageDescriptionFont.family,
      imageDesWeight: self.getWeight(config.componentData.appearance.imageDescriptionFont.style),
      imageDesStyle: self.getStyle(config.componentData.appearance.imageDescriptionFont.style),
      imageDesSize: config.componentData.appearance.imageDescriptionFont.size,
      width: config.componentData.settings.width || 500,
      height: config.componentData.settings.height || 300,
      q: config.miscData.q
    };
    
    if (config.miscData.renderMode != 'Edit') {
        switch (config.componentData.theme) {
          case "tiles":
            Galleria.loadTheme(WebCom.ResourceLoader.SHARED_URL + '/javascript/io/galleria/1.4.2/themes/web.tiles/galleria.web.tiles.min.js',self.galleryOptions);
            $('head').append('<link rel="stylesheet" href="' + WebCom.ResourceLoader.SHARED_URL + '/javascript/io/galleria/1.4.2/themes/web.tiles/galleria.web.tiles.css">');
            break;
          case "slides":
              Galleria.loadTheme(WebCom.ResourceLoader.SHARED_URL + '/javascript/io/galleria/1.4.2/themes/web.slides/galleria.web.slides.min.js',self.galleryOptions);
              $('head').append('<link rel="stylesheet" href="' + WebCom.ResourceLoader.SHARED_URL + '/javascript/io/galleria/1.4.2/themes/web.slides/galleria.web.slides.css">');
              WebCom_Components_PhotoAlbum_Template_MasterTemplate_Publish.getWaitDialog = function(){return "";};
              break;
          case "classic":
          default:
            Galleria.loadTheme(WebCom.ResourceLoader.SHARED_URL + '/javascript/io/galleria/1.4.2/themes/classic/galleria.classic.min.js',self.galleryOptions);
            $('head').append('<link rel="stylesheet" href="' + WebCom.ResourceLoader.SHARED_URL + '/javascript/io/galleria/1.4.2/themes/classic/galleria.classic.css">');
            break;
        }
      }
  };

  this.getAutoplay = function(autoplayVal, delayVal) {

    /* the autoplay value passed to galleria can be boolean or numeric */
    var delay = self.galleryOptions['delay'];
    if(autoplayVal == true){
      if(delayVal != null){
        autoplayVal = (delayVal * 1);
      }
    }
    return autoplayVal;

  },

  this.getWeight = function(val) {
    if (/normal|bold/.test(val)) {
      return val;
    }   
    return "normal";
  },

  this.getStyle = function(val) {
    if (/italic/.test(val)) {
      return val;
    }   
    return "normal";
  },
        
  this.getMasterTemplate = function(/*RenderMode*/mode){
    return self.getTemplate("MasterTemplate", mode);
  };
  
  this.getFormattingValues = function(){
    if (self.renderMode == 'Edit') {
      formattingValues.onload = '';
    }
    return formattingValues;
  };
  
  this.onRenderComplete = function(/*RenderMode*/mode, /*Element*/ _target){
    var t = this;
    if (mode != 'Edit' && !t.isDelayed) {
      setTimeout(function(){
        t.startEngine();
      }, 1000);
    }
  };
  
  this.startEngine = function() {
    var t = this;
    var galleriaId = '#' + t.id; 
    var containerId = galleriaId + "_webcom_photoalbum";

    if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
      delete t.galleryOptions.transition;
    }

    t.galleria = $(galleriaId + "_g").galleria(t.galleryOptions);
    $(containerId + " .photoalbum-loading").hide();

    if(t.layer != null){
      //$(t.layer).prependTo(containerId);

      $(t.layer).prependTo(galleriaId + "_g");

    }

    /* check the settings at the album level */
    if(self.isAlbumShareSelected == false || self.isAlbumLikeSelected == false){
      if(self.isAnyImgLikeSelected == true || self.isAnyImgShareSelected == true){
        /* check the settings at the image level */

        if(self.theme == 'tiles'){
          $("#" + self.id + "-layer div.photoalbum-share").css("visibility",(self.isAlbumShareSelected || self.isAnyImgShareSelected) ? "visible":"hidden").css("display","block"); 
; 
          
          if(self.isAlbumLikeSelected){
            /* use album level settings */
            $("#" + self.id + "-layer div.photoalbum-like").html(t.generateLikeButton(self.likeButtonUrl)).css("visibility","visible").css("display","block"); 
          }
          else if(self.isAnyImgLikeSelected){
            /* use image level settings */
            $("#" + self.id + "-layer div.photoalbum-like").html(t.generateLikeButton(self.firstImgLikeButtonUrl)).css("visibility","visible").css("display","block"); 
          }
          else{
            /* hide the like button */
            $("#" + self.id + "-layer div.photoalbum-like").html(t.generateLikeButton('')).css("visibility","hidden").css("display","block"); 
          }

        }
        else if(self.theme == 'slides'){
            $("#" + self.id + "-layer div.photoalbum-share").css("visibility",(self.isAlbumShareSelected || self.isAnyImgShareSelected) ? "visible":"hidden").css("display","block"); 
; 
            
            if(self.isAlbumLikeSelected){
              /* use album level settings */
              $("#" + self.id + "-layer div.photoalbum-like").html(t.generateLikeButton(self.likeButtonUrl)).css("visibility","visible").css("display","block"); 
            }
            else if(self.isAnyImgLikeSelected){
              /* use image level settings */
              $("#" + self.id + "-layer div.photoalbum-like").html(t.generateLikeButton(self.firstImgLikeButtonUrl)).css("visibility","visible").css("display","block"); 
            }
            else{
              /* hide the like button */
              $("#" + self.id + "-layer div.photoalbum-like").html(t.generateLikeButton('')).css("visibility","hidden").css("display","block"); 
            }

          }

        else{
          Galleria.on("image", function(e) {
          
            /* reset the settings back to hidden */
            $("#" + self.id + "-layer div.photoalbum-share").css("visibility",self.isAlbumShareSelected ? "visible":"hidden").css("display","block"); 
; 
            $("#" + self.id + "-layer div.photoalbum-like").css("visibility",self.isAlbumLikeSelected ? "visible":"hidden").css("display","block"); 
; 
            /* locate the current image, get the settings for it and set the visibility */
            for(var i=0;i < self.imageLikeShareArray.length;i++){
              if(e.index == self.imageLikeShareArray[i].index){
                $("#" + self.id + "-layer div.photoalbum-share").css("visibility",(self.isAlbumShareSelected || self.imageLikeShareArray[i].hasShare) ? "visible":"hidden").css("display","block"); 
; 
                if(self.isAlbumLikeSelected){
                  /* use album level settings */
                  $("#" + self.id + "-layer div.photoalbum-like").html(t.generateLikeButton(self.likeButtonUrl)).css("visibility",(self.isAlbumLikeSelected || self.imageLikeShareArray[i].hasLike) ? "visible":"hidden").css("display","block"); 
                }
                else if(self.imageLikeShareArray[i].hasLike){
                  /* use image level settings */
                  $("#" + self.id + "-layer div.photoalbum-like").html(t.generateLikeButton(self.imageLikeShareArray[i].likeButtonUrl)).css("visibility","visible").css("display","block"); 
                }
                else{
                  /* hide the like button */
                  $("#" + self.id + "-layer div.photoalbum-like").html(t.generateLikeButton("")).css("visibility","hidden").css("display","block"); 
                }
                break;
              }
            }
          });
        }
      }
      else{
        /* hide the like and share buttons as needed*/
        $("#" + self.id + "-layer div.photoalbum-share").css("visibility",self.isAlbumShareSelected ? "visible":"hidden").css("display",self.isAlbumShareSelected ? "block" : "none"); 
; 
        
        /* use album level settings */
        $("#" + self.id + "-layer div.photoalbum-like").html(t.generateLikeButton(self.likeButtonUrl)).css("visibility",self.isAlbumLikeSelected ? "visible":"hidden").css("display",self.isAlbumLikeSelected ? "block":"none"); 


      }

    }
    else{
      $("#" + self.id + "-layer div.photoalbum-share").css("visibility","visible").css("display","block");  

      /* use album level settings */
      $("#" + self.id + "-layer div.photoalbum-like").html(t.generateLikeButton(self.likeButtonUrl)).css("visibility","visible").css("display","block"); 

    }

    //set alt atr empty to be ADA compliant
    Galleria.ready(function() {
        this.bind('image', function(e) {
            e.imageTarget.alt = '';
        });
    });

    $(galleriaId + "_g_container").removeClass("hidden");
    if (t.onCompleteCallback) {
      t.onCompleteCallback(t);
    } 
  };

  this.generateLikeButton = function(likeButtonUrl){
    //protocol relative
//         return "<iframe src='http://www.facebook.com/plugins/like.php?href="+likeButtonUrl+"&layout=button_count' scrolling='no' frameborder='0' allowtransparency='true' class='photoalbum-like'></iframe>";
     return "<iframe src='//www.facebook.com/plugins/like.php?href="+likeButtonUrl+"&layout=button_count' scrolling='no' frameborder='0' allowtransparency='true' class='photoalbum-like'></iframe>";
  };
  
  this.getCss = function(config){
    return {
      'font-size': config.size + "px",
      'font-family': config.family,
      'font-weight': this.getWeight(config.style),
      'font-style': this.getStyle(config.style),
      'color': config.color
    };
  };
  
  this.refreshAppearance = function(newConfig){
    var containerId = "#" + this.id + "_g_container";        

    $(containerId + " .album-title").css(this.getCss(newConfig.appearance.captionFont || {}));
    $(containerId + " .album-des").css(this.getCss(newConfig.appearance.descriptionFont || {}));
    
    $(containerId + " .galleria-info-title").css(this.getCss(newConfig.appearance.imageCaptionFont || {}));
    $(containerId + " .galleria-info-description").css(this.getCss(newConfig.appearance.imageDescriptionFont || {}));
    $(containerId + " div.galleria-container").css("background-color", newConfig.appearance.bgcolor || '');
  };
  
  this.destroyAlbum = function(idx) {
    var g = Galleria.get(idx);
    if (g) {
      g.destroy();
    };
  };
} 
WebCom_Components_PhotoAlbumGalleriaIo.prototype = new WebCom.Components.Component();
