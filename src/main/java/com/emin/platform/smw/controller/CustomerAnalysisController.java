package com.emin.platform.smw.controller;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import java.text.SimpleDateFormat;
import java.util.Date;

import com.alibaba.fastjson.JSONObject;
import com.emin.platform.smw.constain.ApplicationConstain;
import com.emin.platform.smw.filter.MenuOperationFilter;
import com.emin.platform.smw.interfaces.CentralConApiFeign;
import com.emin.platform.smw.interfaces.CustomerAnalysisApiFeign;

@Controller
@RequestMapping("/customer-analysis")
public class CustomerAnalysisController extends HeaderCommonController {
	private static final Logger LOGGER = Logger.getLogger(CustomerAnalysisController.class);
	@Value("${spring.application.code}")
	private String appCode;

	@Autowired
	MenuOperationFilter menuOperationFilter;

	@Autowired
	CustomerAnalysisApiFeign customerAnalysisApiFeign;
	@Autowired
	CentralConApiFeign centralConApiFeign;
	/**
	 * 加载设备分组表单界面
	 */
	@RequestMapping("/index")
	public ModelAndView groupForm(Long beginTime, Long endTime) {
		ModelAndView mv = new ModelAndView("modules/customer-analysis/manage");
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
		JSONObject res = new JSONObject();
		JSONObject params = new JSONObject();
		String paramsStr = "";
		try {
			res = centralConApiFeign.querySystem("passengerflow");
		} catch(Exception e) {
			LOGGER.error("查询客流分析系统状态报错，错误提示->" + e.getMessage());
		}
		if(res.getJSONArray(ApplicationConstain.RESULT_STRING) == null) {
			mv.addObject("status", false);//未接入
		} else {
			mv.addObject("status", true);//未接入
			try {
				Boolean isNull = false;
				if (beginTime == null && endTime == null) {
					endTime = new Date().getTime();
					beginTime = endTime - (24 * 60 * 60 * 1000 * 10);
					isNull = true;
				}
				String beginDate = sdf.format(new Date(beginTime));
				String endDate = sdf.format(new Date(endTime));
				if (isNull) {
					mv.addObject("dateRangeMemo", "最近10天");
				} else {
					mv.addObject("dateRangeMemo", "统计区间：" + beginDate + "至" + endDate);
				}
				params.put("beginDate", beginDate);
				params.put("endDate", endDate);
				params.put("queryType", 4);
				params.put("flowType", 1);
				params.put("ageOrSex", -1);
				paramsStr = JSONObject.toJSONString(params);
				
				res = customerAnalysisApiFeign.all(paramsStr);
				this.dealException(res);
				res = res.getJSONObject(ApplicationConstain.RESULT_STRING);
				mv.addObject("analysis", res);
			} catch(Exception e) {
				LOGGER.error("客流分析页面跳转时候查询报表信息报错，错误提示->" + e.getMessage());
			}
			

			try {
				Long todayTime = new Date().getTime();
				String todayDate = sdf.format(new Date(todayTime));
				params.put("beginDate", todayDate);
				params.put("endDate", todayDate);
				paramsStr = JSONObject.toJSONString(params);
				res = customerAnalysisApiFeign.today(paramsStr, null, null);
				this.dealException(res);
				mv.addObject("today", res.getJSONObject(ApplicationConstain.RESULT_STRING));
			} catch(Exception e) {
				LOGGER.error("客流分析页面跳转时候查询今日客流信息报错，错误提示->" + e.getMessage());
			}
			

			mv.addObject("beginTime", beginTime);
			mv.addObject("endTime", endTime);
		}
		
		return mv;
	}

}