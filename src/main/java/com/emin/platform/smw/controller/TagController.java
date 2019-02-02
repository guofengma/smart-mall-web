package com.emin.platform.smw.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSONObject;
import com.emin.platform.smw.filter.MenuOperationFilter;
import com.emin.platform.smw.interfaces.TagApiFeign;

@Controller
@RequestMapping("/tag-lib")
public class TagController extends HeaderCommonController {
	@Value("${spring.application.code}")
	private String appCode;

	@Autowired
	MenuOperationFilter menuOperationFilter;

	@Autowired
	TagApiFeign tagApiFeign;

	@RequestMapping("/save")
	@ResponseBody
	public JSONObject save(String tagLibParams) {
		JSONObject tagLibRes = tagApiFeign.tagLibAddTags(tagLibParams);
		this.dealException(tagLibRes);
		return tagLibRes;
	}

	@RequestMapping("/page")
	@ResponseBody
	public JSONObject page(String params) {
		Integer page =getPageRequestData().getCurrentPage();
		Integer limit = getPageRequestData().getLimit();
		JSONObject res = tagApiFeign.tagLibPage(params, null, null, page, limit);
		this.dealException(res);
		return res;
	}
	
	@RequestMapping("/remove")
	@ResponseBody
	public JSONObject remove(Long[] ids) {
		JSONObject res = tagApiFeign.tagLibRemoveTags(ids);
		this.dealException(res);
		return res;
	}	
}