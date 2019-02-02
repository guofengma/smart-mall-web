package com.emin.platform.smw.controller;

import org.apache.commons.beanutils.ConvertUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.emin.platform.smw.constain.ApplicationConstain;
import com.emin.platform.smw.filter.MenuOperationFilter;
import com.emin.platform.smw.interfaces.DeviceExceptionApiFeign;
import com.emin.platform.smw.util.UserClaim;

/**
 * 异常设备管理控制层
 * By Danica
 * At 2018-10-30 17:55
 */
@Controller
@RequestMapping("/device-exception")
public class DeviceExceptionController extends AbnormalCommon {

	private static final Logger LOGGER = Logger.getLogger(DeviceExceptionController.class);

	
	@Value("${spring.application.code}")
	private String appCode;
	
	private static final String R = ApplicationConstain.RESULT_STRING;

	@Autowired
	MenuOperationFilter menuOperationFilter;

	@Autowired
	DeviceExceptionApiFeign deApiFeign;
	
	private JSONArray getHStats() {
		JSONObject res = deApiFeign.status();
		this.dealException(res);
		return res.getJSONArray(R);
	}

	private JSONArray getAbnormalType() {
		JSONObject res = deApiFeign.getAbnormalType();
		this.dealException(res);
		return res.getJSONArray(R);
	}
	/**
	 * 首页跳转
	 * 定向跳转，获得权限
	 * @return
	 */
	@RequestMapping("/index")
	public ModelAndView index() {
		ModelAndView mv = new ModelAndView("modules/device-exception/manage");
		try {
			mv.addObject("subsystems", getSubSystem());
			JSONObject indexParams = indexParams();
			/**
			 * 默认获得待认领的数据
			 */
			String hStat = indexParams.getString("hStat");
			JSONArray hStats = getHStats();
			if (hStat == null) {
				hStat = hStats.getJSONObject(0).getString("code");
			}
			indexParams.put("hStat", hStat);

			/**
			 * 默认按异常发生事件降序排列
			 */
			String sort = indexParams.getString("sort");
			if (sort == null || sort.trim().equals("")) {
				indexParams.put("sort", "happenTime");
				indexParams.put("order", "desc");
			}

			mv.addObject("params", indexParams);
			mv.addObject("hStats", hStats);
			JSONObject params = new JSONObject();
			params.putIfAbsent("userId", this.validateAuthorizationToken().getId());
			String operationCodes = menuOperationFilter.menuOperations("top-device-exception", params);
			mv.addObject("operationCodes", operationCodes);
		} catch (Exception e) {
			LOGGER.error("异常设备处理管理界面跳转，加载权限出现异常->" + e.getMessage());
		}
		return mv;
	}

	/**
	 * 异常设备列表查询
	 * @return
	 */
	@GetMapping("/page")
	@ResponseBody
	public ModelAndView page() {
		ModelAndView mv = new ModelAndView("modules/device-exception/list");
		JSONObject params = indexParams();
		System.out.println(JSONObject.toJSONString(params) + "..................");
		/**
		 * 默认按异常发生事件降序排列
		 */
		String sort = params.getString("sort");
		if (sort == null || sort.trim().equals("")) {
			params.put("sort", "happenTime");
			params.put("order", "desc");
		}
		/**
		 * 多状态查询字符串转数组处理
		 */
		String hStat = params.getString("hStat"); // 异常状态
		Long[] status = null;
		if (hStat != null && !hStat.equals("")) {
			status = (Long[])ConvertUtils.convert(hStat.split(","), Long.class);
		}

		/**
		 * 其他参数JSON状态化
		 */
		String code = params.getString("code"); // 系统编码
		Integer rStat = params.getInteger("rStat"); // 已读状态
		JSONObject keyMap = new JSONObject();
		if (code != null && !code.equals("")) {
			keyMap.put("systemCode", code);
		}
		if (rStat != null) {
			keyMap.put("readStatus", rStat);
		}
		String kmStr = JSONObject.toJSONString(keyMap);

		/**
		 * 接口访问以及异常拦截
		 */
		JSONObject res = deApiFeign.all(
			params.getJSONObject("user").getInteger("id"),
			params.getLong("bt"),
			params.getLong("et"),
			status, params.getInteger("page"),
			params.getInteger("limit"),
			params.getString("sort"),
			params.getString("order"),
			params.getString("keyword"), kmStr, 1);
		this.dealException(res);
		mv.addObject("pages", res.getJSONObject("result"));

		/**
		 * 必要参数关联传递
		 */
		mv.addObject("params", params);
		mv.addObject("userId", params.getJSONObject("user").getLong("id"));
		return mv;
	}

	/**
	 * 异常设备定位界面加载
	 * @param id 关联异常id
	 * @param rStat 异常已读状态
	 * @return 界面
	 */
	@RequestMapping("/anomaly-location")
	@ResponseBody
	public ModelAndView goAnomalyLocation(Long id, Integer rStat) {
		ModelAndView mv = new ModelAndView("modules/device-exception/anomaly-location");
		try {
			UserClaim userClaim = this.validateAuthorizationToken();
			mv.addObject("relateId",id);
			mv.addObject("user", userClaim);

			/**
			 * Step01 查询异常类型
			 */
			mv.addObject("abnormalTypes", getAbnormalType());

			/**
			 * Step02 根据异常设备数据id查询数据详情，并且获得设备id
			 */
			JSONObject res = deApiFeign.detail(id);
			this.dealException(res);
			JSONObject deInfo = res.getJSONObject(R);
			mv.addObject("info", deInfo);
			
			/**
			 * Step03 关联设备平面图相关
			 */
			mv = deviceRelates(deInfo.getLong("deviceId"), mv);

			// Step04 对当前操作异常设置已读
			readException(id, rStat);

		} catch (Exception e) {
			LOGGER.error("异常设备定位页面加载报错，错误信息->" + e.getMessage());
		}

		return mv;	
	}

	/**
	 * 异常历史追踪界面加载
	 * @param id 关联异常id
	 * @param rStat 异常已读状态
	 * @return 界面
	 */
	@RequestMapping("/deal-history")
	@ResponseBody
	public ModelAndView goDealHistory(Long id, Integer rStat) {
		ModelAndView mv = new ModelAndView("modules/device-exception/deal-history");

		try {
			// 对当前操作异常设置已读
			readException(id, rStat);
			// 获取异常处理周期
			JSONObject res = deApiFeign.lifeCircle(id);
			this.dealException(res);
			mv.addObject("circle", res.getJSONObject(ApplicationConstain.RESULT_STRING));
		} catch (Exception e) {
			LOGGER.error("设备异常处理-处理记录页面跳转，加载报警详情报错！错误信息->" + e.getMessage());
		}

		return mv;	
	}

	/**
	 * 设置已读
	 * @param ids （多个）异常id, 不传则全部设置已读
	 * @return 操作结果
	 */
	@RequestMapping("/doRead")
	@ResponseBody
	public JSONObject doRead(String ids) {
		Long[] idLongs = null;
		if (ids != null) {
			idLongs = (Long[])ConvertUtils.convert(ids.split(","), Long.class);
		}
		JSONObject res = deApiFeign.changeStatus(idLongs, 200);
		this.dealException(res);
		return res;
	}
	
	/**
	 * 获取未读异常数量
	 */
	@RequestMapping("/notRead")
	@ResponseBody
	public JSONObject notRead() {
		UserClaim userClaim = this.validateAuthorizationToken();
		JSONObject res = deApiFeign.notRead(userClaim.getId(), 1);
		this.dealException(res);
		return res;
	}



	
}