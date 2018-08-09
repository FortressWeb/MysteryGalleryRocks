(function() {
    var VERSION = "1.2";
    var NAME = "com.web.components.mapquest";
    var scripts = [ "js/templates.js", "../../../../../../../javascript/libs/webcomjs/webmap/webmap.js" ];
    var styles = [ "css/mapquest.css" ];

    var MAP_TYPE = 'WebGoogleMaps';
    
    var MAPQUEST_ZOOM = 13;

    // Tracking with Google Analytics, true for enabling
    var TRACK_WITH_ANALYTICS = false;
    
    var WEBMAP_PROXY_URL = {
      'prod' : 'matrix.myregisteredsite.com',
      'stg' : 'default01.staging.matrixbuilder.com',
      'qa' : 'default.qa.matrixbuilder.com',
      'dev' : 'default.dev.matrixbuilder.com'
    }

    WEBMAP_PROXY_URL.publish = WEBMAP_PROXY_URL.prod;

    
    function getJSessionId() {
      var jSessionId = document.location.href.match(/jsessionid=([A-Z0-9]+)/);

      return jSessionId == null ? false : jSessionId[1];
    }
    
    function getWebMapProxyUrl() {
      var env = '';
      
      if (WebCom.Environment.isProd()) {
        env = 'prod';
      } else if (WebCom.Environment.isStg()) {
        env = 'stg';
      } else if (WebCom.Environment.isQA()) {
        env = 'qa';
      } else if (WebCom.Environment.isDev()) {
        env = 'dev';
      } else {
        env = 'publish';
      }
      
      if (env === 'publish'){
//    	  console.log('published site');
          return '//' + WEBMAP_PROXY_URL[env] + '/matrix/servlet/com.web.servlet.map;jsessionid=' + getJSessionId();    	  
      } else {
//    	  console.log('within builder, hostname = ' + document.location.hostname);
          return '//' + document.location.hostname + '/matrix/servlet/com.web.servlet.map;jsessionid=' + getJSessionId();    	  
      }
    }    
    
    // foreign resources
    var lib = new WebCom.ResourceLoader.Library("WebCom.Components.MapQuest", NAME, VERSION, scripts, styles)
    WebCom.ResourceLoader.importLib(lib);

    // this component will handle both MapQuest and Google Maps
    function WebCom_Components_MapQuest() {
        WebCom.Components.Component.apply(this, [ lib ]);

        var MAP_SELECTOR = '.google-map';

        var self = this; // to overcome callback scoping

        this.getFullAddress = function(config) {
            var address = config.componentData.location.address;
            var address_2 = config.componentData.location.address_2;
            var city = config.componentData.location.city;
            var state = config.componentData.location.state;
            var zip = config.componentData.location.zip;
            var country = config.componentData.location.country;

            var fullAddress = address + " " + address_2 + ", " + city + ", " + state + " " + zip + ", " + country;
            return encodeURIComponent(fullAddress);
        };
        
        function getGoogleMapsApiKey() {
          return window['googleMapsApiKey'] ? window['googleMapsApiKey'] : window.parent['googleMapsApiKey'];
        }
        
        function createMap(config) {
          var mapOpts = {
              address : config.componentData.location.address + ' '
                      + (config.componentData.location.address_2 ? config.componentData.location.address_2 : ''),
              zoom : config.componentData.displayOptions.mapZoom,
              showDirections : config.componentData.displayOptions.mapShowDirections,
              directionsAlign : config.componentData.displayOptions.mapDirectionsAlign,
          }

          if (MAP_TYPE === 'WebGoogleMaps') {
             mapOpts.renderWith = 'jsApi';
          }
          
          $.extend(mapOpts, {
            proxy : {
              url : getWebMapProxyUrl()
            }
          });

          // see js/webmap.js
          return webmap.create(MAP_TYPE, $.extend(true, {}, config.componentData.location, mapOpts));
        }
        
        // webmap instance, see webmap.js
        var webMap = {};
        
        this.init = function(id, config) {
            self.id = id;
            self.renderMode = config.miscData.renderMode;

            if (config.listeners) {
                for ( var eventName in config.listeners) {
                    self.on(eventName, config.listeners[eventName].handler, config.listeners[eventName].scope);
                }
            }
    
            var isPublish = false;
            if (window['matrixMiscInfo'] && window['matrixMiscInfo'].isPublish) {
                isPublish = true;
            }

            webMap = createMap(config, isPublish);
            
            $('#' + id).attr('data-map-type', MAP_TYPE);
            

            var mapDirectionsPromise = webMap.getDirectionsUrl();
 
            formattingValues = {};

            $.when(mapDirectionsPromise).always(function(mapDirectionsUrl) {
              $.extend(formattingValues, {
                mapUrl : webMap.getEmbedUrl(),
                mapDirectionsUrl : mapDirectionsUrl,
                fullAddress : self.getFullAddress(config),
                address : config.componentData.location.address,
                address_2 : config.componentData.location.address_2,
                city : config.componentData.location.city,
                state : config.componentData.location.state,
                zip : config.componentData.location.zip,
                country : config.componentData.location.country,
                mapWidth : config.componentData.displayOptions.mapWidth,
                mapHeight : config.componentData.displayOptions.mapHeight,
                mapZoom : config.componentData.displayOptions.mapZoom,
                mapAlign : config.componentData.displayOptions.mapAlign,
                mapShowDirections : config.componentData.displayOptions.mapShowDirections,
                mapDirectionsAlign : config.componentData.displayOptions.mapDirectionsAlign,
                mapFormat : config.componentData.displayOptions.mapFormat,
                onload : '',
                editOverlay : '',
                imgClass : '',
                mapType : MAP_TYPE
              })
            })

            return mapDirectionsPromise;
        }
        
        this.on('renderComplete', function() {
          if (MAP_TYPE === 'WebGoogleMaps') {
            var $el = $('#' + self.id);

            webMap.render($el.find(MAP_SELECTOR));
          }
        })
        
        this.getMasterTemplate = function(/* RenderMode */mode) {
            return self.getTemplate("MasterTemplate", mode);
        };

        this.getFormattingValues = function() {
            formattingValues.imgClass = 'map-loading';
            if (self.renderMode == 'Edit') {
                formattingValues.onload = ' onload="hideLoading()" ';
                formattingValues.editOverlay = '<div class="edit-overlay"></div>';

                // Map format static for edit mode, so we minimize the number of
                // http requests the client has to make
                // This does not work at this time with bad addresses: Error
                // constructing static map: Cannot display a static map of an
                // unresolved location
                // Firefox and chrome has problems with iframes within iframes
                // if(WebCom.Browser.isGecko || WebCom.Browser.isWebKit) {
                formattingValues.mapFormat = 'static';
                // }
            }
            // Mapquest Iframe not compatible with our builder super iframe
            // stack, so we display a image instead of advanced draggable map
            // (Preview only)
            if (self.renderMode == 'Preview') {
                formattingValues.mapFormat = 'static';
            }
            return formattingValues;
        };

        return this;
    }
    ;

    WebCom_Components_MapQuest.prototype = new WebCom.Components.Component();
    WebCom.Components.MapQuest = {
        initInstances : function(instances, globalSettings) {
            for (var i = 0; i < instances.length; i++) {
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

                var comp = new WebCom_Components_MapQuest();
                
                $.when(comp.init(inst.id, inst)).always(function() {
                  comp.render(comp.renderMode);
                })
            }
        }

    };

})();
