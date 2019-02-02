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
import com.emin.platform.smw.constain.ApplicationConstain;
import com.emin.platform.smw.filter.MenuOperationFilter;
import com.emin.platform.smw.interfaces.DeviceApiFeign;
import com.emin.platform.smw.interfaces.DeviceExceptionApiFeign;
import com.emin.platform.smw.interfaces.WorkOrderApiFeign;
import com.emin.platform.smw.util.UserClaim;

@Controller
@RequestMapping("/work-order")
public class WorkOrderController extends AbnormalCommon {
	private static final Logger LOGGER = Logger.getLogger(WorkOrderController.class);
	@Value("${spring.application.code}")
	private String appCode;

	private static final String R = ApplicationConstain.RESULT_STRING;

	@Autowired
	MenuOperationFilter menuOperationFilter;
	
	@Autowired
	DeviceApiFeign deviceApiFeign;

	@Autowired
	WorkOrderApiFeign woApiFeign;

	@Autowired
	DeviceExceptionApiFeign deApiFeign;

	/**
	 * 查询工单类型
	 * @return
	 */
	public JSONArray getHStats() {
		//JSONObject res = JSONObject.parseObject("{\"success\":true,\"code\":\"ok\",\"result\":[{\"code\":1,\"message\":\"设备异常\"},{\"code\":50,\"message\":\"物料报损\"},{\"code\":100,\"message\":\"其他\"}]}");
		JSONObject res = deApiFeign.getEventTypeCode();
		this.dealException(res);
		return res.getJSONArray(R);
	}

	/**
	 * 查询工单处理异常类型
	 * @return
	 */
	public JSONArray getAStats() {
		JSONObject res = deApiFeign.getAbnormalType();
		this.dealException(res);
		return res.getJSONArray(R);
	}

	@RequestMapping("/index")
	public ModelAndView index() {
		ModelAndView mv = new ModelAndView("modules/work-order/manage");
		try {
			mv.addObject("subsystems", getSubSystem());
			
			JSONObject indexParams = indexParams();
			/**
			 * 默认查询设备异常
			 */
			String hStat = indexParams().getString("hStat");
			JSONArray hStats = getHStats();
			if (hStat == null) {
				hStat = hStats.getJSONObject(0).getString("code");
			}
			indexParams.put("hStat", hStat);

			/**
			 * 默认按工单号降序排列
			 */
			String sort = indexParams.getString("sort");
			if (sort == null || sort.trim().equals("")) {
				indexParams.put("sort", "workOrderNumber");
				indexParams.put("order", "desc");
			}

			mv.addObject("params", indexParams);
			mv.addObject("hStats", hStats);

			JSONObject res = deApiFeign.canAssign(indexParams.getJSONObject("user").getInteger("id"));
			this.dealException(res);
			mv.addObject("assignStatus", res.getBoolean("result") ? 1 : 2);
			
			mv.addObject("hStats", hStats);
			
			JSONObject params = new JSONObject();
			params.putIfAbsent("userId", this.validateAuthorizationToken().getId());
			String operationCodes = menuOperationFilter.menuOperations("top-work-order", params);
			mv.addObject("operationCodes", operationCodes);

		
		} catch (Exception e) {
			LOGGER.error("工单管理页面跳转，加载子系统数据报错！错误信息->" + e.getMessage());
		}
		return mv;
	}
	
	@RequestMapping("/page")
	@ResponseBody
	public ModelAndView page() {
		ModelAndView mv = new ModelAndView("modules/work-order/list");
		JSONObject params = indexParams();
		/**
		 * 默认按工单号降序排列
		 */
		String sort = params.getString("sort");
		if (sort == null || sort.trim().equals("")) {
			params.put("sort", "workOrderNumber");
			params.put("order", "desc");
		}
		/**
		 * 接口访问以及异常拦截
		 */
		JSONObject res = new JSONObject();

		Long userId = params.getJSONObject("user").getLong("id");
		Integer type = params.getInteger("type"); // 工单状态
		type = type == null ? 100 : type;
		params.put("type", type);
		Integer hStatValue = null;
		String hStat = params.getString("hStat");
		if (hStat != null) {
			try {
				hStatValue = Integer.parseInt(hStat);
			} catch (Exception e) {
				hStatValue = 1;
			}
		}
		hStatValue = hStatValue == null ? 1 : hStatValue;
		try {
			if (type == 100) {
				res = woApiFeign.tasks(userId,
					params.getString("code"),
					params.getLong("bt"),
					params.getLong("et"),
					params.getString("keyword"),
					hStatValue,
					params.getInteger("page"),
					params.getInteger("limit"),
					params.getString("sort"),
					params.getString("order"));
				
			} else if (type == 200) {
				res = woApiFeign.assigns(userId,
					params.getString("code"),
					params.getLong("bt"),
					params.getLong("et"),
					params.getString("keyword"),
					hStatValue,
					params.getInteger("page"),
					params.getInteger("limit"),
					params.getString("sort"),
					params.getString("order"));
			} else if (type == 300) {
				res = woApiFeign.deals(userId,
					params.getString("code"),
					params.getLong("bt"),
					params.getLong("et"),
					params.getString("keyword"),
					hStatValue,
					params.getInteger("page"),
					params.getInteger("limit"),
					params.getString("sort"),
					params.getString("order"));
			}
			this.dealException(res);
		} catch(Exception e) {
			e.printStackTrace();
		}
		
		params.put("eventCount", 1);
		/**
		 * 必要参数关联传递
		 */
		mv.addObject("pages", res.getJSONObject("result"));
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
			mv.addObject("abnormalTypes", getAStats());

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
	public ModelAndView goDealHistory(Long id) {
		ModelAndView mv = new ModelAndView("modules/device-exception/deal-history");
		try {
			// 获取异常处理周期
			JSONObject res = deApiFeign.lifeCircle(id);
			this.dealException(res);
			mv.addObject("circle", res.getJSONObject(R));
		} catch (Exception e) {
			LOGGER.error("设备异常处理-处理记录页面跳转，加载报警详情报错！错误信息->" + e.getMessage());
		}

		return mv;	
	}

	/**
	 * 异常处理表单界面加载
	 * @param id 关联异常id
	 * @param rStat 异常已读状态
	 * @return 界面
	 */
	@RequestMapping("/deal-info")
	@ResponseBody
	public ModelAndView goDealInfo(Long id, Integer rStat) {
		ModelAndView mv = new ModelAndView("modules/work-order/deal-info");
		try {
			// 跳转到异常处理表单界面，传递关联异常编号
			mv.addObject("relateId", id);

			JSONObject res = deApiFeign.getAbnormalType();
			this.dealException(res);
			mv.addObject("abnormalTypes", res.getJSONArray(R));
		} catch (Exception e) {
			LOGGER.error("异常处理-处理详情页面跳转，报错->" + e.getMessage());
		}
		return mv;	
	}

	/**
	 * 异常指派表单界面加载
	 * @param id 关联异常id
	 * @param rStat 异常已读状态
	 * @return 界面
	 */
	@RequestMapping("/assign-form")
	@ResponseBody
	public ModelAndView assignForm(Long id, Integer rStat) {
		ModelAndView mv = new ModelAndView("modules/work-order/assign");
		
		try {
			mv.addObject("id", id);
			// 获得当前操作用户信息
			mv.addObject("user", this.validateAuthorizationToken());
			// 获得指派异常详情
			JSONObject res = deApiFeign.detail(id);
			this.dealException(res);
			mv.addObject("info", res.getJSONObject(R));
		} catch (Exception e) {
			LOGGER.error("设备异常处理-指派页面跳转，报错->" + e.getMessage());
		}
		return mv;	
	}

	/**
	 * 处理异常
	 * @param relateId 关联异常id
	 * @param type 异常类型
	 * @param conclusion 结论
	 * @param isHc 是否耗材
	 * @param hcDetail 耗材详情
	 * @param dealType 处理类型
	 * @return 处理结果
	 */
	@RequestMapping("/deal")
	@ResponseBody
	public JSONObject deal(Long relateId,
		Integer type,
		String conclusion,
		Integer isHc, 
		String hcDetail,
		Integer dealType) {

		UserClaim userClaim = this.validateAuthorizationToken();
		JSONObject data = new JSONObject();
		data.put("abnormalId", relateId);
		data.put("abnormalType", type);
		data.put("conclusion", conclusion);
		data.put("isMaterialConsumption", isHc == 2);
		data.put("materialDetail", hcDetail);
		data.put("dealType", dealType);
		data.put("dealUserId", userClaim.getId());
		data.put("dealUserName", userClaim.getRealName());
		data.put("dealUserPhone", userClaim.getMobile());
		JSONObject res = woApiFeign.deal(JSONObject.toJSONString(data));
		this.dealException(res);
		return res;
	}
	/**
	 * 接受，退回，认领工单
	 * @param id 关联异常id
	 * @param memo 行为备注
	 * @param operation 行为类型
	 * @return
	 */
	@RequestMapping("/transfer")
	@ResponseBody
	public JSONObject transfer(Long id, String memo, Integer operation, Integer rStat) {
		rStat = rStat == null ? 2 : rStat;
		readException(id, rStat);

		UserClaim userClaim = this.validateAuthorizationToken();
		JSONObject data = new JSONObject();
		data.put("abnormalId", id);
		data.put("memo", memo);
		data.put("operation", operation);
		data.put("userIdFrom", userClaim.getId());
		data.put("userNameFrom", userClaim.getRealName());
		data.put("userPhoneFrom", userClaim.getMobile());
		data.put("userIdTo", userClaim.getId());
		data.put("userNameTo", userClaim.getRealName());
		data.put("userPhoneTo", userClaim.getMobile());
		JSONObject res = woApiFeign.transfer(JSONObject.toJSONString(data));
		this.dealException(res);
		return res;
	}

	

	/**
	 * 指派
	 * @param data 指派信息
	 * @return 操作结果
	 */
	@RequestMapping("/assign")
	@ResponseBody
	public JSONObject assign(String data) {
		JSONObject res = woApiFeign.transfer(data);
		this.dealException(res);
		return res;
	}
}