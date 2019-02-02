package com.emin.platform.smw.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;
import org.apache.log4j.Logger;
import com.alibaba.fastjson.JSONObject;
import com.emin.platform.smw.filter.MenuOperationFilter;
import com.emin.platform.smw.interfaces.BaApiFeign;
import com.emin.platform.smw.interfaces.CentralConApiFeign;
@Controller
@RequestMapping("/building-con")
public class BuildingConController extends HeaderCommonController {
	private static final Logger LOGGER = Logger.getLogger(SupplierController.class);
	@Value("${spring.application.code}")
	private String appCode;
	@Autowired
	BaApiFeign baApiFeign;

	@Autowired
	MenuOperationFilter menuOperationFilter;

	@Autowired
	CentralConApiFeign centralConApiFeign;


	@RequestMapping("/index")
	public ModelAndView index() {
		ModelAndView mv = new ModelAndView("modules/building-con/manage");
		JSONObject res;
		try {
			res = baApiFeign.datas();
			mv.addObject("datas", res.getJSONArray("result"));
		} catch (Exception e) {
			LOGGER.error("楼控页面跳转，加载楼控数据报错！错误信息->" + e.getMessage());
		}
		return mv;
	}
}