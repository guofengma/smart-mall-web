package com.emin.platform.smw.config;

import java.io.IOException;
import java.io.Writer;
import java.util.Map;
import java.util.Objects;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;

import freemarker.core.Environment;
import freemarker.template.TemplateDirectiveBody;
import freemarker.template.TemplateDirectiveModel;
import freemarker.template.TemplateException;
import freemarker.template.TemplateModel;
import freemarker.template.TemplateScalarModel;

/**
 * @author jim.lee
 *
 */
public class OperationValidationTag implements TemplateDirectiveModel{

	/* (non-Javadoc)
	 * @see freemarker.template.TemplateDirectiveModel#execute(freemarker.core.Environment, java.util.Map, freemarker.template.TemplateModel[], freemarker.template.TemplateDirectiveBody)
	 */
	@Autowired
	HttpServletRequest request;
	
	@Override
	public void execute(Environment env, Map params, TemplateModel[] loopVars, TemplateDirectiveBody body)
			throws TemplateException, IOException {
		
		Writer writer = env.getOut();
		Object codesObj =  params.get("codes");
		Object operationCodeObj = params.get("operationCode");
		if(Objects.isNull(codesObj)||Objects.isNull(operationCodeObj)){
			return;
		}
		String codes =((TemplateScalarModel)codesObj).getAsString();
		
		String code = ((TemplateScalarModel) operationCodeObj).getAsString();
		
		if(body!=null) {
			if(codes.contains(code)) {
				body.render(writer);
			}
			
		}
	}

}
