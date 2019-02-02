package com.emin.platform.smw.config;

import java.io.IOException;
import java.io.Writer;
import java.util.Map;

import com.alibaba.fastjson.JSONObject;
import com.alibaba.fastjson.JSONArray;

import freemarker.core.Environment;
import freemarker.template.SimpleHash;
import freemarker.template.SimpleSequence;
import freemarker.template.TemplateDirectiveBody;
import freemarker.template.TemplateDirectiveModel;
import freemarker.template.TemplateException;
import freemarker.template.TemplateModel;

/**
 * @author jim.lee
 *
 */
public class Object2JSONTag implements TemplateDirectiveModel {

	/* (non-Javadoc)
	 * @see freemarker.template.TemplateDirectiveModel#execute(freemarker.core.Environment, java.util.Map, freemarker.template.TemplateModel[], freemarker.template.TemplateDirectiveBody)
	 */
	@Override
	public void execute(Environment env, Map params, TemplateModel[] loopVars, TemplateDirectiveBody body)
			throws TemplateException, IOException {
		Writer writer = env.getOut();
		String className = params.get("obj").getClass().getName();
		String convertJsonStr = "";
		if (className.equals("freemarker.template.SimpleSequence")) {
			SimpleSequence ss = (SimpleSequence) params.get("obj");
			convertJsonStr = JSONArray.toJSONString(ss.toList());
		}
		
		if (className.equals("freemarker.template.SimpleHash")) {
			SimpleHash sh = (SimpleHash) params.get("obj");
			convertJsonStr = JSONObject.toJSONString(sh.toMap());
		}

		writer.write(convertJsonStr);
		if(body!=null) {
			body.render(writer);
		}
		
	}

}
