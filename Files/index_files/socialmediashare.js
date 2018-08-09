(function() {
  var VERSION = "1.1";
  var NAME = "com.web.components.socialmediashare";
  var scripts = [ "js/smstemplates.js" ];
  var styles = [ "css/socialmediashare.css" ];

  // foreign resources
  WebCom.ResourceLoader.loadLib('com.jquery', null, true);

  var lib = new WebCom.ResourceLoader.Library("WebCom.Components.SocialMediaShare", NAME, VERSION, scripts, styles);
  WebCom.ResourceLoader.importLib(lib);

  function WebCom_Components_SocialMediaShare() {
    WebCom.Components.Component.apply(this, [ lib ]);

    var self = this; // to overcome calback scoping
    var id = '';
    var renderMode = '';
    var pageUrl = '';
    var layout = '';
    var formattingValues = {};

    this.init = function(id, config) {
      self.id = id;
      self.renderMode = config.miscData.renderMode;
      self.layout = config.componentData.shareStyle;
      if (config.listeners) {
        for ( var eventName in config.listeners) {
          self.on(eventName, config.listeners[eventName].handler, config.listeners[eventName].scope);
        }
      }

      //protocol relative
//      var facebookShareURL = 'http://www.facebook.com/share.php?u=';
//      var twitterShareURL = 'http://www.twitter.com/home?status=';
//      var googleShareUrl = 'https://plus.google.com/share?url=';
//      var linkedinShareURL = 'http://www.linkedin.com/shareArticle?mini=true&url=';
      var facebookShareURL = '//www.facebook.com/share.php?u=';
      var twitterShareURL = '//www.twitter.com/home?status=';
      var googleShareUrl = '//plus.google.com/share?url=';
      var linkedinShareURL = '//www.linkedin.com/shareArticle?mini=true&url=';

      self.formattingValues = {
        facebookShareUrl : facebookShareURL + document.location,
        twitterShareUrl : twitterShareURL + document.location,
        linkedinShareUrl : linkedinShareURL + document.location,
        googleShareUrl : googleShareUrl + document.location,
        target : ' target="_blank" '
      };

    };

    this.getFormattingValues = function() {
      if (self.renderMode == 'Edit' || self.renderMode == 'Preview') {
        self.formattingValues.facebookShareUrl = 'javascript:void(0)';
        self.formattingValues.twitterShareUrl = 'javascript:void(0)';
        self.formattingValues.linkedinShareUrl = 'javascript:void(0)';
        self.formattingValues.googleShareUrl = 'javascript:void(0)';
        self.formattingValues.target = '';
      }
      return self.formattingValues;
    };

    this.getMasterTemplate = function(/* RenderMode */mode) {
      return self.getTemplate("MasterTemplate", mode, self.layout);
    };

    this.getLayout = function() {
      return self.layout;
    };
    return this;
  }
  ;

  WebCom_Components_SocialMediaShare.prototype = new WebCom.Components.Component();
  WebCom.Components.SocialMediaShare = {
    initInstances : function(instances, globalSettings) {
      for ( var i = 0; i < instances.length; i++) {
        var inst = instances[i];

        if (globalSettings && globalSettings.listeners) {
          if (inst["listeners"] == null) {
            inst["listeners"] = globalSettings.listeners;
          } else {
            var listeners = inst["listeners"];
            for ( var eventName in globalSettings.listeners) {
              if (listeners[eventName] == null) {
                listeners[eventName] = globalSettings.listeners[listenerName];
              }
            }
          }
        }

        var comp = new WebCom_Components_SocialMediaShare();
        comp.init(inst.id, inst);
        comp.render(comp.renderMode);
      }
    }
  };

})();