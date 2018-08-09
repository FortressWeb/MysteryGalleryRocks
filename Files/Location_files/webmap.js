/**
 * Copyright (c) 2013 Web.com Group, Inc. All Rights Reserved.
 *
 * This is an unpublished work protected by Web.com Group, Inc. as a
 * trade secret, and is not to be used or disclosed except as expressly provided
 * in a written license agreement executed by you and
 * Web.com Group, Inc.
 *
 * @author Fernando Gabrieli
 */

/**
 * Maps implementation: MapQuest, Google maps
 * 
 * Basic usage:
 * 
 * webmap.create('WebGoogleMaps', { address : 'Empire State', city : 'New York',
 * country : 'United States' }).render($('body'));
 */

(function() {
    'use strict';

  /**
     * Add any new map classes here
     */
    var mapClasses = {
        'WebMapQuest' : WebMapQuest,
        'WebGoogleMaps' : WebGoogleMaps
    };

    /**
     * @abstract
     * 
     * @param opts
     *            object with options
     * @option String address
     * @option String city
     * @option String state
     * @option String zip
     * @option String country
     */
    function WebMap(opts) {
        this.opts = opts;

      /**
         * Has option
         * 
         * @param String
         *            option name
         */
        this.hasOpt = function(opt) {
            return this.opts[opt] && this.opts[opt].length;
        };

        /**
         * Get a copy of the options.
         * 
         * @return Object with options copy
         */
        this.getOptsCopy = function() {
            return $.extend(true, {}, opts);
        };

        /**
         * Get url for the iframe src attribute to show an address
         * 
         * @returns String url or false if not implemented by child class
         */
        this.getEmbedUrl = function() {
            // @override
            return false;
        };

        /**
         * Get directions url to open in new window
         * 
         * @returns Object promise, resolved promise is returned if the method
         *          is not implemented by the child class
         */
        this.getDirectionsUrl = function() {
          // @override
          
          // returns a resolved promise
          return $.when();
        };
    }

    /**
     * Retrieve map configuration from the iframe DOM element.
     * 
     * @static
     * @return Object with configuration
     */
    WebMap.prototype.getConfigFromEl = function($iframeEl) {
      // @override
    };

    /**
     * 
     * Whether the argument corresponds to an instance of this class or an embed
     * url which would turn into it when the map is created.
     * 
     * @param String
     *            embed url | Object webmap instance
     */
    WebMap.prototype.isType = function(mixed) {
        return (typeof mixed === 'object' && mapClasses.indexOf(mixed) !== -1);
    };

    /**
     * Whether it is a valid embedUrl or not.
     * 
     * @param String
     *            embed url
     * @return boolean
     */
    WebMap.prototype.isValidEmbedUrl = function(embedUrl) {
      // @override
        return false;
    };

    /**
     * Get location from address (i.e. for Google Maps it is an object with
     * {lat, lng} values
     * 
     * @static
     */
    WebMap.prototype.getLocation = function(mapClassName, address) {
    // @override
        return false;
    };

    /**
     * Render map
     *
     * @param jQuery
     *            element
     *
     * @override
     */
    WebMap.prototype.render = function($el) {
        $el.attr('src', this.getEmbedUrl());
    };


    /**
     * This class allows us to proxy all requests to a map implementation
     * through an iframe. It is just a wrapper to this iframe, but implements
     * the same interface as WebMap for convenience.
     * 
     * The iframe itself must implement the map with the params it receives in
     * the URL (it can use WebMap lib as well)
     * 
     * @param opts
     *            object with options
     * @option String domain to point the iframe to
     * @option String implementation the map type that is proxied (i.e.
     *         WebMapQuest, WebGoogleMaps)
     * @option String address
     * @option String city
     * @option String state
     * @option String zip
     * @option String country
     */
    function WebMapProxy(opts) {
        WebMap.call(this, opts);

        var $iframeEl = $('<iframe>');

        if (opts.proxy && opts.proxy.params) {
            $.extend(opts, opts.proxy.params);
        }

        $iframeEl.attr('src', opts.proxy.url + '?' + $.param(opts));

        opts.proxy = false;

        $iframeEl.attr('scrolling', 'no');

        $iframeEl.css({
            'width' : '100%',
            'height' : '100%',
            'border' : 'none'
        });

      /**
         * Render map
         * 
         * @param jQuery
         *            element
         * 
         * @override
         */
        this.render = function($el) {
            $el.empty();

            $iframeEl.appendTo($el);
        };
    }

    
    /**
     * @param opts
     *            object with options
     * @option String address
     * @option String city
     * @option String state
     * @option String zip
     * @option String country
     * @option String zoom
     */
    function WebMapQuest(opts) {
        WebMap.call(this, opts);

        var MAP_WEB_ID = 'mqdist_webcom';

        var MAP_URL = 'https://www.mapquest.com';

        var MAP_ZOOM = 13;

        var zoom = opts.zoom ? opts.zoom : MAP_ZOOM;

        var getEmbedQuery = function() {
            if (typeof opts === 'undefined' || typeof opts.address === 'undefined')
                return '';

            var query = 'addr: ' + opts.address;
            query += this.hasOpt('city') ? ' city: ' + opts.city : '';
            query += this.hasOpt('state') ? ' state: ' + opts.state : '';
            query += this.hasOpt('zip') ? (' postalCode: ' + opts.zip) : '';
            query += this.hasOpt('country') ? (' country: ' + opts.country) : '';

            var label = this.hasOpt('label') ? opts.label : opts.address;
            query += '  (' + label + ')';

            return query;
        }.bind(this);

        function getEmbedUrl() {
            if (typeof opts === 'undefined') {
                throw 'Options to get the embed url for MapQuest are not valid';
            }

            return MAP_URL + '/embed?icid=' + MAP_WEB_ID + '&q=' +
          encodeURIComponent(getEmbedQuery()) + '&zoom=' + zoom +
          '&maptype=map';
        }

        var getDirectionsQuery = function() {
            var query = opts.address;
            query += this.hasOpt('city') ? ' ' + opts.city : '';
            query += this.hasOpt('state') ? ' ' + opts.state : '';
            query += this.hasOpt('zip') ? ' ' + opts.zip : '';
            query += this.hasOpt('country') ? ' ' + opts.country : '';

            return query;
        }.bind(this);

        function getDirectionsUrl() {
            var promise = $.Deferred();

            if (typeof opts === 'undefined') {
                throw 'Options to get the directions url for MapQuest are not valid';
            }

            var mapDirectionsUrl = MAP_URL + '/directions?q2=' +
          encodeURIComponent(getDirectionsQuery()) + '&maptype=map';

            promise.resolve(mapDirectionsUrl);

            return promise;
        }

        /**
         * exposed
         */
        this.getEmbedUrl = getEmbedUrl;

        this.getDirectionsUrl = getDirectionsUrl;

        this.render = function($el) {
            $el.empty();

            var $iframeEl = $('<iframe>').attr('scrolling', 'no').css({
                'width' : '100%',
                'height' : '100%',
                'border' : 'none'
            });

            $el.append($iframeEl);

            $iframeEl.attr('src', this.getEmbedUrl());
        };
    }

    /**
     * WebMapQuest prototype
     */
    $.extend(WebMapQuest.prototype, WebMap.prototype, {
        MAP_WEB_ID : 'mqdist_webcom',

        MAP_URL : 'https://www.mapquest.com',

        MAP_ZOOM : 13,

    /**
     * Wheter the argument corresponds to an instance of this class or an embed
     * url which would turn into it when the map is created.
     * 
     * @param String
     *            embed url | Object webmap instance
     */
        isType : function(mixed) {
            return WebMap.prototype.isType(mixed)
                || (typeof mixed === 'string' && WebMapQuest.prototype.isValidEmbedUrl(mixed));
        },

        /**
         * Whether it is a valid embedUrl or not.
         * 
         * @static
         * @param String
         *            embed url
         */
        isValidEmbedUrl : function(embedUrl) {
            var matchValidUrlRegex = new RegExp('(' + this.MAP_URL + ')' + '?'
                + '/embed\\?icid=' + this.MAP_WEB_ID + '&q=(.*)');

            return typeof embedUrl === 'string' && embedUrl.match(matchValidUrlRegex) !== null;
        },

        /**
         * Retrieve map configuration from the iframe DOM element.
         * 
         * @static
         * @return Object with configuration
         */
        getConfigFromEl : function($iframeEl) {
            var mapConfig = {};

            var src = $iframeEl.attr('src');

            var q = webcom.util.HttpUtil.getParamFromUrl('q', src);

            if (q) {
                mapConfig = $.extend(true, {}, this.defaultMapConfig, {
                    address : decodeURIComponent(q).replace(/(\+)|(addr:\s?)|\(.*\)/g, ' ', '').trim(),
                });

                var zoom = webcom.util.HttpUtil.getParamFromUrl('zoom', src);
                if (zoom) {
                    mapConfig.zoom = zoom;
                }
            }

            return mapConfig;
        }
    });


    /**
     * @param opts
     *            object with options
     * @option renderWith specific to this implementation, 'jsApi' for using the
     *         js api, otherwise it will assume embed
     * @option String address
     * @option String city
     * @option String state
     * @option String zip
     * @option String country
     * @option String zoom
     * @option String apiKey
     */
    function WebGoogleMaps(opts) {
        WebMap.call(this, opts);

        var MAP_PLACE_URL = 'https://www.google.com/maps/embed/v1/place';

        var MAP_ZOOM = 15;

        var MAP_MODES = {
            'place' : 'place'
        };

        var zoom = opts.zoom ? opts.zoom : MAP_ZOOM;

        var mode = MAP_MODES.place;

        var getFullAddress = function() {
            var address = opts.address;
            address += this.hasOpt('city') ? (' ' + opts.city) : '';
            address += this.hasOpt('state') ? (' ' + opts.state) : '';
            address += this.hasOpt('zip') ? (' ' + opts.zip) : '';
            address += this.hasOpt('country') ? (' ' + opts.country) : '';

            return address;
        }.bind(this);

        function getEmbedPlaceUrl() {
            if (typeof opts === 'undefined') {
                throw 'Options to get the embed url for MapQuest are not valid';
            }

            var params = {
                q : getFullAddress()
            };

            return MAP_PLACE_URL + '?key=' + opts.apiKey + '&' + $.param(params) +
          '&zoom=' + zoom;
        }

        function getEmbedUrl() {
            switch (mode) {
            case MAP_MODES.place:
                return getEmbedPlaceUrl();
            }
        }

        function getDirectionsUrl() {
            var t = this;

            var promise = $.Deferred();

            var locationPromise = $.Deferred();
            if (opts.location && opts.location.lat && opts.location.lng) {
                locationPromise.resolve(opts.location);
            } else {
                locationPromise = t.getLocation(this.type, getFullAddress(), opts.apiKey);
            }

            $.when(locationPromise).done(function(location) {
              if (location && location.lat && location.lng) {
                  promise.resolve('https://www.google.com/maps/dir//' +
                  location.lat + ',' + location.lng + '/@' + location.lat +
                  ',' + location.lng);
              } else {
                  promise.reject();
              }
            });
            
            return promise;
        }

        /**
         * Render with Js API
         * 
         * @param Object
         *            jquery element to place the map, i.e. <div id="map">
         * @return promise
         */
        var jsApiMap = {};
        var markerInJsApiMap = {};
        function renderWithJsApi($el) {
          var promise = $.Deferred();
    
          var t = this;
    
          $.when(WebGoogleMaps.prototype.loadJsApi(opts.apiKey)).then(function() {
            loadMarkerWithLabelLib(jQuery);

            var locationPromise = $.Deferred();
            if (opts.location && opts.location.lat && opts.location.lng) {
              locationPromise.resolve(opts.location);
            } else {
              locationPromise = t.getLocation(t.type, getFullAddress(), opts.apiKey);
            }

            $.when(locationPromise).then(function(location) {
              if (location && location.lat && location.lng) {
                jsApiMap = new window.google.maps.Map($el.get(0), {
                  zoom : opts.zoom ? parseFloat(opts.zoom) : MAP_ZOOM,
                  center : location,
                  mapTypeControl: true,
                  mapTypeControlOptions: {
                    //style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                    position: google.maps.ControlPosition.TOP_RIGHT
                  }
                });

                //add place-card
                // Append card when map renders
                google.maps.event.addListener(jsApiMap, 'idle', function() {
                  var address = t.opts.address;

                  // var lat = t.opts.location.lat;
                  // var lng = t.opts.location.lng;
                  var lat = location.lat;
                  var lng = location.lng;

                  // Prevents card from being added more than once (i.e. when page is resized and google maps re-renders)
                  if ( $( ".place-card" ).length === 0 ) {
                  $(".gm-style").append('\
                    <div style="position: absolute; left: 0px; top: 0px;"> \
                        <div style="margin: 10px; padding: 1px; -webkit-box-shadow: rgba(0, 0, 0, 0.298039) 0px 1px 4px -1px; box-shadow: rgba(0, 0, 0, 0.298039) 0px 1px 4px -1px; border-radius: 2px; background-color: white;"> \
                            <div> \
                                <div class="place-card place-card-large"> \
                                    <div class="place-desc-large"> \
                                        <div class="place-name"> ' + address + ' </div>\
                                        <div class="address"> ' + address + ' </div>\
                                    </div>\
                                    <div class="navigate"> \
                                        <div class="navigate"> \
                                            <a class="navigate-link" href="https://maps.google.com/maps?ll='+lat+','+lng+'&amp;z=16&amp;t=m&amp;hl=en-US&amp;gl=PT&amp;mapclient=embed&amp;daddr='+address+'@'+lat+','+lng+'" target="_blank"> \
                                                <div class="icon navigate-icon"></div>\
                                                <div class="navigate-text"> Directions </div>\
                                            </a> \
                                        </div>\
                                        <!--\
                                        <div class="navigate-separator"> </div> \
                                        <div class="star-entity"> \
                                            <div class="star-button">\
                                                <div class="star-entity-icon-large"> \
                                                    <div class="icon can-star-large"> </div>\
                                                    <div class="icon logged-out-star" style="display:none"> </div>\
                                                </div>\
                                                <div class="star-entity-text hidden">Saved</div>\
                                                <div class="star-entity-text">Save</div>\
                                            </div>\
                                            <div class="tooltip-anchor">\
                                                <div class="tooltip-tip-outer"></div> \
                                                <div class="tooltip-tip-inner"></div> \
                                                <div class="tooltip-content"> \
                                                    <div>Save this place to your Google map.</div>\
                                                </div>\
                                            </div> \
                                        </div>\
                                        -->\
                                    </div>\
                                    <div class="review-box"> \
                                        <div class="" style="display:none"></div>\
                                        <div class="" style="display:none"></div>\
                                        <div class="" style="display:none"></div>\
                                        <div class="" style="display:none"></div>\
                                        <div class="" style="display:none"></div>\
                                        <div class="" style="display:none"></div>\
                                        <!--\
                                        <a href="https://plus.google.com/101643431012640484007/about?hl=en&amp;authuser=0&amp;gl=pt&amp;socpid=247&amp;socfid=maps_embed:placecard" target="_blank">1 review</a> \
                                        -->\
                                    </div>\
                                    <div class="saved-from-source-link" style="display:none"> </div>\
                                    <div class="maps-links-box-exp"> \
                                        <div class="time-to-location-info-exp" style="display:none"> \
                                            <span class="drive-icon-exp experiment-icon"></span>\
                                            <a class="time-to-location-text-exp" style="display:none" target="_blank"></a>\
                                            <a class="time-to-location-text-exp" style="display:none" target="_blank"></a> \
                                        </div>\
                                        <div class="google-maps-link"> \
                                            <a href="https://maps.google.com/maps?ll='+lat+','+lng+'&amp;z=16&amp;t=m&amp;hl=en-US&amp;gl=PT&amp;mapclient=embed&amp;q='+address+'" target="_blank">View larger map</a> \
                                        </div>\
                                    </div>\
                                    <div class="time-to-location-privacy-exp" style="display:none"> \
                                        <div class="only-visible-to-you-exp"> Visible only to you. </div>\
                                        <a class="learn-more-exp" target="_blank">Learn more</a> \
                                    </div>\
                                </div>\
                            </div>\
                        </div>\
                    </div>');
                  }
                });

                markerInJsApiMap = new MarkerWithLabel({
                    position : location,
                    map : jsApiMap,
                    labelContent : getFullAddress(),
                    labelStyle : opts.marker && opts.marker.labelStyle ? opts.marker.labelStyle : '',
                    labelClass : opts.marker && opts.marker.labelClass ? opts.marker.labelClass : ''
                });

                promise.resolve();
              } else {
                  var errMsg = 'Could not retrieve the location for this address: ' + getFullAddress();

                  console.log(errMsg);

                  promise.reject(errMsg);
              }
            }, function(status) {
                var errMsg = 'Could not retrieve the location for this address: ' + getFullAddress() + ', Google returned the following status: ' + status;

                console.log(errMsg);

                promise.reject(errMsg);
            });
          }, function() {

            promise.reject();

            throw 'Could not load google maps js API';

          });

          return promise;
        }
        
        /**
         * exposed
         */
        this.getEmbedUrl = getEmbedUrl.bind(this);

        this.getDirectionsUrl = getDirectionsUrl.bind(this);

        switch (opts.renderWith) {
            // override render method
            case 'jsApi':
              this.render = function($el) {
                  renderWithJsApi.call(this, $el);
              }
              break;
            default:
              this.render = WebMap.prototype.render.bind(this);
              break;
        };
    }

    WebGoogleMaps.prototype = $.extend(true, {}, WebMap.prototype, {
        type : 'WebGoogleMaps',
        
        MAP_PLACE_URL : 'https://www.google.com/maps/embed/v1/place',

        MAP_ZOOM : 15,

        MAP_MODES : {
            'place' : 'place'
        },

        /**
         * Wheter the argument corresponds to an instance of this class or an
         * embed url which would turn into it when the map is created.
         * 
         * @param String
         *            embed url | Object webmap instance
         */
        isType : function(mixed) {
            return WebMap.prototype.isType(mixed)
                || (typeof mixed === 'string' && WebGoogleMaps.prototype.isValidEmbedUrl(mixed));
        },

        /**
         * Whether it is a valid embedUrl or not.
         * 
         * @static
         * @param String
         *            embed url
         */
        isValidEmbedUrl : function(embedUrl) {
            var regex = new RegExp('(' + this.MAP_PLACE_URL + ')?' + '\\?key=.*&q=.*&zoom=\\d+');

            return typeof embedUrl === 'string' && embedUrl.match(regex) !== null;
        },

        /**
         * Retrieve map configuration from the iframe DOM element.
         * 
         * @static
         * @return Object with configuration
         */
        getConfigFromEl: function($iframeEl) {
            var mapConfig = {};

            var src = $iframeEl.attr('src');

            var config = src.match(/key=(.*)&q=(.*)&zoom=(\d+)/);
            if (config) {
                mapConfig = $.extend(true, {}, this.defaultMapConfig, {
                    apiKey : config[1],
                    address : decodeURIComponent(config[2]).replace(/\+/, ' ').trim(),
                    zoom : config[3]
                });
            }

            return mapConfig;
        },

        /**
         * Load google maps js api
         * 
         * @param String
         *            google maps api key
         * @static
         * @return promise
         */
        isLoadingJsApi : false,
        jsApiPromise : false,
        loadJsApi : function(apiKey) {
            var t = WebGoogleMaps.prototype;

            if (t.isLoadingJsApi || t.jsApiPromise && t.jsApiPromise.isResolved()) {
                return t.jsApiPromise;
            }

            t.jsApiPromise = $.Deferred();

            if (window.google && window.google.maps) {
                t.jsApiPromise.resolve();
            } else {
                t.isLoadingJsApi = true;

                var script = document.createElement('script');
                script.src = 'https://maps.googleapis.com/maps/api/js?key=' + apiKey;

                script.onload = function() {
                    t.jsApiPromise.resolve();
                };

                var head = document.getElementsByTagName('head')[0];
                head.appendChild(script);
            }

            return t.jsApiPromise;
        },


        /**
         * Get location from address
         * 
         * @static
         * 
         * @param String
         *            mapClassName passed by static call
         * @param String
         *            address
         * @param String
         *            google maps api key
         * 
         * @return promise
         */
        getLocation : function(mapClassName, address, apiKey) {
            var GEOCODE_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json?';

            var geoPromise = $.Deferred();

            var params = {
                address : address,
                key : apiKey
            };

            $.get(GEOCODE_API_URL + $.param(params), function(data) {
                if (data.status !== 'OK') {
                    geoPromise.reject(data.status);
                } else {
                    geoPromise.resolve(data.results[0].geometry.location);
                }
            });

            return geoPromise;
        }
    });

    /**
     * expose webmap, create maps through factory
     */

    window.webmap = {
        /**
         * Create a new map instance.
         * 
         * @static
         * @param String
         *            map class
         * @see mapClasses = {}
         * @param opts
         *            object with options
         * @option String address
         * @option String city
         * @option String state
         * @option String zip
         * @option String country
         * @option String optional proxy url,
         * @see WebMapProxy
         */
        'create' : function(mapClassName, opts) {
            if (typeof mapClasses[mapClassName] === 'undefined') {
                throw 'Unkown map type: ' + mapClassName;
            }

            if (opts.proxy) {
                return new WebMapProxy($.extend(opts, {
                    implementation : mapClassName
                }));
            }

            return new mapClasses[mapClassName](opts);
        },

        /**
         * Get map configuration from the iframe DOM element.
         * 
         * @static
         * @param jQuery
         *            element iframe
         * @return Object config or false
         */
        getConfigFromEl : function($iframeEl) {
            var mapClass = neo.webmap.getTypeFromEl($iframeEl);

            return mapClass ? mapClasses[mapClass].prototype.getConfigFromEl($iframeEl) : {};
        },

        /**
         * Get map type from iframe element.
         * 
         * @static
         * @param jQuery
         *            iframe el
         * @return String with map type
         */
        getTypeFromEl : function($iframeEl) {
            var classes = Object.keys(mapClasses);
            for (var i = 0; i < classes.length; i++) {
                var className = classes[i];

                var constructor = mapClasses[className];

                if (constructor.prototype.isType($iframeEl.attr('src'))) {
                    return className;
                }
            }

            return false;
        },

        /**
         * Get location from address (i.e. for Google Maps it is an object with
         * {lat, lng} values
         * 
         * @static
         * 
         * @param String
         *            map class name
         * @param String
         *            address
         */
        getLocation : function(mapClassName, address) {
            var prototype = mapClasses[mapClassName].prototype;

            return prototype.getLocation.apply(prototype, $.extend(true, [], arguments));
        }
    };
}());

/**
 * FG: the following is a dependency. It is a simplified version of the
 * markerlabel.js library (from Google).
 * 
 * @name MarkerWithLabel for V3
 * @version 1.1.10 [April 8, 2014]
 * @author Gary Little (inspired by code from Marc Ridey of Google).
 * @copyright Copyright 2012 Gary Little [gary at luxcentral.com]
 * @fileoverview MarkerWithLabel extends the Google Maps JavaScript API V3
 *               <code>google.maps.Marker</code> class.
 *               <p>
 *               MarkerWithLabel allows you to define markers with associated
 *               labels. As you would expect, if the marker is draggable, so too
 *               will be the label. In addition, a marker with a label responds
 *               to all mouse events in the same manner as a regular marker. It
 *               also fires mouse events and "property changed" events just as a
 *               regular marker would. Version 1.1 adds support for the
 *               raiseOnDrag feature introduced in API V3.3.
 *               <p>
 *               If you drag a marker by its label, you can cancel the drag and
 *               return the marker to its original position by pressing the
 *               <code>Esc</code> key. This doesn't work if you drag the
 *               marker itself because this feature is not (yet) supported in
 *               the <code>google.maps.Marker</code> class.
 */
function loadMarkerWithLabelLib($) {
    /**
     * /*!
     * 
     * Licensed under the Apache License, Version 2.0 (the "License"); you may
     * not use this file except in compliance with the License. You may obtain a
     * copy of the License at
     * 
     * http://www.apache.org/licenses/LICENSE-2.0
     * 
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
     * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
     * License for the specific language governing permissions and limitations
     * under the License.
     */

    /* jslint browser:true */
    /* global document,google */

    /**
     * @param {Function}
     *            childCtor Child class.
     * @param {Function}
     *            parentCtor Parent class.
     * @private
     */
    function inherits(childCtor, parentCtor) {
        /* @constructor */
        function tempCtor() {
        }
        tempCtor.prototype = parentCtor.prototype;
        childCtor.superClass_ = parentCtor.prototype;
        childCtor.prototype = new tempCtor();
        /* @override */
        childCtor.prototype.constructor = childCtor;
    }

    /**
     * This constructor creates a label and associates it with a marker. It is
     * for the private use of the MarkerWithLabel class.
     * 
     * @constructor
     * @param {Marker}
     *            marker The marker with which the label is to be associated.
     * @param {string}
     *            crossURL The URL of the cross image =.
     * @param {string}
     *            handCursor The URL of the hand cursor.
     * @private
     */
    function MarkerLabel_(marker, crossURL, handCursorURL) {
        this.marker_ = marker;
        this.handCursorURL_ = marker.handCursorURL;

        this.labelDiv_ = document.createElement("div");
        this.labelDiv_.style.cssText = "position: absolute; overflow: hidden;";
    }

    inherits(MarkerLabel_, google.maps.OverlayView);

    /**
     * Adds the DIV representing the label to the DOM. This method is called
     * automatically when the marker's <code>setMap</code> method is called.
     * 
     * @private
     */
    MarkerLabel_.prototype.onAdd = function() {
        this.getPanes().overlayMouseTarget.appendChild(this.labelDiv_);
    };

    /**
     * Draws the label on the map.
     * 
     * @private
     */
    MarkerLabel_.prototype.draw = function() {
        this.setContent();
        this.setStyles();
    };

    /**
     * Sets the content of the label. The content can be plain text or an HTML
     * DOM node.
     * 
     * @private
     */
    MarkerLabel_.prototype.setContent = function() {
        var content = this.marker_.get("labelContent");
        if (typeof content.nodeType === "undefined") {
            this.labelDiv_.innerHTML = content;
        } else {
            this.labelDiv_.innerHTML = ""; // Remove current content
            this.labelDiv_.appendChild(content);
        }
    };

    /**
     * Sets the style of the label by setting the style sheet and applying other
     * specific styles requested.
     * 
     * @private
     */
    MarkerLabel_.prototype.setStyles = function() {
        var i, labelStyle;

        // Apply style values from the style sheet defined in the labelClass
        // parameter:
        this.labelDiv_.className = this.marker_.get("labelClass");

        // Clear existing inline style values:
        this.labelDiv_.style.cssText = "";
        // Apply style values defined in the labelStyle parameter:
        labelStyle = this.marker_.get("labelStyle");
        for (i in labelStyle) {
            if (labelStyle.hasOwnProperty(i)) {
                this.labelDiv_.style[i] = labelStyle[i];
            }
        }
        this.setMandatoryStyles();
    };

    /**
     * Sets the mandatory styles to the DIV representing the label as well as to
     * the associated event DIV. This includes setting the DIV position,
     * z-index, and visibility.
     * 
     * @private
     */
    MarkerLabel_.prototype.setMandatoryStyles = function() {
        this.labelDiv_.style.position = "absolute";
        this.labelDiv_.style.overflow = "hidden";
        // Make sure the opacity setting causes the desired effect on MSIE:
        if (typeof this.labelDiv_.style.opacity !== "undefined"
                && this.labelDiv_.style.opacity !== "") {
            this.labelDiv_.style.MsFilter = "\"progid:DXImageTransform.Microsoft.Alpha(opacity="
                    + (this.labelDiv_.style.opacity * 100) + ")\"";
            this.labelDiv_.style.filter = "alpha(opacity="
                    + (this.labelDiv_.style.opacity * 100) + ")";
        }

        this.setPosition(); // This also updates z-index, if necessary.
    };

    /**
     * Sets the position of the label. The z-index is also updated, if
     * necessary.
     * 
     * @private
     */
    MarkerLabel_.prototype.setPosition = function(yOffset) {
        var position = this.getProjection().fromLatLngToDivPixel(
                this.marker_.getPosition());
        if (typeof yOffset === "undefined") {
            yOffset = 0;
        }
        this.labelDiv_.style.left = Math.round(position.x) + "px";
        this.labelDiv_.style.top = Math.round(position.y - yOffset) + "px";

        this.setZIndex();
    };

    /**
     * Sets the z-index of the label. If the marker's z-index property has not
     * been defined, the z-index of the label is set to the vertical coordinate
     * of the label. This is in keeping with the default stacking order for
     * Google Maps: markers to the south are in front of markers to the north.
     * 
     * @private
     */
    MarkerLabel_.prototype.setZIndex = function() {
        var zAdjust = (this.marker_.get("labelInBackground") ? -1 : +1);
        if (typeof this.marker_.getZIndex() === "undefined") {
            this.labelDiv_.style.zIndex = parseInt(this.labelDiv_.style.top, 10)
                    + zAdjust;
        } else {
            this.labelDiv_.style.zIndex = this.marker_.getZIndex() + zAdjust;
        }
    };

    /**
     * @name MarkerWithLabelOptions
     * @class This class represents the optional parameter passed to the
     *        {@link MarkerWithLabel} constructor. The properties available are
     *        the same as for <code>google.maps.Marker</code> with the
     *        addition of the properties listed below. To change any of these
     *        additional properties after the labeled marker has been created,
     *        call
     *        <code>google.maps.Marker.set(propertyName, propertyValue)</code>.
     *        <p>
     *        When any of these properties changes, a property changed event is
     *        fired. The names of these events are derived from the name of the
     *        property and are of the form <code>propertyname_changed</code>.
     *        For example, if the content of the label changes, a
     *        <code>labelcontent_changed</code> event is fired.
     *        <p>
     * @property {string|Node} [labelContent] The content of the label (plain
     *           text or an HTML DOM node).
     * @property {Point} [labelAnchor] By default, a label is drawn with its
     *           anchor point at (0,0) so that its top left corner is positioned
     *           at the anchor point of the associated marker. Use this property
     *           to change the anchor point of the label. For example, to center
     *           a 50px-wide label beneath a marker, specify a
     *           <code>labelAnchor</code> of
     *           <code>google.maps.Point(25, 0)</code>. (Note: x-values
     *           increase to the right and y-values increase to the top.)
     * @property {string} [labelClass] The name of the CSS class defining the
     *           styles for the label. Note that style values for
     *           <code>position</code>, <code>overflow</code>,
     *           <code>top</code>, <code>left</code>, <code>zIndex</code>,
     *           <code>display</code>, <code>marginLeft</code>, and
     *           <code>marginTop</code> are ignored; these styles are for
     *           internal use only.
     * @property {Object} [labelStyle] An object literal whose properties define
     *           specific CSS style values to be applied to the label. Style
     *           values defined here override those that may be defined in the
     *           <code>labelClass</code> style sheet. If this property is
     *           changed after the label has been created, all previously set
     *           styles (except those defined in the style sheet) are removed
     *           from the label before the new style values are applied. Note
     *           that style values for <code>position</code>,
     *           <code>overflow</code>, <code>top</code>,
     *           <code>left</code>, <code>zIndex</code>,
     *           <code>display</code>, <code>marginLeft</code>, and
     *           <code>marginTop</code> are ignored; these styles are for
     *           internal use only.
     * @property {boolean} [labelInBackground] A flag indicating whether a label
     *           that overlaps its associated marker should appear in the
     *           background (i.e., in a plane below the marker). The default is
     *           <code>false</code>, which causes the label to appear in the
     *           foreground.
     * @property {boolean} [labelVisible] A flag indicating whether the label is
     *           to be visible. The default is <code>true</code>. Note that
     *           even if <code>labelVisible</code> is <code>true</code>,
     *           the label will <i>not</i> be visible unless the associated
     *           marker is also visible (i.e., unless the marker's
     *           <code>visible</code> property is <code>true</code>).
     * @property {boolean} [raiseOnDrag] A flag indicating whether the label and
     *           marker are to be raised when the marker is dragged. The default
     *           is <code>true</code>. If a draggable marker is being created
     *           and a version of Google Maps API earlier than V3.3 is being
     *           used, this property must be set to <code>false</code>.
     * @property {boolean} [optimized] A flag indicating whether rendering is to
     *           be optimized for the marker. <b>Important: The optimized
     *           rendering technique is not supported by MarkerWithLabel, so the
     *           value of this parameter is always forced to <code>false</code>.
     * @property {string}
     *           [crossImage="http://maps.gstatic.com/intl/en_us/mapfiles/drag_cross_67_16.png"]
     *           The URL of the cross image to be displayed while dragging a
     *           marker.
     * @property {string}
     *           [handCursor="http://maps.gstatic.com/intl/en_us/mapfiles/closedhand_8_8.cur"]
     *           The URL of the cursor to be displayed while dragging a marker.
     */
    /**
     * Creates a MarkerWithLabel with the options specified in
     * {@link MarkerWithLabelOptions}.
     * 
     * @constructor
     * @param {MarkerWithLabelOptions}
     *            [opt_options] The optional parameters.
     */
    
    var defaultLabelStyle = {
        'color': '#962B2B',
        'background': 'transparent',
        'font-family': 'Roboto, sans-serif',
        'font-size': '12px',
        'font-weight': 'bold',
        'text-align': 'left',
        'text-shadow': '2px 0 0 #fff'
    }
    
    function MarkerWithLabel(opt_options) {
        opt_options = opt_options || {};
        opt_options.labelContent = opt_options.labelContent || "";
        opt_options.labelAnchor = new google.maps.Point(0, 0);
        opt_options.labelClass = opt_options.labelClass || "markerLabels";
        
        
        opt_options.labelStyle = opt_options.labelStyle || defaultLabelStyle;
        
        opt_options.labelInBackground = false;
        opt_options.labelVisible = true;
        opt_options.raiseOnDrag = false;
        opt_options.clickable = false;
        opt_options.draggable = false;
        opt_options.optimized = false;
        opt_options.crossImage = "http"
                + (document.location.protocol === "https:" ? "s" : "")
                + "://maps.gstatic.com/intl/en_us/mapfiles/drag_cross_67_16.png";
        opt_options.handCursor = "http"
                + (document.location.protocol === "https:" ? "s" : "")
                + "://maps.gstatic.com/intl/en_us/mapfiles/closedhand_8_8.cur";
        opt_options.optimized = false; // Optimized rendering is not supported

        // opt_options.icon = {
        //     path : google.maps.SymbolPath.CIRCLE,
        //     scale: 5
        // }

        this.label = new MarkerLabel_(this, opt_options.crossImage,
                opt_options.handCursor); // Bind the label to the marker

        // Call the parent constructor. It calls Marker.setValues to initialize,
        // so all
        // the new parameters are conveniently saved and can be accessed with
        // get/set.
        // Marker.set triggers a property changed event (called
        // "propertyname_changed")
        // that the marker label listens for in order to react to state changes.
        google.maps.Marker.apply(this, arguments);
    }

    inherits(MarkerWithLabel, google.maps.Marker);

    /**
     * Overrides the standard Marker setMap function.
     * 
     * @param {Map}
     *            theMap The map to which the marker is to be added.
     * @private
     */
    MarkerWithLabel.prototype.setMap = function(theMap) {

        // Call the inherited function...
        google.maps.Marker.prototype.setMap.apply(this, arguments);

        // ... then deal with the label:
        this.label.setMap(theMap);
    };
    
    window.MarkerWithLabel = MarkerWithLabel;
}