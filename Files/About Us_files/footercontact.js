(
  function () {
    var VERSION = "1.0";
    var NAME    = "com.web.components.footercontact";
    var scripts = ["js/templates.js"];
    var styles  = ["css/footercontact.css"];
    
    WebCom.ResourceLoader.loadLib("com.jquery", null, true);
    WebCom.ResourceLoader.loadScript("com.jquery", null, "jquery.json-2.2.min.js");
    WebCom.ResourceLoader.loadLib('com.jqueryvalidate', '', true);
    WebCom.ResourceLoader.loadLib('com.web.components.form', '1.0', true);
    var lib = new WebCom.ResourceLoader.Library("WebCom.Components.FooterContact", NAME, VERSION, scripts, styles );
    WebCom.ResourceLoader.importLib(lib);

    function WebCom_Components_FooterContact() {

      WebCom.Components.Component.apply(this,[lib]);
      
      var self = this;
      var config = null;
      var isFooterContactShowing = false;

      this.init = function (id, config) {
        self.id = id;
        self.renderMode = config.miscData.renderMode;
        self.config = config;

        if (config.listeners) {
          for (var eventName in config.listeners) {
            self.on(eventName, config.listeners[eventName].handler, config.listeners[eventName].scope);
          }
        }

        formattingValues = {
          instanceId: self.id,
          q: config.miscData.q,
          email: config.componentData.email,
          emailHtml: (config.componentData.emailHtml == undefined) ? config.componentData.email : config.componentData.emailHtml
        };
      };
      
      this.getMasterTemplate = function(/*RenderMode*/ mode) {
        return self.getTemplate("MasterTemplate", mode);
      };
  
      this.getFormattingValues = function () {
        if (self.renderMode == 'Edit') {
          formattingValues.onload = '';
        }  
        return formattingValues;
      };

      resizeOverlay = function() {

        $('.fc_overlay').css('width', getFullWidth());
        $('.fc_overlay').css('height', getFullHeight());
        
        function getFullHeight() {  
          return Math.max(  
              $(document).height(),  
              $(window).height(),  
              document.documentElement.clientHeight  
          );  
        };  
        
        function getFullWidth() {  
          return Math.min(  
              $(document).width(),  
              $(window).width(),
              $('html').width(),  
              document.documentElement.clientWidth 
          );  
        };  
      };
      
      this.redirectFromForms = function() {
        var strHref = window.location.href;
        if ( strHref.indexOf("#fc_form_container") > -1 ) {
          return true;
        }
        return false;
      };

      this.setupCloseDialog = function() {
        function closeFormWindow() {
          isFooterContactShowing = false;
          if(self.redirectFromForms()) {
            window.location = window.location.href.replace('#fc_form_container?Ok','');
          } else {
            self.closeWindow();
          }
        }

        $('.fc_close').click(function() {
          closeFormWindow();
        });
        $(document).keyup(function(e) {
          if (e.keyCode == 27 && isFooterContactShowing) {
            closeFormWindow();              
          }
          return true;
        });
      }
      
      this.onLoad = function(instance) {
        //Init Form
        $(window).resize(resizeOverlay);
        this.initContactForm();
        this.setupCloseDialog();

        if(self.redirectFromForms()) {
          //If it is a redirect from the forms webapp, show thank you message.
          self.showFooterContactDialog(instance);
        } else {
          //Direct visit to website, show form when user clicks the email link
          if (self.renderMode != 'Edit') {
            $('.footer_contact_email').click(function(){
              self.showFooterContactDialog(instance);
              return false;
            });
          }
        }

      };

      this.closeWindow = function () {
        $('.fc_overlay').hide();
        $('.fc_container').hide();
      }

      this.showFooterContactDialog = function(instance) {
        var self = this;
        isFooterContactShowing = true;
        $('.fc_container').show();
        $('.fc_overlay').show();
        resizeOverlay();
        
        $('.fc_container').css('left', ($(window).width()/2)-$('#fc_form_container').width()/2);
      };

      this.initContactForm = function() {
        var formData = {
            "id": "fc_form_container",
            "componentData": {
                "form": {
                    "id": "webcom-layout-area",
                    "template": "ContactUs",
                    "title": "",
                    "formProcessorUrl": "#",
                    "description": "",
                    "name": "Test",
                    "settings": {
                        "emailDelivery": "copy",
                        "form2db": false,
                        "isSecure": false,
                        "postSubmission": {
                            "message": "Thanks for your submission!",
                            "errorValue": "Oops! There was a problem submitting your form. Please try again.",
                            "type": "showMessage",
                            "url": "http://yourdomain.com/thankyou.html"
                        },
                        "formatting": {
                            "useCustomStyle": true,
                            "errorMsgColor": "#c70202",
                            "postSubmissionMsgColor": "",
                            "requiredTextColor": "#c70202",
                            "label": {
                                "fontWeight": "",
                                "color": "",
                                "fontFace": "",
                                "size": ""
                            },
                            "formAlignment": ""
                        }
                    },
                    "creationTime": {},
                    "elements": [{
                        "height": "medium",
                        "validators": [],
                        "isRequired": true,
                        "name": "Name",
                        "width": "large",
                        "children": [],
                        "label": "Name",
                        "type": "TextBox",
                        "defaultValue": "",
                        "options": {}
                    }, {
                        "height": "medium",
                        "validators": [{
                            "type": "Email"
                        }],
                        "isRequired": true,
                        "name": "customer-email",
                        "width": "large",
                        "children": [],
                        "label": "Email",
                        "type": "Email",
                        "defaultValue": "",
                        "options": {}
                    }, {
                        "height": "medium",
                        "validators": [],
                        "isRequired": false,
                        "name": "subject",
                        "width": "large",
                        "children": [],
                        "label": "Subject",
                        "type": "TextBox",
                        "defaultValue": "",
                        "options": {}
                    }, {
                        "height": "medium",
                        "validators": [],
                        "isRequired": false,
                        "name": "message",
                        "width": "large",
                        "children": [],
                        "label": "Message",
                        "type": "TextArea",
                        "defaultValue": "",
                        "options": {}
                    }, {
                        "height": "medium",
                        "validators": [],
                        "isRequired": false,
                        "name": "Submit",
                        "width": "small",
                        "value": "Submit",
                        "children": [],
                        "label": "Untitled",
                        "type": "Submit",
                        "defaultValue": "",
                        "options": {}
                    }]
                }
            },
            "miscData": {
                "q": self.config.miscData.q,
                "renderMode": self.renderMode
            },
            "settings": {
                "emailDelivery": "copy",
                "form2db": false,
                "isSecure": false,
                "submissionEmail": {
                    "toAddresses": "ddalcu@web.com",
                    "subject": "Someone submitted your Contact Us form",
                    "from": "Contact Us"
                },
                "postSubmission": {
                    "message": "Thanks for your submission!",
                    "errorValue": "Oops! There was a problem submitting your form. Please try again.",
                    "type": "showMessage",
                    "url": "http://yourdomain.com/thankyou.html"
                },
                "formatting": {
                    "useCustomStyle": false,
                    "errorMsgColor": "#c70202",
                    "postSubmissionMsgColor": "",
                    "requiredTextColor": "#c70202",
                    "label": {
                        "fontWeight": "",
                        "color": "",
                        "fontFace": "",
                        "size": ""
                    },
                    "formAlignment": ""
                }
            }
        };
        WebCom.Components.Form.renderInstances([formData],null, {
        	//protocal relative
//          serviceEndPointURL: 'http://forms.services.matrixbuilder.com/forms/footercontact',
//          serviceSecureEndPointURL:'https://forms-services.matrixbuilder.com/forms/footercontact'
              serviceEndPointURL: '//forms.services.matrixbuilder.com/forms/footercontact',
              serviceSecureEndPointURL:'//forms-services.matrixbuilder.com/forms/footercontact'
        });
        var formDataInput = $('<input type="hidden" name="formData"/>');
        formDataInput.val($.toJSON( formData.componentData ));
        $('#fc_form_container-form').append(formDataInput);
		 if ( $.browser.msie ) {
				$("#fc_form_container-form input[type=submit]").click(function(){
					var form = $("#fc_form_container-form");
					if(form.find("input[name=Name]").val() == "" || form.find("input[name=customer-email]").val() == "") {
						alert("Please fill out Name & Email");
						return false;
					}
					
				});
		 }
      }
    }
    
    WebCom_Components_FooterContact.prototype = new WebCom.Components.Component();
    WebCom.Components.FooterContact = {
      initInstances : function (instances, globalSettings) {
        for (var i=0; i < instances.length; i++) {
          var inst = instances[i];

          if (globalSettings && globalSettings.listeners) {
            if (inst["listeners"] == null) {
              inst["listeners"] = globalSettings.listeners;
            } else {
              var listeners = inst["listeners"];
              for (var eventName in globalSettings.listeners) {
                if (listeners[eventName] == null) {
                  listeners[eventName] = globalSettings.listeners[listenerName];
                }
              }
            }
          }
      
          var comp = new WebCom_Components_FooterContact();
          comp.init(inst.id, inst);
          comp.render(comp.renderMode);
          comp.onLoad(inst);
        }
      }
      
    };

  
  }
)();
