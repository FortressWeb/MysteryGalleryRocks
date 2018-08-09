(
  function () {
    var VERSION = "1.2";
    var NAME    = "com.web.components.photoalbum";
    var scripts = ["js/templates.js", "js/defaults.js", 'js/photoalbum.galleria.io.js', 'js/photoalbum.light.weight.js'];
    var styles  = ["css/photoalbum.css"];

    WebCom.ResourceLoader.loadLib('io.galleria', '1.4.2', true);
    WebCom.ResourceLoader.loadLib('lightgallery', '1.2.22', true);
    WebCom.ResourceLoader.loadLib('justifiedgallery', '3.6.1', true);
    WebCom.ResourceLoader.loadLib('lightslider', '1.1.5', true);

    var lib = new WebCom.ResourceLoader.Library("WebCom.Components.PhotoAlbum", NAME, VERSION, scripts, styles );
    WebCom.ResourceLoader.importLib(lib);

    WebCom.Components.PhotoAlbum = {
      initInstances : function (instances, globalSettings) {

        if (instances.length > 0) {       

          var theme = instances[0].componentData.theme;
          for (var i = 0; i < instances.length; i++) {
            var inst = instances[i];
            inst.theme = theme;
            
            if (globalSettings && globalSettings.listeners) {
              if (inst["listeners"] == null) {
                inst["listeners"] = globalSettings.listeners;
              }
              else {
                var listeners = inst["listeners"];
                for (var eventName in globalSettings.listeners) {
                  if (listeners[eventName] == null) {
                    listeners[eventName] = globalSettings.listeners[listenerName];
                  }
                }
              }
            }
            var version = inst.componentData.albumVersion || '1.1';
            var comp;
            
            if(version == '1.2'){
              comp = new WebCom_Components_PhotoAlbumLightWeight(lib);
            }else{
              comp = new WebCom_Components_PhotoAlbumGalleriaIo(lib);
            }
            comp.init(inst.id, inst);
            comp.render(comp.renderMode);
          }
        }
      }
    };
  }
)();

