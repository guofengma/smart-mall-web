package com.emin.platform.smw.controller;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.emin.base.exception.EminException;
import com.emin.platform.smw.constain.ApplicationConstain;
import com.emin.platform.smw.filter.MenuOperationFilter;

import com.emin.platform.smw.interfaces.CentralConApiFeign;
import com.emin.platform.smw.interfaces.CombPatternApiFeign;
import com.emin.platform.smw.interfaces.MallPatternApiFeign;
import com.emin.platform.smw.interfaces.MallPatternCalendarApiFeign;
import com.emin.platform.smw.interfaces.SubSysPatternApiFeign;

@Controller
@RequestMapping("/com-pattern")
public class ComPatternController extends HeaderCommonController {
	private static final Logger LOGGER = Logger.getLogger(PatternController.class);
	@Value("${spring.application.code}")
	private String appCode;

	@Autowired
	MenuOperationFilter menuOperationFilter;
	
	@Autowired
	CombPatternApiFeign combPatternApiFeign;
	@Autowired
	MallPatternApiFeign mallPatternApiFeign;
	@Autowired
	SubSysPatternApiFeign subSysPatternApiFeign;
	@Autowired
	CentralConApiFeign centralConApiFeign;
	@Autowired
	MallPatternCalendarApiFeign mallPatternCalendarApiFeign;

	@RequestMapping("/index")
	public ModelAndView index() {
		ModelAndView mv = new ModelAndView("modules/com-pattern/manage");
		try {
			JSONObject params = new JSONObject();
			params.putIfAbsent("userId", this.validateAuthorizationToken().getId());
			String operationCodes = menuOperationFilter.menuOperations("top-com-pattern", params);
			mv.addObject("operationCodes", operationCodes);
		} catch (Exception e) {
			LOGGER.error("模式界面跳转，加载权限出现异常->" + e.getMessage());
		}
		return mv;
	}
	
	/**
	 * 返回组合模式列表
	 */
	@RequestMapping("/combpatterns")
	@ResponseBody
	public JSONArray combpatterns() {
		JSONObject res = combPatternApiFeign.queryCombpatterns(null);
		if (!res.getBooleanValue("success")) {
			throw new EminException(res.getString("code"));
		}
		return res.getJSONArray(ApplicationConstain.RESULT_STRING);
	}
	
	/**
	 * 保存组合模式
	 * @param subsystemPatternSetDetailList 选中模模式数据明细
	 * @param subsystemPatternSetStr 模式中的其他数据，如名字、备注
	 */
	@RequestMapping("/saveCombpattern")
	@ResponseBody
	public JSONObject saveCombpattern(String subsystemPatternSetStr) {
		JSONObject res;
		JSONArray subsystemPatternSetDetailList;
		JSONObject obj = JSONObject.parseObject(subsystemPatternSetStr);
		subsystemPatternSetDetailList = obj.getJSONArray("list");
		res = combPatternApiFeign.saveCombpattern(subsystemPatternSetDetailList.toJSONString(), subsystemPatternSetStr);
		
		if (!res.getBooleanValue("success")) {
			throw new EminException(res.getString("code"));
		}
		return res;
	}
	
	/**
	 * 组合模式详情
	 * @param id 组合模式id
	 */
	@RequestMapping("/detail")
	@ResponseBody
	public JSONObject detail(Long id) {
		JSONObject res = combPatternApiFeign.detail(id);
		if (!res.getBooleanValue("success")) {
			throw new EminException(res.getString("code"));
		}
		return res.getJSONObject(ApplicationConstain.RESULT_STRING);
	}
	
	/**
	 * 删除组合模式
	 * @param id 组合模式id
	 */
	@RequestMapping("/delete")
	@ResponseBody
	public JSONObject delete(Long id) {
		JSONObject res = combPatternApiFeign.delete(id);
		
		if (!res.getBooleanValue("success")) {
			throw new EminException(res.getString("code"));
		}
		return res;
	}
}
