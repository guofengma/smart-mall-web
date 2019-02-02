package com.emin.platform.smw.controller;

import java.util.Date;
import java.text.SimpleDateFormat;
import java.util.Map;

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
import com.emin.platform.smw.util.UserClaim;

@Controller
@RequestMapping("/pattern")
public class PatternController extends HeaderCommonController {
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
		ModelAndView mv = new ModelAndView("modules/pattern/manage");
		JSONObject res = new JSONObject();
		UserClaim userClaim = this.validateAuthorizationToken();
		Date d = new Date();
		SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
		try {
			res = mallPatternCalendarApiFeign.findMallPatternByDay(sdf.format(d));
		} catch (Exception e) {
			LOGGER.error("加载商场模式界面时报错！错误信息->" + e.getMessage());
		}
		if (!res.isEmpty()) {
			if (!res.getBooleanValue("success")) {
				throw new EminException(res.getString("code"));
			}
			mv.addObject("mallPatterns", res.getJSONObject(ApplicationConstain.RESULT_STRING).getJSONArray("mallPatternTime"));
			mv.addObject("dayName", res.getJSONObject(ApplicationConstain.RESULT_STRING).getString("name"));
		}
		try {
			JSONObject params = new JSONObject();
			params.putIfAbsent("userId",userClaim.getId());
			String operationCodes = menuOperationFilter.menuOperations("top-pattern", params);
			mv.addObject("operationCodes", operationCodes);
		} catch (Exception e) {
			LOGGER.error("商场模式界面跳转，加载权限出现异常->" + e.getMessage());
		}
		return mv;
	}
	
	@RequestMapping("/mall-pattern-calendar")
	public ModelAndView mallPatternCalendar() {
		ModelAndView mv = new ModelAndView("modules/mall-pattern-calendar/manage");
		try {
			JSONObject params = new JSONObject();
			params.putIfAbsent("userId", this.validateAuthorizationToken().getId());
			String operationCodes = menuOperationFilter.menuOperations("top-pattern", params);
			mv.addObject("operationCodes", operationCodes);
		} catch (Exception e) {
			LOGGER.error("商场模式界面跳转，加载权限出现异常->" + e.getMessage());
		}
		return mv;
	}
	@RequestMapping("/run-setting")
	public ModelAndView run_setting(Long mallPatternId) {
		ModelAndView mv = new ModelAndView("modules/pattern/run-setting");
		JSONObject res = new JSONObject();
		try {
			res = mallPatternApiFeign.queryAllMallPattern();
		} catch (Exception e) {
			LOGGER.error("加载商场模式-模式选择界面时报错！错误信息->" + e.getMessage());
		}
		if (!res.isEmpty()) {
			if (!res.getBooleanValue("success")) {
				throw new EminException(res.getString("code"));
			}
			mv.addObject("mallPatternTypes", res.getJSONArray(ApplicationConstain.RESULT_STRING));
		}
		if(mallPatternId == null) {
			mallPatternId = 1L;
		}
		mv.addObject("mallPatternId", mallPatternId);
		try {
			JSONObject params = new JSONObject();
			params.putIfAbsent("userId", this.validateAuthorizationToken().getId());
			String operationCodes = menuOperationFilter.menuOperations("top-pattern", params);
			mv.addObject("operationCodes", operationCodes);
		} catch (Exception e) {
			LOGGER.error("商场模式界面跳转，加载权限出现异常->" + e.getMessage());
		}
		return mv;
	}
	//模式管理
	@RequestMapping("/com-pattern")
	public ModelAndView comPattern() {
		ModelAndView mv = new ModelAndView("modules/com-pattern/manage");
		try {
			JSONObject params = new JSONObject();
			params.putIfAbsent("userId", this.validateAuthorizationToken().getId());
			String operationCodes = menuOperationFilter.menuOperations("top-pattern", params);
			mv.addObject("operationCodes", operationCodes);
		} catch (Exception e) {
			LOGGER.error("模式界面跳转，加载权限出现异常->" + e.getMessage());
		}
		return mv;
	}
	
	/**
	 * 返回商场模式的详细信息
	 */
	@RequestMapping("/mallPatternDetail")
	@ResponseBody
	public JSONObject mallPatternDetail(Long mallPatternId) {
		JSONObject res = mallPatternApiFeign.queryMallPatternDetail(mallPatternId);
		if (!res.getBooleanValue("success")) {
			throw new EminException(res.getString("code"));
		}
		return res;
	}
	
	
	/**
	 * 编辑商场模式
	 * @param id 商场模式id
	 */
	@RequestMapping("/perfectMallPattern")
	@ResponseBody
	public JSONObject perfectMallPattern(Long id,String str) {
		JSONObject res = new JSONObject();
		JSONObject data = JSONObject.parseObject(str);
		for (Map.Entry<String, Object>  entry : data.entrySet()) {
			String key = entry.getKey();
			String value = entry.getValue().toString();
			res = mallPatternApiFeign.perfectMallPattern(id, key, value);
			if (!res.getBooleanValue("success")) {
				throw new EminException(res.getString("code"));
			}
		}
		return res;
	}
	
	/**
	 * 保存商场模式
	 * @param mallPatternTimeList 商场模式时间段及其明细
	 * @param mallPatternStr 模式中的其他数据，如name、id
	 */
	@RequestMapping("/saveMallPattern")
	@ResponseBody
	public JSONObject saveMallPattern(String mallPatternStr) {
		JSONObject res;
		JSONArray mallPatternTimeList;
		JSONObject obj = JSONObject.parseObject(mallPatternStr);
		mallPatternTimeList = obj.getJSONArray("mallPatternTime");
		obj.remove("mallPatternTime");
		res = mallPatternApiFeign.saveMallPattern(mallPatternTimeList.toJSONString(), obj.toJSONString());
		this.dealException(res);
		return res;
	}
	
	/**
	 * 保存临时商场模式
	 * @param mallPatternTimeList 商场模式时间段及其明细
	 * @param mallPatternStr 模式中的其他数据，如name、id
	 */
	@RequestMapping("/saveMallPatternForYyyymmdd")
	@ResponseBody
	public JSONObject saveMallPatternForYyyymmdd(String mallPatternStr,String yyyymmdd) {
		JSONObject res;
		JSONArray mallPatternTimeList;
		JSONObject obj = JSONObject.parseObject(mallPatternStr);
		mallPatternTimeList = obj.getJSONArray("mallPatternTime");
		obj.remove("mallPatternTime");
		res = mallPatternApiFeign.saveMallPatternForYyyymmdd(mallPatternTimeList.toJSONString(), obj.toJSONString(),yyyymmdd);
		this.dealException(res);
		return res;
	}
	/**
	 * 删除商场模式
	 * @param id 商场模式id
	 * @return
	 */
	@RequestMapping("/mallPatternDelete")
	@ResponseBody
	public JSONObject mallPatternDelete(Long id) {
		JSONObject res = mallPatternApiFeign.mallPatternDelete(id);
		this.dealException(res);
		return res;
	}
	
	/**
	 * 取消商场模式下的模式设置
	 * @param id 商场模式id
	 */
	@RequestMapping("/cancelSubsystemPatternSet")
	@ResponseBody
	public JSONObject cancelSubsystemPatternSet(Long id) {
		JSONObject res = mallPatternApiFeign.cancelSubsystemPatternSet(id);
		if (!res.getBooleanValue("success")) {
			throw new EminException(res.getString("code"));
		}
		return res;
	}
	
	/**
	 * 查询子系统和子系统下面的模式
	 * @param subsystemCode 子系统code
	 */
	@RequestMapping("/querySysPatterns")
	@ResponseBody
	public JSONArray querySysPatterns(String subsystemCode) {
		JSONObject res;
		JSONArray subSyss;
		JSONObject subSys;
		JSONArray patterns;
		String code;
		res = centralConApiFeign.onlySystem();
		if (!res.getBooleanValue("success")) {
			throw new EminException(res.getString("code"));
		}
		subSyss = res.getJSONArray(ApplicationConstain.RESULT_STRING);
		for(int i = 0; i < subSyss.size(); i++) {
			subSys = subSyss.getJSONObject(i);
			code = subSys.getString("code");
			res = subSysPatternApiFeign.querySysPatterns(code, null);
			if (!res.getBooleanValue("success")) {
				throw new EminException(res.getString("code"));
			}
			patterns = res.getJSONArray(ApplicationConstain.RESULT_STRING);
			subSys.put("patterns", patterns);
		}
		return subSyss;
	}
}
