package com.emin.platform.smw.controller;

import java.util.Calendar;
import java.util.Date;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import com.alibaba.fastjson.JSONObject;
import com.emin.platform.smw.filter.MenuOperationFilter;
import com.emin.platform.smw.interfaces.ReportApiFeign;
import com.emin.platform.smw.util.UserClaim;

@Controller
@RequestMapping("/report")
public class ReportController extends HeaderCommonController {
	private static final Logger LOGGER = Logger.getLogger(UserController.class);
	@Value("${spring.application.code}")
	private String appCode;

	@Autowired
	MenuOperationFilter menuOperationFilter;
	
	@Autowired
	ReportApiFeign reportApiFeign;

	@RequestMapping("/index")
	public ModelAndView index() {
		ModelAndView mv = new ModelAndView("modules/report/manage");
		try {
			JSONObject params = new JSONObject();
			params.putIfAbsent("userId", this.validateAuthorizationToken().getId());
			String operationCodes = menuOperationFilter.menuOperations("report", params);
			mv.addObject("operationCodes", operationCodes);
		} catch (Exception e) {
			LOGGER.error("报表生成及下载界面跳转，加载权限出现异常->" + e.getMessage());
		}
		return mv;
	}
	
	/**
	 * 分页查询
	 * @param createTime 生成日期
	 * @param keyword 查询字段
	 * @param reportType 报表类型
	 * @return
	 */
	@RequestMapping("/getPage")
	@ResponseBody
	public JSONObject getPage(Long createTimeStart, Long createTimeEnd, String keyword, String reportType) {
		JSONObject res;
		Integer page = getPageRequestData().getCurrentPage();
		Integer limit = getPageRequestData().getLimit();
		JSONObject params = new JSONObject();
		params.put("createTimeStart", createTimeStart);
		params.put("createTimeEnd", createTimeEnd);
		params.put("reportType", reportType);
		params.put("keyword", keyword);
		res = reportApiFeign.page(params.toJSONString(), "createTime", "desc", page, limit);
		this.dealException(res);
		return res;
	}
	
	/**
	 * 注册一个报表任务,返回当前任务的id
	 * @param reportRegister 注册参数
	 */
	@RequestMapping("/register")
	@ResponseBody
	public JSONObject register(String reportRegister) {
		JSONObject res;
		UserClaim userClaim = this.validateAuthorizationToken();
		JSONObject reportRegisterObj = JSONObject.parseObject(reportRegister);
		if(reportRegisterObj.getString("engineId") == null) {
			reportRegisterObj.put("engineId", "singleDataBaseEngine");
		}
		reportRegisterObj.put("ecmId", userClaim.getEcmId());
		reportRegisterObj.put("userId", userClaim.getId());
		reportRegisterObj.put("userName", userClaim.getRealName());
		res = reportApiFeign.register(reportRegisterObj.toJSONString());
		this.dealException(res);
		return res;
	}
	
	/**
	 * 重新执行任务
	 * @param taskId 报表任务id
	 */
	@RequestMapping("/reTry")
	@ResponseBody
	public JSONObject reTry(String taskId) {
		JSONObject res;
		res = reportApiFeign.retry(taskId);
		this.dealException(res);
		return res;
	}

	/**
	 * 删除报表
	 * @param taskId 报表任务id
	 */
	@RequestMapping("/remove")
	@ResponseBody
	public JSONObject remove(String taskId) {
		JSONObject res;
		res = reportApiFeign.delete(taskId);
		this.dealException(res);
		return res;
	}
	
	/**
	 * 报表详情
	 * @param taskId 报表任务id
	 */
	@RequestMapping("/taskDetail")
	@ResponseBody
	public JSONObject taskDetail(String taskId) {
		JSONObject res;
		res = reportApiFeign.taskDetail(taskId);
		this.dealException(res);
		return res;
	}
	
	/**
	 * 获取现在的时间
	 */
	@GetMapping("/getNowDate")
	@ResponseBody
	public JSONObject getNowDate() {
		Calendar calendar = Calendar.getInstance();
        Date now = new Date();
        calendar.setTime(now);
		JSONObject res = new JSONObject();
		res.put("success", true);
		res.put("result", System.currentTimeMillis());
		return res;
	}
}
