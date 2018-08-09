(
  function () {
    var VERSION = "1.1";
    var NAME    = "com.web.components.navigation";
    var scripts = ["js/superfish.js", "js/handler.js", "js/helper.js", "js/positioner.js"];
    var styles  = ["css/structure.css"];

    //foreign resources
    WebCom.ResourceLoader.loadScript("com.jquery", null, "hoverIntent.js");  
    WebCom.ResourceLoader.loadScript("com.jquery", null, "bgIframe.js");

    WebCom.ResourceLoader.importLib(new WebCom.ResourceLoader.Library("WebCom.Components.Navigation", NAME, VERSION, scripts, styles ));
  }
)();
