/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
(function () {
  
  if (typeof (WebCom) == 'undefined') {
    WebCom = {};
  }
  
  /*private class*/ function Resource (/*RC_TYPE*/ type, /*ResourceLocator*/ locator, /*Object*/ _statusHandler) {
    this.type = type;
    this.locator = locator;
    var statusHandler = _statusHandler;

    this.getURL = function () {
      return this.locator.getURL();
    };

    this.getStatusHandler = function() {
      return statusHandler;
    }
  };

  /*private class*/ function ResourceLocator (baseURL, fileName) {
    this.baseURL = baseURL;
    this.fileName = fileName;

    this.getBaseURL = function() {
      return this.baseURL;
    };

    this.getURL = function () {
      if (this.fileName != "") {
        return this.baseURL + "/" +  this.fileName;
      } else {
        return this.baseURL;
      }
    };
  };

  /*private class*/ function LibraryWrapper(_libHandle) {
    var libHandle = _libHandle;

    this.getResourceURL = function (/*String*/ resourcePath) {
      return libHandle.getResourceURL(resourcePath);
    };

    this.loadResource = function (/*String*/ resourcePath, /*String*/ resourceType) {
      return libHandle.getResourceURL(resourcePath, resourceType);
    };

  };

  /*public class*/ function Library(/* [String runtimeName], String packageName, String version, String[] scripts, String[] styles*/) {
      var args = Array.prototype.slice.call(arguments);

      if (args.length == 5) {
        this.runtimeName = args.shift();
        WebCom.ResourceLoader.makeNameSpace(this.runtimeName);
        //var libWrapper = new LibraryWrapper(this);
        //var constructorName = parts.join("_");
        //eval(constructorName  + ".prototype = libWrapper;"); //
        //eval(this.runtimeName  + "= new " + constructorName + "();");
      }

      this.packageName = args[0];
      this.version = args[1];
      this.scripts = args[2];
      this.styles = args[3];

      this.getRuntimeName = function () {
        return this.runtimeName;
      }

      this.getPackageName = function () {
        return this.packageName;
      };

      this.getVersion = function () {
        return this.version;
      };

      this.getScripts = function () {
        return this.scripts;
      };

      this.getStyles = function () {
        return this.styles;
      };

      this.getResourceURL = function (/*String*/ resourcePath) {
        return WebCom.ResourceLoader.getResourceURL(resourcePath, this);
      };

      //TODO: review if we need to expose the defer flag as well
      this.loadResource = function (/*String*/ resourcePath, /*Object*/ statusHandler, /*String*/ _resourceType) {
        if (resourcePath == null) {
          throw new Error("resource path cannot be empty");
        }

        var resourceType = _resourceType;
        if (resourceType != null) {
          if (!WebCom.ResourceLoader.isResourceSupported(resourceType)) {
            throw new Error("Unsuported resource type " + resourceType );
          }
        } else {
          resourceType = WebCom.ResourceLoader.getResourceType(resourcePath);
        }

        //load it now. no deferral!
        WebCom.ResourceLoader._loadResource(this.packageName, this.version, resourceType, null, resourcePath, false, statusHandler);
      };
  };

  function WebCom_ResourceLoader() {
    var counter = 0;
    var RC_TYPE = { SCRIPT : "SCRIPT",
      STYLE : "STYLE"
    };
    
    this.RC_TYPE = RC_TYPE;
    
    var C_LATEST_VERSION_IDENTIFIER = "latest";
    //protocol relative
//    var SHARED_URL = "http://assets.myregisteredsite.com";
//    var SHARED_URL = "http://assets.wspdev.net";
//    var SHARED_SECURE_URL = "https://secure.websitepros.com/assets.myregisteredsite.com";
    var SHARED_URL = "https://assets.myregisteredsite.com";
    var SHARED_SECURE_URL = "https://assets.myregisteredsite.com";
    
  //exportsite
  	if( typeof(window['matrixMiscInfo'])!='undefined' && typeof(window['matrixMiscInfo'].isExportSite) != 'undefined' && window['matrixMiscInfo'].isExportSite === true) {
  	  SHARED_URL = "//exportedassets.myregisteredsite.com";
  	  SHARED_SECURE_URL = "//exportedassets.myregisteredsite.com";  		
  	}
  
    var versionsMixEnabled = false;
    var isShared = true;
    var isSecure = false;
    var resourceCache = {};
    var librariesRegistry = {};
    var resourcesQueue = [];

    var isDocumentClosed = false;
    var userAgent = navigator.userAgent.toLowerCase();
    var browser = {msie: /msie/.test( userAgent ) && !/opera/.test( userAgent )};

    var privateURI = "";
    var queueInProgress = false;
    
    //holds the default extension per resource type    
    var rcExtensionMap = {};
      rcExtensionMap[RC_TYPE.SCRIPT] = "js";
      rcExtensionMap[RC_TYPE.STYLE]  = "css";
      
    //holds the starting URI per resource type
    var rcBaseURIMap = {};
      rcBaseURIMap[RC_TYPE.SCRIPT] = "javascript";

    /**
     * Builds the locator for given named versioned resource. If <code>_isShared</code>
     * is not set then the loader's isShared member value is used. If shared the 
     * resource will be relative to a shared URL. Otherwise it will be be relative
     * to the host page this loader was referenced from. Locator rules
     * 
     * 1. Folders are per Java package convention
     * 2. Top package is appended per resource type (ie js/, css/)
     * 3. File name is built from last dot occurence till the end
     * 
     * Examples: 
     * 
     * "com.jquery", null , false -> js/com/jquery/latest/jquery.js
     * "com.web.coolapp", null , false -> js/com/web/coolapp/coolapp.js
     * 
     * @param name per Java package convention
     * @param version if null will default to 'latest' when resolving the URI
     * @param type 
     * @param _isShared if true a shared URL will be used. otherwise the URL will
     *        be relative to page this loader resides on
     */
    
    /*private ResourceLocator*/ function getResourceLocator(/*string*/name, /*string*/ version, /*RC_TYPE*/ type, /*boolean*/ _isShared) {

      if (name == "") {
        throw new Error("Resource name cannot be empty!");
      }
      
      if (typeof _isShared == 'undefined') {
        _isShared = isShared;
      }
      
      var url = "";
      if (_isShared) {
        url = isSecure ? SHARED_SECURE_URL : SHARED_URL;
      } else {
        if (privateURI != "") {
          var location = window.location;
          url = location.protocol + "//" + location.host + ":" + location.port + "/" + privateURI;
        } else {
          url = window.location.toString();
          url = url.substring(0, url.lastIndexOf("/"));
        }
      }

      var baseUri = "";
      var baseName = "";
      if (name.indexOf(".") != -1 ) {
        baseUri = name.replace(/\./g, '/');
        var parts = name.split(".");
        baseName = parts[parts.length - 1];        
      } else {
        baseUri = baseName = name;        
      }
      
      baseUri = url + "/" + rcBaseURIMap[type] + "/" + baseUri + "/" +  version;

      return new ResourceLocator(baseUri, baseName + "." + rcExtensionMap[type]);
    };

    function isResourceSupported(resourceType) {
      return resourceType !=null && resourceType.match(/^js|css$/) != null;
    };

    function getResourceType (/*String*/ resourcePath) {
      if (resourcePath == null) {
        throw new Error("resource path cannot be empty");
      }

      var extension;
      if (extension = resourcePath.match(/js|css$/) != null) {
        return (extension[0] == "js") ? RC_TYPE.SCRIPT : RC_TYPE.STYLE;
      } else {
        throw new Error("Unsuported resource type " + resourcePath );
      }
    };

    function loadResource(/*string*/ resourcePath) {
      var resource = new Resource(RC_TYPE.SCRIPT, new ResourceLocator(this.getResourceURL(resourcePath)));
      if (isDocumentClosed) {
        injectResourceIntoDOM_createElement(resource);
      } else {
        resourcesQueue.push( resource );
      }
    };

    
    /**
     * Loads the resource identified by <code>name</code>, <code>version</code>
     * and <code>relativePath</uri> into current DOM. If <code>deferred<code> is true the
     * loading will occur at a later time when {@link #flushResourcesQueue} is 
     * invoked.
     * 
     * @param name per Java package convention
     * @param version if null will default to 'latest' when resolving the URI
     * @param type 
     * @param _isShared if true a shared URL will be used. otherwise the URL will
     *        be relative to page this loader resides on
     * @param relativePath relative to baseURL of <code>name</code>/<code>version</code>
     * @param deferred whether to inject it now into DOM or deferr it for later
     * 
     * @throws Error if mixing is currently disabled and an attempt to mix 
     *                different version of a library is detected
     */
    
    /*private*/ function _loadResource (/*string*/name, /*string*/ version, /*RC_TYPE*/ type, /*boolean*/ _isShared,
                           /*string*/ relativePath, /*boolean*/ deferred, /*Object*/ statusHandler) {

      if (name == "") {
        return; //nothing to do really w/ an empty component
      }
      
      if (version == null || version == "") {
        version = C_LATEST_VERSION_IDENTIFIER; //empty version we can handle
      }
      
      var libraryKey = name + "_" +  version;
      var resourceKey = (relativePath != null && relativePath.length > 0) ? libraryKey + "_" + relativePath : libraryKey;
      if (resourceCache[libraryKey] != null) {
        if (!versionsMixEnabled && librariesRegistry[name] != version) {
          throw new Error("Version " + librariesRegistry[name] + " of " + name +
            " is already loaded. Cannot load " + version + " at the same time!" );
        }
        
        if (resourceCache[resourceKey] == null) {
          resourceCache[resourceKey] = new ResourceLocator(resourceCache[libraryKey].getBaseURL(), relativePath);
        } else {
          return;          
        }
      } else {
        if (libraryKey != resourceKey) {
          throw new Error("A dependent resource cannot be loaded w/o loading its parent library");
        }
        librariesRegistry[name] = version;
        resourceCache[libraryKey] = getResourceLocator(name, version, type, _isShared);
      }

      if (deferred) {
        if (isDocumentClosed) {
          throw new Error("Cannot defer after the document is closed");
        }
        resourcesQueue.push( new Resource(type, resourceCache[resourceKey] ) );
      } else {
        injectResourceIntoDOM( new Resource(type, resourceCache[resourceKey], statusHandler ) );
      }
    };

    function getResourceURL(/*string*/ resourcePath, /*Library*/ library) {
      if (library != null) {
        var libraryKey = library.getPackageName() + "_" +  library.getVersion();
        if (resourceCache[libraryKey] != null) {
            return new ResourceLocator(resourceCache[libraryKey].getBaseURL(), resourcePath).getURL();
        } else {
          throw new Error("Load the library first then ask for a dependent resource!");
        }
      } else {
        return isSecure ? SHARED_SECURE_URL : SHARED_URL + "/" + resourcePath;
      }
    };

    /**
     * Injects the <code>resource</code> into DOM by generating the appropriate
     * markup. Currently SCRIPT and STYLE elements are supported.
     *
     * @param resource
     */
    
    /*private*/ function injectResourceIntoDOM(/*Resource*/ resource) {
      (isDocumentClosed) ? injectResourceIntoDOM_createElement(resource) : injectResourceIntoDOM_documentWrite(resource);
    };

    /*private*/function injectResourceIntoDOM_documentWrite(/*Resource*/ resource) {
      if (resource.type == RC_TYPE.SCRIPT) {
        document.write("<script src='" + resource.getURL() + "'><\/script>");
      } else if (resource.type == RC_TYPE.STYLE) {
        document.write("<link href='" + resource.getURL() + "' rel='stylesheet'></link>");
      }
    };

    /*private*/function injectResourceIntoDOM_createElement(/*Resource*/ resource) {
      var head = document.getElementsByTagName("head")[0] || document.documentElement;
      if (resource.type == RC_TYPE.SCRIPT) {
        var script = document.createElement("script");

        script.type = "text/javascript";
        script.src= resource.getURL();

        //TODO: inject status handler support here

        head.insertBefore( script, head.firstChild );
      } else if (resource.type == RC_TYPE.STYLE) {
        var style = document.createElement("link");
        style.rel = "StyleSheet";
        style.type = "text/css";
        style.href = resource.getURL();
        head.appendChild(style);
      }
    };

    /**
     * Queues for DOM injection script dependency identified by <code>uri</code>.
     * The URI is relative to the library's base URL.
     * 
     * @param name per Java package convention
     * @param version if null will default to 'latest' when resolving the URI
     * @param uri relative to library identified by <code>name</code> and <code>version</code>
     */

    /*public*/ function loadScript (/*string*/name, /*string*/ version, /*string*/ uri ) {
      _loadResource(name, version, RC_TYPE.SCRIPT, null, uri, true);
    };

    /**
     * Queues for DOM injection style dependency identified by <code>uri</code>.
     * The URI is relative to the library's base URL.
     * 
     * @param name per Java package convention
     * @param version if null will default to 'latest' when resolving the URI
     * @param uri relative to library identified by <code>name</code> and <code>version</code>
     */

    /*private*/ function loadStyle (/*string*/name, /*string*/ version, /*string*/ uri) {
      _loadResource(name, version, RC_TYPE.STYLE, null, uri, true);
    };    
    
    /**
     * Loads the library identified by <code>name</code> and <code>version</code>
     * into the current document. It will inject the lib's bootstraper into the 
     * DOM synchronously
     * 
     * @param name per Java package convention
     * @param version if null will default to 'latest' when resolving the URI
     * @param isShared if true a shared URL will be used. otherwise the URL will
     *        be relative to page this loader resides on
     */
    
    /*private*/ function loadLib (/*string*/name, /*string*/ version, /*boolean*/ isShared ) {
      _loadResource(name, version, RC_TYPE.SCRIPT, isShared, null, false);
    };
    
    
    /**
     * This method is designed to be invoked from a library's bootstrap loader 
     * loaded via loadLib (name, version, isShared) call. Dependent resources
     * will be queued for DOM injection. The actual injection occurs when calling 
     * {@link #flushResourcesQueue}. This is mainly to ensure browsers load the
     * styles in the desired order. Two scripts blocks are generally needed. One
     * for the boostrapers and another one to flush the queue and load all the 
     * dependent scripts and styles. 
     * 
     * @param name per Java package convention
     * @param version if null will default to 'latest' when resolving the URI
     * @param uri relative to library identified by <code>name</code> and <code>version</code>
     * 
     * {@see Library}
     */
    
    /*public*/ function importLib (/*Library*/ library) {
      var name = library.getPackageName();
      var version = library.getVersion();
      
      /* If library was loaded w/o a version simply use 'latest' as its version
         rather then actual version to satisfy all dependencies checks 
       */
      if (librariesRegistry[name] == C_LATEST_VERSION_IDENTIFIER) {
        version = C_LATEST_VERSION_IDENTIFIER;
      }

      var scripts = library.getScripts();
      var i;
      
      for (i=0; i< scripts.length; i++) {
        loadScript(name, version, scripts[i]);
      }
      
      var styles  = library.getStyles();
      for (i=0; i < styles.length; i++) {
        loadStyle(name, version, styles[i]);
      }
    };    

    /**
     * Sets the secure flag. If set a secure URL will be used.
     *
     * @param _isSecure
     */
    
    /*public*/ function setSecure (/*boolean*/ _isSecure) {
      isSecure = _isSecure;
    };
    
    /**
     * Sets the shared flag. If shared all resources will be relative to a shared
     * URL unless private (non-shared) loading was requested explicitly for a 
     * given resource. Otherwise they would be relative to host page this loader
     * was referenced from. This will allow storing/serving all resources self 
     * contained under each website.
     * 
     * @param isShared
     */
    
    /*public*/ function setShared (/*boolean*/ _isShared) {
      isShared = _isShared;
    };

    /**
     * Tells ResourceLoader the document is closed and it should use alternative
     * means for injecting resources into it rather then document.write
     *
     * @param isDocumentClosed
     */

    /*public*/ function setDocumentClosed(/*boolean*/ _isDocumentClosed) {
      isDocumentClosed = _isDocumentClosed;
    }
    
    
    /**
     * Set this when the URL cannot be inferred from the host page (ie not all 
     * the  pages are in the same folder). <code>_privateURI</code> will be 
     * appended to the domain of the host page if specified.
     *
     * @param _privateURI
     */
    
    /*public*/ function setPrivateURI (/*string*/ _privateURI) {
      privateURI = _privateURI;
    };
    

    /**
     * Sets the versions mix flag. If mixing is disabled then an error will be
     * generated when trying to load a different version of resource already
     * loaded at a different version
     * 
     * @param _versionsMixEnabled
     */
    
    /*public*/ function enableVersionsMix(/*boolean*/ _versionsMixEnabled) {
      versionsMixEnabled = _versionsMixEnabled;
    };


    /**
     * Generates document writes for all resources queued so far for loading
     * 
     */
    
    /*public*/ function flushResourcesQueue () {
      if (queueInProgress ) {
        return;
      }
    
      queueInProgress = true;
      
      while ( resourcesQueue.length > 0) {
        injectResourceIntoDOM( resourcesQueue.shift() );
      }
      
      queueInProgress = false;
    };

    /*public*/ function makeNameSpace(/*String*/ packageName) {
      var parts = packageName.split(".");
      var pkgExists;
      var pkgName = "";
      for (var i=0; i < parts.length; i++) {
        pkgName += ((pkgName != "") ? "." : "") + parts[i];
        eval ("pkgExists = typeof " + pkgName + ";");
        if (pkgExists != 'object') {
          eval (pkgName + " = {};");
        }
      }
    };

    this.flushResourcesQueue = flushResourcesQueue;
    this.setPrivateURI = setPrivateURI;    
    this.enableVersionsMix = enableVersionsMix;
    this.setShared = setShared;
    this.setSecure = setSecure;
    this.loadLib = loadLib;
    this.importLib = importLib;    
    this.loadScript = loadScript;
    this.loadResource = loadResource;
    this._loadResource = _loadResource;
    this.getResourceURL = getResourceURL;
    this.getResourceType = getResourceType;
    this.isResourceSupported = isResourceSupported;
    this.makeNameSpace = makeNameSpace;
    this.setDocumentClosed = setDocumentClosed;
    this.SHARED_URL = SHARED_URL;
    
    return this;
  };

  //public static class
  WebCom.ResourceLoader = new WebCom_ResourceLoader();
  WebCom.ResourceLoader.Library = Library;
  
  
  /* COMPONENT LOADER */
  /*private class*/ function WebCom_ComponentLoader() {

      var components = [];
      
      /*public void*/function initComponent(name, version, className, data, onRenderComplete) {
        if(name) {
          //Add component to queue for init
          components.push({
            'name': name, 
            'className': className,
            'version': version, 
            'data': data,
            'onRenderComplete': onRenderComplete
          });
          //Load the component JS file
          WebCom.ResourceLoader.loadLib(name, version, true);
        }
      };
      
      /*public void*/function flushQueue() {
        for(var i=0;i<components.length;i++) {
          startComponent(components[i].className, components[i].data, components[i].onRenderComplete);
        }
        components = [];
      }
      
      /*private void*/function startComponent(className, data, onRenderComplete) {
        var componentClass = eval(className);
              
        if (componentClass && typeof(componentClass.initInstances) == 'function') {
          componentClass.initInstances(data , {listeners: {'renderComplete' : {handler: function() { if(typeof(onRenderComplete) == 'function') { onRenderComplete();}} }}});
        }
      }
      
      this.initComponent = initComponent;
      this.flushQueue = flushQueue;
      
      return this;
  }
  //public static class
  WebCom.ComponentLoader = new WebCom_ComponentLoader();
}) ();
