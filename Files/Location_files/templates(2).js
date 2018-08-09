function WebCom_Components_FormElement_getBeforeMarkup(element, renderMode) {
  return '<div class="form-element-wrapper" id="' + element.getId() + '">';	
};

function WebCom_Components_FormElement_getAfterMarkup(element) {
	return "</div>";
};

function WebCom_Components_getInlineStyle(formatting) {
  var inlineStyle = "";
  if (formatting) {
    var color = "";
    if (formatting.label) {
      if (formatting.useCustomSize || formatting.useCustomStyle) {
        if (formatting.label.size && formatting.label.size.length > 0) {
          inlineStyle += "font-size:" + formatting.label.size + ";";
        }
      }
      if (formatting.useCustomStyle) {
        color = (formatting.label.color) ? formatting.label.color : "";
        if (formatting.label.fontWeight && formatting.label.fontWeight.length > 0) {
          inlineStyle += "font-weight:" + formatting.label.fontWeight + ";";
        }
        if (formatting.label.fontFace && formatting.label.fontFace.length > 0) {
          inlineStyle += "font-family:" + formatting.label.fontFace + ";";
        }
        if (color.length > 0) {
          inlineStyle += "color:" + color + ";";
        }
      }
    }
  }
  return inlineStyle;
}

var WebCom_Components_Form_Template_Element = {
  getWidthSetting: function(element){
    /*
     * MHA:
     * This fix was added for MTX-2441 however just as Patty noted in the comments is wrong. We remove the option for the 
     * users  to have radio buttons that are of small width (MTXTS-790).
     * MTX-2441 real solution is to have people fix their radio button width and to offer default width: Large not Medium...
     * 
     *
    if(element.type == WebCom_Components_Form_Element_TYPE.RADIOBUTTON || element.type == WebCom_Components_Form_Element_TYPE.CHECKBOX) {
      if(element.fieldLayout == "onecolumn" || this.getOptions(element).length == 1) {
        return "form-element-size-large";
      }
    }
    */
    return "form-element-size-" + element.width.toLowerCase();
  },
  
  getHeightSetting: function(element){
    var size = {};
    size[WebCom_Components_Form_Element_HEIGHT.SMALL] = 4;
    size[WebCom_Components_Form_Element_HEIGHT.MEDIUM] = 8;
    size[WebCom_Components_Form_Element_HEIGHT.LARGE] = 16;
    return size[element.height];
  },

  getSmallerFont: function(size){
    var smallFont = {};
    smallFont[WebCom_Components_Form_Element_HEIGHT.SMALL] = "x-small";
    smallFont[WebCom_Components_Form_Element_HEIGHT.MEDIUM] = "small";
    smallFont[WebCom_Components_Form_Element_HEIGHT.LARGE] = "medium";
    return smallFont[size] ? smallFont[size] : "smaller";
  },
   
  getCssClasses: function(element, hasWidth){
    return "form-element" + (hasWidth ? (" " + this.getWidthSetting(element)) : "") +
    (element.css ? (" " + element.css) : "");
  },
  
  getOtherFieldInput: function(elementId, suffix) {
    var labelId = elementId ? (elementId + suffix) : "";
    return '<div  id="' + labelId + '" class="other-label"><input id="' + elementId+ '" type="text" name="Other-' + elementId + '" class="form-element form-element-other-size" value=""><br><span>Please specify</span></div>';
  },
  
  getOtherFieldHtml: function(element, isVisible) {
    return '<div id="' + element.name + '-other-label" class=" ' + (isVisible ? '' : 'other-label-hidden') + '"  ><br>' +
         this.getOtherFieldInput(element.name, "-other-label") + '</div>';
  },  
  
  getOptions: function(element){
    var options = [];
    if (element.options.custom && element.options.custom.length > 0) {
      options = options.concat(element.options.custom);
    }
    else if (element.options.predefined && element.options.predefined.length > 0) {
      options = options.concat(WebCom_Components_Form_Element_OPTION_PREDEFINED[element.options.predefined]);
    }

    if (element.options.other) {
      options.push({
        label: 'Other',
        value: 'Other'
      });
    }
    return options;
  },
  
  getTooltipMarkup: function(element){
    return (element.toolTip && element.toolTip.length > 0) ? '<span id="' + element.name + '-helpIcon" valign="top" class="help_icon">&nbsp;</span><div  id="' + element.name + '-help-text" class="help-text help-text-hidden">' + element.toolTip + '</div>' : '';
  },
  
  getRequiredMarkup: function(element, color){
    var requiredColor = (color ? color: "#cc0000");
    return (element.isRequired) ? '<span style="color:' + requiredColor + ';font-weight:normal" valign="top" >*</span>' : '';
  },
  getInlineStyle: function(formatting) {
    return WebCom_Components_getInlineStyle(formatting);
  },
  
  getLabelMarkup: function(element, formatting){
    return WebCom.Util.TemplateUtil.format('<label for="${id}" class="${labelClass}" style="${labelStyle}">${label}${required}${helpIcon}</label>', {
      "id": element.name,
      "label": element.label,
      helpIcon: this.getTooltipMarkup(element),
      required: this.getRequiredMarkup(element, (formatting.useCustomStyle ? formatting.requiredTextColor : null)),
      labelStyle: this.getInlineStyle(formatting),
      labelClass: element.labelClass ? element.labelClass : "form-element-label"
    });
  },
  
  buildHTML: function (element, html, formatting) {
    var label = this.getLabelMarkup(element, formatting);
    var pos = WebCom_Components_Form_Element_LABEL_POSITION;
    if (element.labelPosition && (pos.BOTTOM == element.labelPosition || pos.RIGHT == element.labelPosition)) {
      return html + label;
    }
    return label + html;
  }
};

var WebCom_Components_Form_Template_TextBox_Edit = jQuery.extend(true, {}, WebCom_Components_Form_Template_Element, {
	getMarkupText: function(element, formatting){
    var tpl = '<input  class="${classes}" id="${name}" type="text" name="${name}" value="${value}" maxlength="${maxChar}" ${disabled}>';
    var html = WebCom.Util.TemplateUtil.format(tpl, {
      name: element.name,
      value: element.value || "",
      maxChar: (element.maxChar) ? element.maxChar : "",
      classes: this.getCssClasses(element, true),
      disabled: formatting.disabled ? "readonly" : ""
    });
    return this.buildHTML(element, html, formatting);
  }
});

var WebCom_Components_Form_Template_TextArea_Edit = jQuery.extend(true, {}, WebCom_Components_Form_Template_Element, {
  getMarkupText: function (element, formatting) {
  var tpl = '<textarea  rows="${height}" class="${classes}" id="${name}" name="${name}" ${disabled}>${value}</textarea>';
  var html = WebCom.Util.TemplateUtil.format(tpl, {
      name: element.name,
      value: element.value || "",
      height: this.getHeightSetting(element),
      classes: this.getCssClasses(element, true),
      disabled: formatting.disabled ? "readonly" : ""
    });   
    return this.buildHTML(element, html, formatting);
  }
});

var WebCom_Components_Form_Template_Paragraph_Edit = jQuery.extend(true, {}, WebCom_Components_Form_Template_Element, {
  getMarkupText: function (element, formatting) {
    var tpl = '<span>${value}</span>';
    var html = WebCom.Util.TemplateUtil.format(tpl, {
      value: unescape(element.value)
    });   
    return html;
  }
});

var WebCom_Components_Form_Template_Submit_Edit = jQuery.extend(true, {}, WebCom_Components_Form_Template_Element,{

  getTpl: function() {
    return '<div style="${style}"><input type="submit" class="${classes}" name="${name}" value="${value}" ${disabled}/></div>';
  },
  
  getStyle: function(element) {
    switch(element.align) {
      default:
      case 'left':
        return 'text-align: left;';
      case 'center':
        return 'text-align: center;';
      case 'right':
        return 'text-align: right;';
    }
  },
  
  getMarkupText: function (element, formatting) {
    var tpl = this.getTpl();
    var html = WebCom.Util.TemplateUtil.format(tpl, {
      name: element.name,
      value: element.value,
      classes: this.getCssClasses(element, false),
      disabled: formatting.disabled ? "disabled" : "",
      style: this.getStyle(element)
    });       
    return html;
  }
});

var WebCom_Components_Form_Template_Checkbox_Edit = jQuery.extend(true, {}, WebCom_Components_Form_Template_Element, {
  type: "checkbox",
  
  getTemplate : function() {
    return '<div class="form-option-wrapper"><input id="${id}"  class="${classes}" type="${type}" name="${name}" value="${value}" ${checked} ${disabled}><label for="${id}">${label}</label>${other}</div>';
  },
  
  isLastElementInRow: function(index, layout){
    var colLayout = WebCom_Components_Form_Element_LAYOUT;
    return (colLayout.ONE_COLUMN == layout) || (colLayout.TWO_COLUMN == layout && (index % 2 == 0)) || (colLayout.THREE_COLUMN == layout && (index % 3 == 0));
  },
  
  getLayoutFormat: function(index, layout){
    if (this.isLastElementInRow(index, layout)) {
      return (this.isTableLayout(layout)) ? "</tr><tr>" : "<br>";
    }
    return "";
  },
  
  isTableLayout: function(layout) {
    var colLayout = WebCom_Components_Form_Element_LAYOUT;
    return (colLayout.ONE_COLUMN == layout || colLayout.TWO_COLUMN == layout || colLayout.THREE_COLUMN == layout);
  },

  getOptionWrapperStyle: function(element) {
   var colLayout = WebCom_Components_Form_Element_LAYOUT;
    var width = {};
    width[colLayout.ONE_COLUMN] = "99%";
    width[colLayout.TWO_COLUMN] = "49%";
    width[colLayout.THREE_COLUMN] = "33%";
    return 'style="vertical-align:top;width:' + width[element.fieldLayout] + '"';
  },
  
  getMarkupText: function (element, formatting) {
    var html = "";
    var tpl = this.getTemplate();
    if (this.isTableLayout(element.fieldLayout)) {
      html += "<table class='" + this.getWidthSetting(element) + "'><tr>";
      tpl = "<td " + this.getOptionWrapperStyle(element) + ">" + tpl + "</td>";
    }
    else {
      html += "<div class='radiocheckbox-wrapper-" + this.getWidthSetting(element) + "'>";
    }
  	
    var options = this.getOptions(element);
    
    //MTX-2456 Allow checkboxes to have "none" as a default value, remove "none" as a default value from radio buttons
    //if (element.isRequired && element.value == "" || /PredefinedDefaultValueNone/i.test(element.value)) {
    //  element.value = options[0].value;
    //}
    
    for (var i=0; i < options.length; i++) {
      var option = options[i];
      var value = option.value;
      if (value && value.length > 0) {
        var label = option.label || option.value;
        html += WebCom.Util.TemplateUtil.format(tpl, {
          "value": value,
          type: this.type,
          id: element.name + "_" + i,
          name: element.name,
          label: (value == "Other") ? label + ": " : label,
          other: (value == "Other") ? this.getOtherFieldInput(element.name, "-other-label-tooltip") : "",
          checked: (element.value == value) ? "checked" : "",
          classes: this.getCssClasses(element, false),
          disabled: formatting.disabled ? "readonly" : ""
        });
        html += this.getLayoutFormat((i + 1), element.fieldLayout);
      }
    }
    if (this.isTableLayout(element.fieldLayout)) {
      html += "</tr></table>";
    }
    else {
      html += "</div>";
    }
    html += '<div class="form-option-closer"></div>';
    return this.buildHTML(element, html, formatting);
  }
});

var WebCom_Components_Form_Template_RadioButton_Edit = jQuery.extend(true, {}, WebCom_Components_Form_Template_Checkbox_Edit, {
  type: "radio"
});

var WebCom_Components_Form_Template_DropDown_Edit = jQuery.extend(true, {}, WebCom_Components_Form_Template_Element, {
  getSize: function () {
    return "";
  },
  
  getAttributes: function() {
    return "";
  },

  isSelected: function(element, value) {
    return (element.value && element.value == value);
  },
  
  getOptionsHtml: function (element) {
    var options = this.getOptions(element);
    var optionsHtml = "";
    var optionTpl = '<option value="${value}" ${selected}>${label}<br>';
    if (element.value == "PredefinedDefaultValueNone") {
      optionsHtml += WebCom.Util.TemplateUtil.format(optionTpl, {
        "value": "",
        label: "Select...",
        selected: "selected" 
      });
    }
    for (var i=0; i < options.length; i++) {
      var option = options[i];
      var value = option.value;
      var label = option.label || option.value;
      optionsHtml += WebCom.Util.TemplateUtil.format(optionTpl, {
        "value": value,
        label: label,
        selected: this.isSelected(element, value) ? "selected" : "" 
      });
    }
    return optionsHtml;
  },
  
  getMarkupText: function (element, formatting) {
    var outerTpl = '<select ${size} ${attributes} class="${classes}" id="${name}" name="${name}" ${disabled}>${options}</select>';
		var optionsHtml = this.getOptionsHtml(element);
		
		var html = WebCom.Util.TemplateUtil.format(outerTpl, {
      name: element.name,
			options: optionsHtml,
      size: this.getSize(element),
      attributes: this.getAttributes(),
      classes: this.getCssClasses(element, true),
      disabled: formatting.disabled ? "readonly" : ""
		});
    if (element.options && element.options.other) {
      html += this.getOtherFieldHtml(element, false);
    } 
    return this.buildHTML(element, html, formatting);
  }
});

var WebCom_Components_Form_Template_MultiSelect_Edit = jQuery.extend(true, {}, WebCom_Components_Form_Template_DropDown_Edit, {
  getSize: function (element) {
    return 'size="' + this.getHeightSetting(element) + '"';
  },
  
  getAttributes: function() {
    return "multiple";
  },
  
  isSelected: function(element, value) {
    if (element.value) {
      var multipleValues = element.value.split(",");
      for (var i = 0; i < multipleValues.length; i++) {
        if (multipleValues[i] == value) {
          return true;
        }
      }
    }
    return false;
  }
});

var WebCom_Components_Form_Template_Email_Edit = jQuery.extend(true, {}, WebCom_Components_Form_Template_TextBox_Edit);

var WebCom_Components_Form_Template_PersonName_Edit = jQuery.extend(true, {}, WebCom_Components_Form_Template_Element, {

  getRequiredMarkup: function(element, color) {
    if (element.type == WebCom_Components_Form_Element_TYPE.PERSON_NAME) {
      return "";
    }
    var requiredColor = (color ? color: "#cc0000");
    return (element.isRequired) ? '<span style="color:' + requiredColor + ';font-weight:normal" valign="top" >*</span>' : '';
  },

  getPersonNameClass: function(element) {
    var w = element.width.toLowerCase();
    var className = "personName-" + w;
    if (jQuery.browser.msie && jQuery.browser.version < 8) {
      var hasFN = false, hasLN = false, hasMI = false, hasS = false;
      for (var i = 0; i < element.children.length; i++) {
        if (/FirstName/i.test(element.children[i].name)) {
          hasFN = true;
        }
        else if (/LastName/i.test(element.children[i].name)) {
          hasLN = true;
        }
        else if (/MiddleInitial/i.test(element.children[i].name)) {
          hasMI = true;
        }
        else if (/Suffix/i.test(element.children[i].name)) {
          hasS = true;
        }
      }
      if (hasFN && hasLN) {
       if (hasMI && !hasS) {
         className += "-fnmiln";
       }
       if (!hasMI && hasS) {
         className += "-fnlns";
       }
       if (!hasMI && !hasS) {
         className += "-fnln";
       }
      }
    }
    return className;
  },
  
  getMarkupText: function (element, formatting) {
    var html = '<table class="' + this.getPersonNameClass(element) + '" cellpadding="0" cellspacing="0"><tr>';
    if (element.children) {
      var subOptionFormatting = jQuery.extend(true, {}, formatting);
      if (formatting.label) {
        var label = jQuery.extend(true, {}, formatting.label);
        label.size = this.getSmallerFont(label.size);
        subOptionFormatting.useCustomSize = true; 
        subOptionFormatting.label = label;
      }
     
      for (var i=0;i<element.children.length; i++) {
        var child = jQuery.extend(true, {}, element.children[i]);
        html += '<td class="' + child.name + '">';
        child.name = element.name + "-" + child.name;
        child.labelPosition = WebCom_Components_Form_Element_LABEL_POSITION.BOTTOM;
        child.labelClass = "personName-label";
        child.width = WebCom_Components_Form_Element_WIDTH.FULL;
        html += WebCom_Forms_Builder_FormElementGenerator.getHTML(child, formatting.renderMode, true, subOptionFormatting);
        html += "</td>";
      }
    }
    html += "</tr></table>";
    return this.buildHTML(element, html, formatting);
  }
});

var WebCom_Components_Form_Template_Address_Edit = jQuery.extend(true, {}, WebCom_Components_Form_Template_Element, {
  getRequiredMarkup: function(element, color) {
    if (element.type == WebCom_Components_Form_Element_TYPE.ADDRESS) {
      return "";
    }
    var requiredColor = (color ? color: "#cc0000");
    return (element.isRequired) ? '<span style="color:' + requiredColor + ';font-weight:normal" valign="top" >*</span>' : '';
  },
  
  getUSMarkup: function(width) {
    return "<table cellpadding='0' cellspacing='0' class='address-" + width + "'>" +
    "<tr><td class='addressLine' colspan='3'>${AddressLine1}</td></tr>" + 
    "<tr><td class='addressLine' colspan='3'>${AddressLine2}</td></tr>" +
    "<tr><td class='city'>${City}</td><td class='state'>${State}</td><td class='zip'>${Zip}</td></tr>" +
    "</table>";
  },

  getIntlMarkup: function(width) {
    return "<table cellpadding='0' cellspacing='0' class='address-" + width + "'>" +
    "<tr><td class='addressLine' colspan='2'>${AddressLine1}</td></tr>" + 
    "<tr><td class='addressLine' colspan='2'>${AddressLine2}</td></tr>" +
    "<tr><td class='city'>${City}</td><td class='stateIntl'>${State}</td></tr>" +
    "<tr><td class='postal'>${Postal}</td><td class='country'>${Country}</td></tr>" +
    "</table>";
  },
  
  getMarkupText: function (element, formatting) {
    var html = "", tpl = "";
    if (!element.schema) {
      WebCom_Components_Form_Element_updateToUSAddress(element);
    }

    if (WebCom_Components_Form_Element_SCHEMA.US == element.schema) {
      tpl = this.getUSMarkup(element.width.toLowerCase());
    }
    else {
      tpl = this.getIntlMarkup(element.width.toLowerCase());
    }
   var tplHash = {};   
    if (element.children) {
      var subOptionFormatting = jQuery.extend(true, {}, formatting);
      if (formatting.label) {
        var label = jQuery.extend(true, {}, formatting.label);
        label.size = this.getSmallerFont(label.size); 
        subOptionFormatting.label = label;
        subOptionFormatting.useCustomSize = true; 
      }

      for (var i=0;i<element.children.length; i++) {
        var child = jQuery.extend(true, {}, element.children[i]);
        if (child.label == "State/Province/Region" && (element.width == WebCom_Components_Form_Element_WIDTH.SMALL || 
        element.width == WebCom_Components_Form_Element_WIDTH.MEDIUM)) {
          child.label = "State";
        }
        child.name = element.name + "-" + child.name;
        child.labelClass = "address-label";
        child.labelPosition = WebCom_Components_Form_Element_LABEL_POSITION.BOTTOM;
        child.width = WebCom_Components_Form_Element_WIDTH.FULL;
        tplHash[element.children[i].name] = WebCom_Forms_Builder_FormElementGenerator.getHTML(child, formatting.renderMode, true, subOptionFormatting);
      }
   		html = WebCom.Util.TemplateUtil.format(tpl, tplHash);
    }
    return this.buildHTML(element, html, formatting);
  }
});


function WebCom_Components_Form_PostSubmission_Display(component, msgKey, defaultMsg, className) {
      var result = "", msg = "";
      try {
        if (component.form.settings && component.form.settings.postSubmission) {
          msg = component.form.settings.postSubmission[msgKey];
        }
        if (/string/i.test(typeof(msg))) {
          result = msg;
        }
       else {
        result = msg["value"];
        if (!result || (!/string/i.test(typeof(result))) || result.length == 0) {
          result = defaultMsg;
        }
       }
      }
      catch(e1) {
        result = defaultMsg;
      }
      var styleValue = "", c = "";
      if (component.form.settings.formatting.useCustomStyle) {
        try {
          if (/errorValue/i.test(msgKey)) {
            c = component.form.settings.formatting.errorMsgColor;
          }
          else {
            c = component.form.settings.formatting.postSubmissionMsgColor;
          }
        } 
        catch (e2) {
        }
        if (c && c.length > 0) {
          styleValue = 'color:' + c + '";';
        }
      }
      
      var alignment = component.form.settings.formatting.formAlignment;
      if (alignment == undefined || alignment.length == 0) {
        alignment = 'center';
      }
      styleValue = styleValue + "text-align: " + alignment + ";";
      
      return '<div class="' + className + '" style="' + styleValue+ '">' + result + '</div>';    
}

var WebCom_Components_Form_Template_MasterTemplate_Ok = {
    getMarkupText: function(component, formatting){
      return WebCom_Components_Form_PostSubmission_Display(component, "message", 'Submisssion completed', "form-result-ok");
    }
};

var WebCom_Components_Form_Template_MasterTemplate_Err = {
    getMarkupText: function(component, formatting){
      return WebCom_Components_Form_PostSubmission_Display(component, "errorValue", 'Submisssion failed', "form-result-err");
    }
};
  
var WebCom_Components_Form_Template_MasterTemplate_Builder = {
  getMarkupText: function(component) {
                return WebCom_Forms_Builder_FormGenerator.getHTML(component.getForm(), "Builder");
        }
};

var WebCom_Components_Form_Template_MasterTemplate_Edit = {
  getMarkupText: function(component) {
		return WebCom_Forms_Builder_FormGenerator.getHTML(component.getForm(), "Edit");
	}
};

var WebCom_Components_Form_Template_MasterTemplate_Preview = {
  getMarkupText: function(component) {
		return WebCom_Forms_Builder_FormGenerator.getHTML(component.getForm(), "Preview");
	}
};

var WebCom_Components_Form_Template_MasterTemplate_Publish = {
  getMarkupText: function(component) {
		return WebCom_Forms_Builder_FormGenerator.getHTML(component.getForm(), "Publish");
	}
};

var WebCom_Components_Form_Template_Title_Edit = {
  getText: function (element, formatting) {
    return element.name;
  },
      
  getMarkupText: function (element, formatting) {
    var tpl = "<div id='${id}-form-title' class='form-element-wrapper form-name'>${name}</div>";
    var html = WebCom.Util.TemplateUtil.format(tpl, {
      id: element.id,
      name: element.name
    });   
    return html;
  }
};


var /* private class */ WebCom_Forms_Builder_FormGenerator = {
    
  /* public String */ getFormHTML : function (settings, renderMode) {
    var html = '<form id="${id}-form" class="web_com_custom_form" method="post" action="${actionUrl}" onSubmit="${onSubmit}" >\n';
    var validationStyle = "", validationStyleElement = "";;
    if (settings && settings.formatting && settings.formatting.errorMsgColor) {
      validationStyle = "style=\"color:" + settings.formatting.errorMsgColor + "\"";
      validationStyleElement = "<style>#${id} div.form_error{ color: " + settings.formatting.errorMsgColor + ";}\n#${id} input.form_error,#${id} textarea.form_error{" +   "border:1px dotted " + settings.formatting.errorMsgColor + " !important; " +  "}</style>";
    }
    html += validationStyleElement;
    html += "${body} \n";
    html += "</form>";

    return html;
  },
  
  doAlignment: function(alignType, renderMode, innerHTML) {
    var html = '';
    
    if (renderMode != "Builder") {
      switch(alignType) {
        default:
        case 'center':
          html +='<table cellspacing="0" cellpadding="0" border="0" width="100%"> <tr> <td align="left" valign="top" width="45%">&nbsp;</td> <td align="left" valign="top" width="10%">';
          break;
        case 'left':
          break;
        case 'right':
          html +='<table cellspacing="0" cellpadding="0" border="0" width="100%"> <tr> <td align="left" valign="top" width="90%">&nbsp;</td> <td align="left" valign="top" width="10%">';
          break;
      }
       
    }
    
    html += innerHTML;
    
    if (renderMode != "Builder") {
      switch(alignType) {
        default:
        case 'center':
          html += '</td> <td align="left" valign="top" width="45%">&nbsp;</td> </tr> </table>';
          break;
        case 'left':
          break;
        case 'right':
          html += '</td> </tr> </table>';
          break;
      }
    }
    
    return html;
  },
  
  /* public String */ getHTML : function (/* Form */ form, /* RenderMode */ renderMode) {
    var html = "";
    
    var formHtml = this.getFormHTML(form.settings, renderMode);

    var alignment = form.settings.formatting.useCustomStyle ? form.settings.formatting.formAlignment : 'center';
    formHtml = this.doAlignment(alignment, renderMode, formHtml); //Align form
    
    if (renderMode == "Builder") {
      renderMode = "Edit"; //rewrite going forward for the call ...
    }


    formHtml = WebCom.Util.TemplateUtil.format(formHtml, {
      id: form.id,
      actionUrl : (/edit/i.test(renderMode)) ? "#" : form.formProcessorUrl,
      onSubmit: (/edit/i.test(renderMode)) ? "return false" : "return WebCom.Components.Form.submitInstance(this)"
    });   

    var elements = form.getElements(form, renderMode);
    for (var i=0; i < elements.length ; i++) {
      html += WebCom_Forms_Builder_FormElementGenerator.getHTML(elements[i], renderMode, false, form.settings.formatting);
    };
    formHtml = formHtml.replace("${body}", html);
    return formHtml;
  }
};

var /* private class */ WebCom_Forms_Builder_FormElementGenerator = {
    getFormTitleSpec: function (form) {
      return {
        tag: 'div',
        id: form.id + "",
        cls: "form-element-wrapper",
        style: WebCom_Components_getInlineStyle(form.settings.formatting), 
        html: WebCom_Components_Form_Template_Title_Edit.getText(form, form.settings.formatting)
      };
  },

  /* public HTMLSpec */ getHTMLSpec: function (/* FormElement */ element, /* RenderMode */ renderMode, /* Object */  formatting) {
    var html = this.getHTML(element, renderMode, true, formatting);
    return {
      tag: 'div',
      id: element.id,
      cls: "form-element-wrapper",
      html: html
    };
  },

  /* public String */ getHTML: function (/* FormElement */ element, /* RenderMode */ renderMode, /* boolean */ bodyOnly, /* Object */  formatting) {
    var html = bodyOnly ? '' : WebCom_Components_FormElement_getBeforeMarkup(element, renderMode);
    
    var elemFormatting = jQuery.extend(true, {}, formatting);
    elemFormatting.renderMode = renderMode; // need for sub-elements 
    if (renderMode == "Edit") {
      elemFormatting.disabled = true;
    }
    var funcName = "WebCom_Components_Form_Template_" + element.type + "_" + "Edit";
    eval ("html += " + funcName + ".getMarkupText(element, elemFormatting);");		
    
    html += bodyOnly ? '' : WebCom_Components_FormElement_getAfterMarkup(element);
		
    return html;
  }
};
