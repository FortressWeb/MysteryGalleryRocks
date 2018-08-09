
var WebCom_Components_FooterContact_Default_Template  = {
  getMarkupText : function(component)  {

    var template = '\
      <div class="footer_contact_component">\
        <a class="footer_contact_email" href="mailto:${email}">${emailHtml}</a>\
        <div class="fc_overlay"></div>\
        <div class="fc_container">\
          <div class="fc_inner">\
            <div id="fc_form_header">\
              Contact Us\
            </div>\
            <div class="fc_margin">\
              <a href="javascript:void(0)" title="Close" class="fc_close"></a>\
              <div id="fc_form_container">\
                <div class="fc_form_required">\
                * Required Field\
                </div>\
              </div>\
            </div>\
          </div>\
        </div>\
      </div>';

    
    return template;
  }
};
//Defaults
var WebCom_Components_FooterContact_Template_MasterTemplate_Publish = WebCom_Components_FooterContact_Default_Template;
var WebCom_Components_FooterContact_Template_MasterTemplate_Preview = WebCom_Components_FooterContact_Default_Template;
var WebCom_Components_FooterContact_Template_MasterTemplate_Edit    = WebCom_Components_FooterContact_Default_Template;
