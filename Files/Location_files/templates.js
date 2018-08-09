var WebCom_Components_MapQuest_Default_Template = {
  getMarkupText : function(component) {
    var template = '';

    var formattingValues = component.getFormattingValues();

    var style = "width:" + formattingValues.mapWidth + "px;height:" + formattingValues.mapHeight + "px;";

    var directionsHtml = '';
    if (formattingValues.mapShowDirections == true) {
        directionsHtml = '<a target="_blank" href="${mapDirectionsUrl}" class="directions-button ${mapDirectionsAlign}"></a>';
    }

    switch (formattingValues.mapType) {
    case 'WebMapQuest':
      var embedHtml = '    <iframe src="${mapUrl}" style="' + style + '" frameborder="0"${onload}>' + '</iframe>';


      template ='<div class="map-container">\
                  <div class="inner-map-container ${mapAlign}" style="' + style + '">\
                      ${editOverlay}\
                         <div class="map-address">\
                              <span>${address} ${address_2}</span>\
                              <span>${city}, ${state} ${zip} ${country}</span>\
                          </div>\
                      <div class="map-source">' + embedHtml + directionsHtml + '</div>\
                   </div>\
              </div>';
      break;
      
    case 'WebGoogleMaps':
      template = '<div class="map-container">\
                        <div class="inner-map-container ${mapAlign}" style="' + style + '">\
                        ${editOverlay}\
                           <div class="map-address">\
                                <span>${address} ${address_2}</span>\
                                <span>${city}, ${state} ${zip} ${country}</span>\
                            </div>\
                        <div class="map-source" style="' + style + '">\
                          <div class="google-map" style="width: inherit; height: inherit"></div>\
                        </div>\
                    </div>\
                  </div>';

      break;
    }
    
    return template;
  }
}

// Defaults
var WebCom_Components_MapQuest_Template_MasterTemplate_Publish = WebCom_Components_MapQuest_Default_Template;
var WebCom_Components_MapQuest_Template_MasterTemplate_Preview = WebCom_Components_MapQuest_Default_Template;
var WebCom_Components_MapQuest_Template_MasterTemplate_Edit = WebCom_Components_MapQuest_Default_Template;
