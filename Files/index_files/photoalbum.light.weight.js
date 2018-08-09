function WebCom_Components_PhotoAlbumLightWeight(lib){

  WebCom.Components.Component.apply(this, [lib]);

  var self = this;
  this.gallery = null;
  
  this.init = function(id, config){
    self.id = id;
    self.isDelayed = config.isDelayed;
    self.renderMode = config.miscData.renderMode;
    self.onCompleteCallback = config.miscData.onCompleteCallback || null;
    
    var compData = null, i = 0, layerHtml = null;

    /* data used to manage the facebook buttons in the gallery */
    self.imageLikeShareArray = new Array();
    self.imageLikeShareObject = {};
    self.isAlbumShareSelected = false;
    self.isAlbumLikeSelected = false;
    self.isAnyImgLikeSelected = false;
    self.isAnyImgShareSelected = false;

    self.likeButtonUrl = config.componentData.likeButtonUrl;
    self.shareButtonUrl = config.miscData.abUrl;

    /* tiles doenst rotate through the images, so need to capture an image level url */
    self.firstImgLikeButtonUrl = ''; 
    self.firstImgShareButtonUrl = '';

    var ts = new Date().getTime();

    self.isAlbumLikeSelected = (config.componentData.hasLike == true);
    self.isAlbumShareSelected = (config.componentData.hasShare == true);

    self.galleryOptions = config.componentData.settings || {};
    self.theme = config.componentData.theme;
    self.albumVersion = config.componentData.albumVersion || '1.0';
   
    var isResponsive = config.miscData.isSiteResponsiveStyle;
    if(isResponsive){
      self.galleryOptions['width'] = '100%';
    } else {
      self.galleryOptions['width'] = self.galleryOptions['width'] + 'px';
    }
    
    var $galleryElement;
    //create element container $galleryElement and set properties for each plugin
    switch(self.theme){
      case 'tiles':
        $galleryElement = $('<div>');
        self.galleryOptions['mode'] = (self.galleryOptions['mode'].indexOf('lg-') != -1) ? self.galleryOptions['mode'] : 'lg-slide';
        //add default opts for lightGallery plugin
        self.galleryOptions['download'] = false;
        
        break;
      
      case 'slides':
        $galleryElement = $('<div>');
        var $ulEl = $('<ul>')
        $galleryElement.append($ulEl)

        if(self.renderMode == 'Preview' && typeof parent.parent.BuilderContext == 'object' ){
          self.galleryOptions['auto'] = false;
        } else {
          self.galleryOptions['auto'] = self.galleryOptions['autoplay'];
        }
        delete self.galleryOptions['autoplay'];

        self.galleryOptions['mode'] = (self.galleryOptions['mode'].indexOf('lg-') == -1) ? self.galleryOptions['mode'] : 'slide';
        //add default opts for lightSlider plugin
        self.galleryOptions['item'] = 1;
        self.galleryOptions['slideMargin'] = 0;
        self.galleryOptions['gallery'] = false;
        self.galleryOptions['currentPagerPosition'] = 'left';
        self.galleryOptions['adaptiveHeight'] = true;

        break;

      case 'classic':
        $galleryElement = $('<div>');
        var $ulEl = $('<ul>')
        $galleryElement.append($ulEl)

        if(self.renderMode == 'Preview' && typeof parent.parent.BuilderContext == 'object' ){
          self.galleryOptions['auto'] = false;
        } else {
          self.galleryOptions['auto'] = self.galleryOptions['autoplay'];
        }
        delete self.galleryOptions['autoplay'];

        self.galleryOptions['mode'] = (self.galleryOptions['mode'].indexOf('lg-') == -1) ? self.galleryOptions['mode'] : 'slide';
        //add default opts for lightSlider plugin
        self.galleryOptions['item'] = 1;
        self.galleryOptions['slideMargin'] = 0;
        self.galleryOptions['thumbItem'] = 9;
        self.galleryOptions['gallery'] = true;
        self.galleryOptions['currentPagerPosition'] = 'left';
        self.galleryOptions['adaptiveHeight'] = true;
        break;
    }

    $galleryElement.addClass('gallery-target-element');
    
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
              shareButtonUrl:img.src,
              hasLike:img.hasLike,
              likeButtonUrl:img.likeButtonUrl
           };
           self.imageLikeShareArray.push(imgTrack);
           self.imageLikeShareObject['order-'+i] = imgTrack;
           if(img.hasLike){ 
             self.isAnyImgLikeSelected = true;
             if(self.firstImgLikeButtonUrl == ''){
               self.firstImgLikeButtonUrl = img.likeButtonUrl;
               self.firstImgShareButtonUrl = (img.hasShare) ? img.shareButtonUrl : '';
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
      
      img.title = (typeof compData.title != 'undefined') ? compData.title : '';
      img.description = compData.description;
      
      delete img.src;
      delete img.caption;
      delete img.webcom_fileasset; // gallery does not need anything from webcom_fileasset object  

      var hasTitle = (typeof img.title != 'undefined' && img.title.length > 0) ? true : false;
      var hasDesc = (typeof img.title != 'undefined' && img.description.length > 0) ? true : false;

      switch(self.theme){
        case 'tiles':
          var $aEl = $('<a>').attr('href',img.image);
          
          if(hasTitle || hasDesc){
            var subHtml = '';
            if(hasTitle){
              subHtml += '<h4 class="' + self.id + ' gallery-image-caption">' + img.title + '</h4>';
            }
            if(hasDesc){
              subHtml += '<p class="' + self.id + ' gallery-image-description">' + img.description + '</p>'
            }
            $aEl.attr('data-sub-html', subHtml);
          }

          var $imgEl = $('<img>').attr({
            src: img.image,
            alt: ''
          });
          $imgEl.addClass('order-'+i);
          $imgEl.appendTo($aEl);   
          $aEl.appendTo($galleryElement);

          break;

        case 'slides':
        case 'classic':
          var $liEl = $('<li>').attr('data-thumb', img.image);
          var $img = $('<img>').attr({
            src: img.image,
            alt: ''
          });
          $img.addClass('order-'+i);
          $img.appendTo($liEl);
          
          if(hasTitle || hasDesc){
            var $capContainer = $('<div>').addClass('slide-caption');
            if(hasTitle){
              var $title = $('<h4>').html(img.title);
              $title.addClass(self.id + ' gallery-image-caption')
              $title.appendTo($capContainer);
            }
            if(hasDesc){
              var $desc = $('<p>').html(img.description);
              $desc.addClass(self.id + ' gallery-image-description')
              $desc.appendTo($capContainer);
            }
            $capContainer.appendTo($liEl);
          }
          $ulEl = $galleryElement.find('ul').first();
          $liEl.appendTo($ulEl);

          break;
      }
      i++;
    }

    $galleryElement.hide();
    self.$galleryElement = $galleryElement;
    
    /* add the facebook options */
    layerHtml = '<div id="' + self.id + '-layer" class="layerSettings">';
    layerHtml += '<div class="photoalbum-share" style="display:none"><a name="fb_share" type="button"></a><script src="http://static.ak.fbcdn.net/connect.php/js/FB.Share" type="text/javascript"></script></div>';
    layerHtml += '<div class="photoalbum-like" style="display:none"></div>';          
    layerHtml += '</div>'; 
    
    self.layer = layerHtml;
    
    if (config.listeners) {
      for (var eventName in config.listeners) {
        self.on(eventName, config.listeners[eventName].handler, config.listeners[eventName].scope);
      }
    }
    
    self.on("renderComplete", self.onRenderComplete, self);

    var captionBlock = config.componentData.appearance.captionBlock;

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
      imageCaptionTextAlign: config.componentData.appearance.imageCaptionFont.textAlign,
      imageDesColor: config.componentData.appearance.imageDescriptionFont.color,
      imageDesFamily: config.componentData.appearance.imageDescriptionFont.family,
      imageDesWeight: self.getWeight(config.componentData.appearance.imageDescriptionFont.style),
      imageDesStyle: self.getStyle(config.componentData.appearance.imageDescriptionFont.style),
      imageDesSize: config.componentData.appearance.imageDescriptionFont.size,
      imageDesTextAlign: config.componentData.appearance.imageDescriptionFont.textAlign,
      
      //we need to set the defaults for the existing albums
      captBlockBgColor: (captionBlock) ? captionBlock.backgroundColor : WebCom_Components_PhotoAlbumLightWeight_Defaults.appearance.captionBlock.backgroundColor,
      captBlockBorderColor: (captionBlock) ? captionBlock.borderColor : WebCom_Components_PhotoAlbumLightWeight_Defaults.appearance.captionBlock.borderColor,
      captBlockBorderPos: (captionBlock) ? captionBlock.borderPosition : WebCom_Components_PhotoAlbumLightWeight_Defaults.appearance.captionBlock.borderPosition,
      captBlockBorderWidth: (captionBlock) ? captionBlock.borderWidth : WebCom_Components_PhotoAlbumLightWeight_Defaults.appearance.captionBlock.borderWidth,
      captBlockBorderType: (captionBlock) ? captionBlock.borderType : WebCom_Components_PhotoAlbumLightWeight_Defaults.appearance.captionBlock.borderType,
      captBlockOpacity: (captionBlock) ? captionBlock.opacity : WebCom_Components_PhotoAlbumLightWeight_Defaults.appearance.captionBlock.opacity,
      captBlockPosition: (captionBlock) ? captionBlock.position : WebCom_Components_PhotoAlbumLightWeight_Defaults.appearance.captionBlock.position,
      width: config.componentData.settings.width || 500,
      height: config.componentData.settings.height || 300,
      q: config.miscData.q
    };
    
    if (config.miscData.renderMode != 'Edit') {
        switch (config.componentData.theme) {
          case "tiles":
            $('head').append('<link rel="stylesheet" href="' + WebCom.ResourceLoader.SHARED_URL + '/javascript/lightgallery/1.2.22/css/lightgallery.min.css">');
            $('head').append('<link rel="stylesheet" href="' + WebCom.ResourceLoader.SHARED_URL + '/javascript/lightgallery/1.2.22/css/lg-transitions.min.css">');
            $('head').append('<link rel="stylesheet" href="' + WebCom.ResourceLoader.SHARED_URL + '/javascript/justifiedgallery/3.6.1/css/justifiedGallery.min.css">');
            break;
          case "slides":
          case "classic":
          default:
            $('head').append('<link rel="stylesheet" href="' + WebCom.ResourceLoader.SHARED_URL + '/javascript/lightslider/1.1.5/css/lightslider.min.css">');
            break;
        }
      }
  };

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

    mode = mode.renderMode;
    if (mode != 'Edit' && !t.isDelayed) {
      setTimeout(function(){
        t.startEngine();
      }, 1000);
    } 
  };
  
  this.startEngine = function() {
    var t = this;
    var galleryId = '#' + t.id; 
    var containerId = galleryId + "_webcom_photoalbum";

    //append the element with the html structure
    $(galleryId + '_g').append(t.$galleryElement);

    var $targetEl = $(galleryId + "_g > .gallery-target-element");
    
    //elements should be shown before starting the plugins, otherwise they cant process the transition effects
    t.$galleryElement.show();

    if(t.layer != null){
      $(t.layer).prependTo(galleryId + "_g");
    }

    /*
    LIKE & SHARE behaviour: 
    Tiles: if album like/share is selected -> display album like/share and discard img like/share
    otherwise, the button of the first image with like option selected will be shown (album like/share is not shown)
    Classic/slider: same as tiles, but img like/share buttons are generated after every slide and shown accordingly.
    */
    var $likeContainer = $("#" + self.id + "-layer div.photoalbum-like");
    var $shareContainer = $("#" + self.id + "-layer div.photoalbum-share");
    // check the settings at the album level
    if(self.isAlbumShareSelected == true || self.isAlbumLikeSelected == true){
      var cssProps = {'visibility': 'visible', 'display': 'block'};
      
      if(self.isAlbumLikeSelected){
        var likeButton = t.generateLikeButton(self.likeButtonUrl);
        $likeContainer.html(likeButton);
        $likeContainer.css(cssProps);
      }

      if(self.isAlbumShareSelected){
        var shareButton = t.generateShareButton(self.shareButtonUrl);
        $shareContainer.html(shareButton);
        $shareContainer.css(cssProps);  
      }      
    }
    else if(self.isAnyImgLikeSelected == true || self.isAnyImgShareSelected == true){
      //there's image like/share
      switch(self.theme){
        case 'tiles':
          var visibility = (self.isAlbumShareSelected || self.isAnyImgShareSelected) ? "visible":"hidden";
          $shareContainer.css({
            "visibility": visibility, 
            "display" : "block"
          });

          var likeButton;
          if(self.isAnyImgLikeSelected){
            //we use first image like button available 
            likeButton = t.generateLikeButton(self.firstImgLikeButtonUrl);
            $likeContainer.html(likeButton).css({
              "visibility":"visible",
              "display":"block"
            });
            if(self.firstImgShareButtonUrl != ''){
              var $shareButton = $(self.generateShareButton(self.firstImgShareButtonUrl));
              $shareContainer.html($shareButton);
              $shareContainer.css({
                "visibility":"visible",
                "display":"block"
              }); 
            }
          }else{
            //hide the like button
            likeButton = t.generateLikeButton('');
            $likeContainer.html(likeButton).css({
              "visibility":"hidden",
              "display":"block"
            }); 
          };
          break;
        case 'slides':
        case 'classic':
          t.galleryOptions.onSliderLoad = function(el) {
            self.showLikeandShare(el);
          }
          t.galleryOptions.onAfterSlide = function(el){
            self.showLikeandShare(el);
          };
          break;
      }
    }
    else{
      // no likes or shares at any level
      $shareContainer.css({
        "visibility": "hidden",
        "display": "none"
      }); 
      
      $likeContainer.css({
        "visibility": "hidden",
        "display": "none"
      }); 
    }
    //parse share btn
    t.parseFBButton();

    delete t.galleryOptions.width;
    //start the plugin depending on the selected theme
    switch(self.theme){
      case 'tiles':
        t.gallery = $targetEl.justifiedGallery({
          border: 6, //container padding
          margins: 5
        }).on('jg.complete', function(){
          $targetEl.lightGallery(t.galleryOptions)
        })

        break;

      case 'slides':
      case 'classic':
        $ulEl = $targetEl.find('ul').first();
        t.gallery = $ulEl.lightSlider(t.galleryOptions);
        break;
    }

    $('ul', $targetEl).css('margin','0');
    
    $(containerId + " .photoalbum-loading").hide();

    $(galleryId + "_g_container").removeClass("hidden");
    if (t.onCompleteCallback) {
      t.onCompleteCallback(t);
    } 
  };

  this.showLikeandShare = function(el){
    // reset the settings back to hidden
    var $likeContainer = $("#" + self.id + "-layer div.photoalbum-like");
    var $shareContainer = $("#" + self.id + "-layer div.photoalbum-share");
    
    $likeContainer.css({
      "visibility":"hidden",
      "display":"block"
    }); 
    $shareContainer.css({
      "visibility":"hidden",
      "display":"block"
    }); 
    
    //locate the current image, get the settings for it and set the visibility 
    var imgOrder = $(el).find('.active img').attr('class');
    if(typeof self.imageLikeShareObject[imgOrder] != 'undefined'){
      $likeContainer.empty();
      $shareContainer.empty();
      
      if(self.imageLikeShareObject[imgOrder].hasLike){
        var $button = $(self.generateLikeButton(self.imageLikeShareObject[imgOrder].likeButtonUrl));
        $likeContainer.html($button);
        $likeContainer.css("visibility","visible").css("display","block"); 
      }
      if(self.imageLikeShareObject[imgOrder].hasShare){
        var $button = $(self.generateShareButton(self.imageLikeShareObject[imgOrder].shareButtonUrl));
        $shareContainer.html($button);
        $shareContainer.css("visibility","visible").css("display","block"); 
        self.parseFBButton();
      }
      
    }
  };

  this.generateLikeButton = function(likeButtonUrl){
    return "<iframe src='https://www.facebook.com/plugins/like.php?href="+likeButtonUrl+"&layout=button_count' scrolling='no' frameborder='0' allowtransparency='true' class='photoalbum-like'></iframe>";
  };

  this.generateShareButton = function(shareButtonUrl){
    return '<div class="fb-share-button" data-href="'+shareButtonUrl+'" data-layout="button"></div>';
  };

  this.parseFBButton = function(){
    var browserInfo = self.getBrowserInfo();
    if(browserInfo.name == 'Firefox' && browserInfo.version <= 43) {
      self.hideShareButton();
    } else if(typeof FB != 'undefined') {
      FB.XFBML.parse();  
    }
  };

  this.hideShareButton = function(){
    $('.fb-share-button').hide();
  };
  
  this.getCss = function(config){
    var css;
    //check if the config is gonna be set to font elements or caption block by checking the position property
    if(typeof config.position == 'undefined') {
      css = {
        'font-size': config.size + "px",
        'font-family': config.family,
        'font-weight': this.getWeight(config.style),
        'font-style': this.getStyle(config.style),
        'color': config.color,
        'text-align': config.textAlign,
      };
    }else{
      css = {
        'background-color': config.backgroundColor,
        'opacity' : config.opacity
      }
      if(config.position == 'top') {
        css['position'] = 'absolute';
        css['top'] = 0;
        css['bottom'] = 'initial';
      }else{
        css['position'] = 'absolute';
        css['top'] = 'initial';
        css['bottom'] = 0;
      }

      if(config.borderPosition == 'top') {
        css['border-top-width'] = config.borderWidth + 'px';
        css['border-top-style'] = config.borderType;
        css['border-top-color'] = config.borderColor;
        css['border-bottom-width'] = 0;
        css['border-bottom-style'] = 'none';
        css['border-bottom-color'] = 'transparent';
      } else if(config.borderPosition == 'bottom'){
        css['border-bottom-width'] = config.borderWidth + 'px';
        css['border-bottom-style'] = config.borderType;
        css['border-bottom-color'] = config.borderColor;
        css['border-top-width'] = 0;
        css['border-top-style'] = 'none';
        css['border-top-color'] = 'transparent';
      }
    }

    return css;
  };
  
  this.refreshAppearance = function(newConfig){
    var containerId = "#" + this.id + "_g_container";        

    $(containerId + " .album-title").css(this.getCss(newConfig.appearance.captionFont || {}));
    $(containerId + " .album-des").css(this.getCss(newConfig.appearance.descriptionFont || {}));

    $(containerId + " div.gallery-target-element").css("background-color", newConfig.appearance.bgcolor || '');

    //creates temporary style tag for the open gallery, since element style properties are discarded 
    var iframe = $('#albumPreviewFrame').context;
    var $css = $('#tempGalleryStyle', iframe);
    if($css.length == 0){
      $css = $('<style>').attr('id', 'tempGalleryStyle');
      $(iframe).find('head').append($css);
    }
    
    var styles = '.' + this.id + '.gallery-image-caption{';
    var props = this.getCss(newConfig.appearance.imageCaptionFont || {});
    $.each( props, function( key, value ) {
      styles += key + ": " + value + ' !important; ';
    });
    styles += '}';
    
    props = this.getCss(newConfig.appearance.imageDescriptionFont || {});
    styles += '.' + this.id + '.gallery-image-description{';
    $.each( props, function( key, value ) {
      styles += key + ": " + value + ' !important; ';
    });
    styles += '}';

    props = this.getCss(newConfig.appearance.captionBlock || {});
    styles += '#' + this.id + ' .slide-caption{';
    $.each( props, function( key, value ) {
      styles += key + ": " + value + ' !important; ';
    });
    styles += '}';

    $css.html(styles);
  };

  this.destroyAlbum = function(idx) {
    console.log('destroy');
    var galleryId = this.id + '_g';
    var gallerySelector = '#' + galleryId + ' > .gallery-target-element';
    if(this.theme == 'tiles'){
        $(gallerySelector).justifiedGallery('destroy');
        $(gallerySelector).data('lightGallery').destroy(true);
        $(gallerySelector).remove();
    }else{
        $(gallerySelector).remove();
    }
  };

  this.getBrowserInfo = function() {
    var ua = navigator.userAgent, tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || []; 
    if(/trident/i.test(M[1])) {
      tem = /\brv[ :]+(\d+)/g.exec(ua) || []; 
      return { 
        name:'IE ', 
        version: (tem[1]||'') 
      };
    }   
    if(M[1]==='Chrome') {
      tem = ua.match(/\bOPR\/(\d+)/)
      if(tem!=null)   {return {name:'Opera', version:tem[1]};}
    }
    M = M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem=ua.match(/version\/(\d+)/i))!=null) {
      M.splice(1,1,tem[1]);
    }
    return {
      name: M[0],
      version: M[1]
    };
  }
}
WebCom_Components_PhotoAlbumLightWeight.prototype = new WebCom.Components.Component();

//load fb sdk
(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.7";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'))
