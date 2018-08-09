(
  function () {
    var VERSION = "1.0";
    var NAME    = "com.web.components.form";
    var scripts = ["js/utils.js", "js/resources.js", "js/templates.js"];
    var styles  = ["css/form.css"];
    
    if (jQuery.browser.msie && jQuery.browser.version < 8) {
      styles.push("css/form_ie6-ie7.css");
    }
    else {
      styles.push("css/form_generic.css");
    }

    WebCom.ResourceLoader.loadLib('org.json', null, true);
				
    var lib = new WebCom.ResourceLoader.Library("WebCom.Components.Form", NAME, VERSION, scripts, styles );
    WebCom.ResourceLoader.importLib(lib);

    function WebCom_Components_Form() {
      WebCom.Components.Component.apply(this,[lib]);

      //protocal relative
//      var SERVICE_ENDPOINT_URL = "http://forms.services.matrixbuilder.com/forms/processor.sfx";
//      var SERVICE_SECURE_ENDPOINT_URL = "https://forms-services.matrixbuilder.com/forms/processor.sfx";
      var SERVICE_ENDPOINT_URL = "//forms.services.matrixbuilder.com/forms/processor.sfx";
      var SERVICE_SECURE_ENDPOINT_URL = "//forms-services.matrixbuilder.com/forms/processor.sfx";
      var self = this; // to overcome calback scoping

	  if(typeof LIGHTING_ONE_SERVICE_ENDPOINT_URL !== 'undefined') {
		SERVICE_ENDPOINT_URL = LIGHTING_ONE_SERVICE_ENDPOINT_URL;
	  }
	  if(typeof LIGHTING_ONE_SERVICE_SECURE_ENDPOINT_URL !== 'undefined') {
		SERVICE_SECURE_ENDPOINT_URL = LIGHTING_ONE_SERVICE_SECURE_ENDPOINT_URL;
	  }
	  
      this.init = function (id, config, extraConfig) {
        if(extraConfig && extraConfig.serviceEndPointURL) {
          SERVICE_ENDPOINT_URL = extraConfig.serviceEndPointURL;
        }
        if(extraConfig && extraConfig.serviceSecureEndPointURL) {
          SERVICE_SECURE_ENDPOINT_URL = extraConfig.serviceSecureEndPointURL;
        }

        this.id = id;
        this.q = config.miscData.q;
        this.encType = config.miscData.encType;
				this.renderMode = config.miscData.renderMode;
        if (/Publish/i.test(this.renderMode)) {
          config.componentData.form["formProcessorUrl"] = ( config.componentData.form && config.componentData.form.settings && config.componentData.form.settings.isSecure)  ? SERVICE_SECURE_ENDPOINT_URL : SERVICE_ENDPOINT_URL;  
        }
        else {
          config.componentData.form["formProcessorUrl"] =  "#";
        }
        
				this.form = new WebCom_Forms_Beans_Form(id, config.componentData.form);
      };
			
			this.getForm = function () {
				return this.form;
			};
			
			this.getHTML = function() {
				var tpl = this.getMasterTemplate("Builder");
				return tpl.getMarkupText(this);
			};

      //note: right now mode is passed in just in case but we're really handling Edit only 			
      this.getFormElementHTML = function(/* FormElement */ element, /* RenderMode */ mode) {
        return WebCom_Forms_Builder_FormElementGenerator.getHTML(element, mode);				
      };

      this.getMasterTemplate = function(/*RenderMode*/ mode) {
        return this.getTemplate("MasterTemplate", mode, this.layoutName);
      };

      this.getFormattingValues = function (/*RenderMode*/ mode) {
        var formattingValues = {};
        this.getLocalization(this.locale, formattingValues);

        return formattingValues;
      };

      this.getRuleForElement = function(element){
        var rule = {};
        rule["required"] = (element.isRequired);
        if (element.type == WebCom_Components_Form_Element_TYPE.RADIOBUTTON ||
              element.type == WebCom_Components_Form_Element_TYPE.CHECKBOX) {
          rule["minlength"] = 1;
        }

        var validators = element.validators;
        if (validators && validators.length > 0) {
          for (var j = 0; j < validators.length; j++) {
            var validator = validators[j];
            var type = validator.type;
            if (type) {
              if (/length/i.test(type)) {
                rule["rangelength"] = [validator.config.min, validator.config.max];
                if (element.type == WebCom_Components_Form_Element_TYPE.TEXTAREA) {
                  rule['onkeyup'] = true;
                }
              }
              else 
                if (/email/i.test(type)) {
                  rule["email"] = true;
                }
                else 
                  if (/range/i.test(type)) {
                    rule["range"] = [validator.config.low, validator.config.high];
                  }
            }
          }
        }
        if (element.maxChar) {
          rule["rangelength"] = [0, element.maxChar];
        }
        return rule;
      };

      this.getElementValidationOption = function(element, prefix) {
        var rules = {};
        var name = element.name;
        if (prefix && prefix.length > 0) {
          name = prefix + "-" + element.name;
        }
        if (element.children && element.children.length > 0) {
          for (var i=0;i<element.children.length;i++) {
            jQuery.extend(rules, this.getElementValidationOption(element.children[i], name));
          }
        }
        else {
          rules[name] = this.getRuleForElement(element);
          if (element.type == WebCom_Components_Form_Element_TYPE.TEXTAREA && rules[name]['rangelength']) {
            this.textAreasToValidate.push({
              name: element.name,
              maxLength: element.maxChar
            });
          }
        }
        return rules;
      }; 
           
      this.getValidationOptions = function() {
        var elements = this.getForm().getElements();
        var rules = {}, newRules;
        for (var i=0; i < elements.length; i++) {
          newRules = this.getElementValidationOption(elements[i]);
          jQuery.extend(rules, newRules);
        }
        return rules;
      };

      this.getMessagesForElement = function(element){
        var messages = {};
        if (element.isRequired) {
          messages["required"] =  element.label + " is a required field.";
        }
        var validators = element.validators;
        if (validators && validators.length > 0) {
          for (var j = 0; j < validators.length; j++) {
            var validator = validators[j];
            var type = validator.type;
            if (type) {
              if (/length/i.test(type)) {
                messages["rangelength"] = element.label + " has to be between " + validator.config.min + " and " +  validator.config.max + " characters.";
              }
              else 
                if (/email/i.test(type)) {
                  messages["email"] = element.label + " has to be a valid email address.";
                }
                else 
                  if (/range/i.test(type)) {
                    rule["range"] = element.label + " has to be between " + validator.config.low + " and " +  validator.config.high + ".";
                  }
            }
          }
        }
        if (element.maxChar) {
          messages["rangelength"] = element.label + " cannot be more than " +  element.maxChar + " characters.";
          messages["maxlength"] = element.label + " cannot be more than " +  element.maxChar + " characters.";
        }
        return messages;
      };
      
      this.getElementValidationMessages = function(element, prefix) {
        var messages = {};
        var name = element.name;
        if (prefix && prefix.length > 0) {
          name = prefix + "-" + element.name;
        }
        if (element.children && element.children.length > 0) {
          for (var i=0;i<element.children.length;i++) {
            jQuery.extend(messages, this.getElementValidationMessages(element.children[i], name));
          }
        }
        else {
          messages[name] = this.getMessagesForElement(element);
        }
        return messages;
      };

      this.getValidationMessages = function() {
        var elements = this.getForm().getElements();
        var messages = {}, newMessages;
        for (var i=0; i < elements.length; i++) {
          newMessages = this.getElementValidationMessages(elements[i]);
          jQuery.extend(messages, newMessages);
        }
        return messages;
      }

      return this;
    };

    WebCom_Components_Form.prototype = new WebCom.Components.Component();
    WebCom.Components.Form = {
      instances: [],
      
      renderInstances : function (instances, globalSettings, extraConfig) {
        var url = document.location + "";
        var submissionFormId = "";
        var submissionResult = "";
        if (/\#(.*)\?(.*)/.test(url)) {
          submissionFormId = RegExp.$1;
          submissionResult = RegExp.$2;
        }
        else 
          if (/(.*)\?Err(.*)/.test(url)) {
            submissionFormId = instances[0].id; // we don't know which one is it, so assume it's first one
            submissionResult = "Err";
          }
          
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

          var comp = new WebCom_Components_Form();
          comp.init(inst.id, inst, extraConfig);
          var result = "";
          if (submissionFormId == inst.id) {
            comp.renderMode = submissionResult;
          }
          comp.isFirstSubmission = true;
					comp.render(comp.renderMode, null);
          this.postRender(comp);

          this.instances[inst.id] = comp;
        }
      },
			
      setupTooltips: function(formId) {
        function positionTooltip(elem) {
          var label = jQuery(elem);
          var offset = label.offset();
          jQuery(formId + " div#" + elem.id.replace("-helpIcon","") + "-help-text").css({ "left": (offset.left +label.width() + 17) + "px", "top" : (offset.top + label.height() + 5)+ "px" } );
        }
        jQuery(formId + " span[id$='-helpIcon']").mouseover(function() {
            jQuery(formId + " div#" + this.id.replace("-helpIcon","") + "-help-text").removeClass("help-text-hidden");
            positionTooltip(this);
          }).mouseout(function() {
            jQuery(formId + " div#" + this.id.replace("-helpIcon","") + "-help-text").addClass("help-text-hidden");  
          });
      },
      
      enableOtherField: function(enable, label) {
          if (enable) {
            jQuery(label).removeClass("other-label-hidden");  
          }
          else {
            jQuery(label).addClass("other-label-hidden");   
          }
      },
      
      setupOtherFields: function(formId){
        var self = this;
        jQuery(formId + " div[id$='-other-label-tooltip']").each(function(){
          var label = jQuery(this);
          var prevElem = label.prev();
          label.css({ "top" : "-" + prevElem.height() + "px", "left" : (prevElem.width()+10) + "px"} );
        });

        jQuery(formId + " div[id$='-other-label']").each(function(){
          var label = this;
          var id = this.id.replace("-other-label", "");
          jQuery(formId + " select[name='" + id + "']").click(function(){
            var s = jQuery(this);
            // Multiple select value is a list and needs to match one element from the list
            var isOtherEnabled = (s.attr("multiple"))? (/other/i.test(s.val())) : (s.val() == 'Other');
            var isOtherDisabled = !isOtherEnabled;
            if (isOtherEnabled || isOtherDisabled) {
              self.enableOtherField(isOtherEnabled, label);
            }
           });
        });
        
        jQuery(formId + " div[id$='-other-label-tooltip']").each(function(){
          var id = this.id.replace("-other-label-tooltip", "");
          jQuery(formId + " input[name='Other-" + id + "']").focus(function(){
            var id = this.id.replace("Other-", "");
            var elem = jQuery("input[name='" + id + "']");
            elem.each(function() {
              if (this.value == "Other") {
                this.checked = true; 
              }
              });
           });
        });
      },
      
      enableTextAreaMaxLength: function (formId, v, name, maxLength) {
        jQuery(formId + " textarea[name='" + name + "']").keyup(function(event) {
          var isValid = v.element(this);
          if (!isValid) {
            jQuery(this).addClass("form_error");
          }
          else {
            jQuery(this).removeClass("form_error");
          }
        });
      },
      
      postRender: function(comp) {
          var formSelector = "#" + comp.id + " form";
          this.setupTooltips(formSelector);
          this.setupOtherFields(formSelector);
                      
          // setup validation
          comp.textAreasToValidate = new Array();
          var v = jQuery(formSelector).validate({
            errorClass: "form_error",
            errorElement: "div",
            onfocusout: false,
            onkeyup: false,
            focusCleanup: true,
            rules: comp.getValidationOptions(),
            messages: comp.getValidationMessages(),
            focusInvalid: false,
            errorPlacement: function(error, element) {
               if (/radio/i.test(element.attr("type")) || 
                  /checkbox/i.test(element.attr("type"))) {
                 error.insertAfter("#" + element.attr("name") + "-id table");
               }
                else {
                 error.insertAfter(element); 
                }
             }
          });
          if (comp.textAreasToValidate.length > 0) {
            for (var i=0;i<comp.textAreasToValidate.length;i++) {
                this.enableTextAreaMaxLength(formSelector, v, comp.textAreasToValidate[i].name, comp.textAreasToValidate[i].maxLength);
            }
          }
      },
      
			getInstance: function (/* String */ id, config) {
        var comp = new WebCom_Components_Form();
        comp.init(id, config);

				return comp;
			},
 
      createHiddenParam: function(form, name, value) {
        var qNode = document.createElement("input");
        qNode.setAttribute("type", "hidden");
        qNode.setAttribute("name", name);
        qNode.value = value;
        form.appendChild(qNode);        
      },
      
      submitInstance: function(form) {
        /* NOTE: OD 11/23/2010 
         * 
         * formId is compId + "-form" so compId is formId minus -form :)
         * 
         */
        
        var compId = form.id.substring(0,form.id.length - 5);
        var comp = this.instances[compId];
        if (comp.isFirstSubmission) {
          this.createHiddenParam(form, "q", comp.q);
          var returnUrl = document.location + "";
          var a = returnUrl.indexOf("#");
          if (a != -1) {
            returnUrl = returnUrl.substr(0, a);
          }
          this.createHiddenParam(form, "returnUrl", returnUrl);
          this.createHiddenParam(form, "formId", compId); //TODO: OD 11/23/2010 change the compid and update submission handler
          comp.isFirstSubmission = false;
        }
        return true;
      }
    };
  }
)();

