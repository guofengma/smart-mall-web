package com.emin.platform.smw.controller;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import com.alibaba.fastjson.JSONObject;
import com.emin.platform.smw.constain.ApplicationConstain;
import com.emin.platform.smw.filter.MenuOperationFilter;
import com.emin.platform.smw.interfaces.CentralConApiFeign;
import com.emin.platform.smw.util.UserClaim;

@Controller
@RequestMapping("/vedio")
public class VedioController extends HeaderCommonController {
	private static final Logger LOGGER = Logger.getLogger(StoreController.class);
	@Value("${spring.application.code}")
	private String appCode;
	@Autowired
	CentralConApiFeign centralConApiFeign;
	@Autowired
	MenuOperationFilter menuOperationFilter;


	@RequestMapping("/index")
	public ModelAndView index(Long subsystemPatternId, String type) {
		ModelAndView mv = new ModelAndView("modules/door/manage");
		UserClaim userClaim = this.validateAuthorizationToken();
		mv.addObject("moduleCode", "vedio");
		mv.addObject("moduleName", "视频");
		if(subsystemPatternId != null) {
			mv.addObject("subsystemPatternId", subsystemPatternId);
		}
		if(type != null) {
			mv.addObject("type", type);
		}
		try {
			JSONObject params = new JSONObject();
			params.putIfAbsent("userId", userClaim.getId());
			String operationCodes = menuOperationFilter.menuOperations("vedio", params);
			mv.addObject("operationCodes", operationCodes);
		} catch (Exception e) {
			LOGGER.error("视频监控配置界面跳转，加载权限出现异常->" + e.getMessage());
		}
		return mv;
	}
	
	@RequestMapping("/form")
	public ModelAndView form(Long subsystemPatternId) {
		ModelAndView mv = new ModelAndView("modules/door/form");
		mv.addObject("moduleCode", "vedio");
		mv.addObject("moduleName", "视频");
		if(subsystemPatternId != null) {
			mv.addObject("subsystemPatternId", subsystemPatternId);
		}
		return mv;
	}
	
	@RequestMapping("/command-template-form")
	public ModelAndView form2(Long commandTemplateId) {
		ModelAndView mv = new ModelAndView("modules/door/command-template-form");
		JSONObject res = centralConApiFeign.queryAllSystem("vedio");
		this.dealException(res);
		mv.addObject("brands", res.getJSONArray(ApplicationConstain.RESULT_STRING).getJSONObject(0).getJSONArray("brands"));
		mv.addObject("moduleCode", "vedio");
		mv.addObject("moduleName", "视频");
		if(commandTemplateId != null) {
			mv.addObject("commandTemplateId", commandTemplateId);
		}
		return mv;
	}
}
