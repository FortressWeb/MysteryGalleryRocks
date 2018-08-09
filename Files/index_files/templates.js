var WebCom_Components_PhotoAlbum_Default_Template  = {
  getCssDefinition: function(className, key){
    return "#${instanceId}_g_container ." + className + " { \n" +
      "    color: ${" + key + "Color}; \n" +
      "    font-family: ${" + key + "Family}; \n" +
      "    font-weight: ${" + key + "Weight}; \n" +
      "    font-style: ${" + key + "Style}; \n" +
      "    font-size: ${" + key + "Size}px; \n" +
      "    text-align: ${" + key + "TextAlign}; \n" +
      "    line-height: 1.5; \n" +
      " } \n";  
  },

  getCssDefinitionForTiles: function(className, key){
    return "." + className + " { \n" +
      "    color: ${" + key + "Color}; \n" +
      "    font-family: ${" + key + "Family}; \n" +
      "    font-weight: ${" + key + "Weight}; \n" +
      "    font-style: ${" + key + "Style}; \n" +
      "    font-size: ${" + key + "Size}px; \n" +
      "    text-align: ${" + key + "TextAlign}; \n" +
      "    line-height: 1.5; \n" +
      " } \n";  
  },
  
  getCssAlbumBgColor: function(className) {
	  return "#${instanceId}_g_container ." + className + " { \n" +
      "    background: ${albumBgColor}; \n" +
      " } \n"; 
  },

  getCssAlbumWidth: function(className) {
	  return "#${instanceId}_g_container ." + className + " { \n" +
      "    width: ${width}; \n" +
      " } \n"; 
  },

  getCssCaptionBlock: function(className, key, values) {
    var css = "#${instanceId}_g_container ." + className + " { \n" +
      "    background-color: ${" + key + "BgColor}; \n" +
      "    opacity: ${" + key + "Opacity}; \n";

      if(values.captBlockPosition == 'top') {
        css += "    position: absolute; \n" +
        "    top: 0; \n" +
        "    bottom: initial; \n" ;
      }

      if(values.captBlockBorderPos == 'top') {
        css += "    border-top-width: ${" + key + "BorderWidth}px; \n" +
        "    border-top-style: ${" + key + "BorderType}; \n" +
        "    border-top-color: ${" + key + "BorderColor}; \n";
      } else if(values.captBlockBorderPos == 'bottom') {
        css += "    border-bottom-width: ${" + key + "BorderWidth}px; \n" +
        "    border-bottom-style: ${" + key + "BorderType}; \n" +
        "    border-bottom-color: ${" + key + "BorderColor}; \n";
      }
      
      css += " } \n"; 

      return css; 
  },
  
  getWaitDialog: function() {
    return "  <div class='photoalbum-loading wait-${theme}' style='width:${width}px;height:${height}px;background-color:${albumBgColor}'><div class='loading-animation'></div></div> \n";
  },
  getContainerCss: function() {
    return "class='hidden'";
  },
  getGalleriaDiv: function() {
    return "    <div id='${instanceId}_g'></div> \n";
  },
  //DD:  <span>t</span>, is a hack because of an weird IE 7/8 browser issue, it would not load the style unless some character is there...
  getMarkupText : function(component)  {
    var version = component.albumVersion || '1.1';
    if(version == '1.2'){
      return "<span style='display: none;'>t</span><style> \n" + this.getCssAlbumBgColor("gallery-target-element") 
        + this.getCssAlbumWidth("gallery-target-element")
        + this.getCssDefinition("album-title", "albumTitle")      
        + this.getCssDefinition("album-des", "albumDes") 
        + this.getCssDefinitionForTiles(component.id + ".gallery-image-caption", "imageCaption") 
        + this.getCssDefinitionForTiles(component.id + ".gallery-image-description", "imageDes") 
        + this.getCssCaptionBlock("slide-caption", "captBlock", component.getFormattingValues()) +
        "</style> \n" +
        "<div id='${instanceId}_webcom_photoalbum' class='webcom-photoalbum-comp''> \n" +
         this.getWaitDialog() + 
        "  <div id='${instanceId}_g_container' " + this.getContainerCss() + "> \n"+
        "    <div class='album-title'>${albumTitle}</div> \n" +
        "    <div class='album-des'>${albumDescription}</div> \n" +
        this.getGalleriaDiv() +     
        "  </div> \n" +
        "</div> \n";
    }else{
      return "<span style='display: none;'>t</span><style> \n" + this.getCssAlbumBgColor("galleria-container") 
        + this.getCssDefinition("album-title", "albumTitle")      
        + this.getCssDefinition("album-des", "albumDes") 
        + this.getCssDefinition("galleria-info-title", "imageCaption") 
        + this.getCssDefinition("galleria-info-description", "imageDes") +
        "</style> \n" +
        "<div id='${instanceId}_webcom_photoalbum' class='webcom-photoalbum-comp''> \n" +
         this.getWaitDialog() + 
        "  <div id='${instanceId}_g_container' " + this.getContainerCss() + "> \n"+
        "    <div class='album-title'>${albumTitle}</div> \n" +
        "    <div class='album-des'>${albumDescription}</div> \n" +
        this.getGalleriaDiv() +     
        "  </div> \n" +
        "</div> \n";
    } 
  }
};

var WebCom_Components_PhotoAlbum_Edit_Template = jQuery.extend(true, {}, WebCom_Components_PhotoAlbum_Default_Template, {
  getWaitDialog: function() {
    return "";
  },
  getContainerCss: function() {
    return "'";
  },
  getGalleriaDiv: function() {
    return "    <div id='${instanceId}_g' class='${theme}-theme-preview' style='height: ${height}px; width: ${width}px; background-position: 10px 50px;'></div>\n";
  }
});

//Defaults
var WebCom_Components_PhotoAlbum_Template_MasterTemplate_Publish = WebCom_Components_PhotoAlbum_Default_Template;
var WebCom_Components_PhotoAlbum_Template_MasterTemplate_Preview = WebCom_Components_PhotoAlbum_Default_Template;
var WebCom_Components_PhotoAlbum_Template_MasterTemplate_Edit    = WebCom_Components_PhotoAlbum_Edit_Template;