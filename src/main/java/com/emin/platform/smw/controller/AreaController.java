package com.emin.platform.smw.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSONObject;
import com.emin.platform.smw.filter.MenuOperationFilter;
import com.emin.platform.smw.interfaces.AreaApiFeign;

@Controller
@RequestMapping("/area")
public class AreaController extends HeaderCommonController {
	@Value("${spring.application.code}")
	private String appCode;

	@Autowired
	MenuOperationFilter menuOperationFilter;

	@Autowired
	AreaApiFeign areaApiFeign;

	@RequestMapping("/save")
	@ResponseBody
	public JSONObject save(String data) {
		JSONObject res = areaApiFeign.save(data);
		this.dealException(res);
		return res;
	}
	

	@RequestMapping("/list")
	@ResponseBody
	public JSONObject list() {
		JSONObject res = areaApiFeign.list(null);
		this.dealException(res);
		return res;
	}
	
	@RequestMapping("/remove")
	@ResponseBody
	public JSONObject remove(Long id) {
		JSONObject res = areaApiFeign.remove(id);
		this.dealException(res);
		return res;
	}
}