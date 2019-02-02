package com.emin.platform.smw.controller;

import java.text.SimpleDateFormat;
import java.util.Date;

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
import com.emin.base.exception.EminException;
import com.emin.platform.smw.constain.ApplicationConstain;
import com.emin.platform.smw.filter.MenuOperationFilter;
import com.emin.platform.smw.interfaces.AlarmApiFeign;
import com.emin.platform.smw.interfaces.AreaApiFeign;
import com.emin.platform.smw.interfaces.CentralConApiFeign;
import com.emin.platform.smw.interfaces.CustomerAnalysisApiFeign;
import com.emin.platform.smw.interfaces.DeviceApiFeign;
import com.emin.platform.smw.interfaces.FloorApiFeign;
import com.emin.platform.smw.interfaces.StoreApiFeign;
import com.emin.platform.smw.util.UserClaim;

@Controller
@RequestMapping("/store")
public class StoreController extends HeaderCommonController {
	private static final Logger LOGGER = Logger.getLogger(StoreController.class);
	@Value("${spring.application.code}")
	private String appCode;

	@Autowired
	MenuOperationFilter menuOperationFilter;

	@Autowired
	StoreApiFeign storeApiFeign;
	
	@Autowired
	FloorApiFeign floorApiFeign;
	
	@Autowired
	AreaApiFeign areaApiFeign;
	
	@Autowired
	CentralConApiFeign centralConApiFeign;
	
	@Autowired
	DeviceApiFeign deviceApiFeign;
	
	@Autowired
	AlarmApiFeign alarmApiFeign;
	
	@Autowired
	CustomerAnalysisApiFeign customerAnalysisApiFeign;

	@RequestMapping("/index")
	public ModelAndView index(Long areaId, Long floorId,String subModule) {
		ModelAndView mv = new ModelAndView("modules/store/manage");
		JSONObject res = new JSONObject();
        UserClaim userClaim = this.validateAuthorizationToken();
		Long mallId = userClaim.getMallId();
		mv.addObject("mallId", mallId);
		mv.addObject("areaId", areaId);
		mv.addObject("floorId", floorId);
		mv.addObject("subModule", subModule);
		mv.addObject("devicesMonitorModuleId", "store-devices-monitor");
		try {
			res = storeApiFeign.queryDetail(mallId);
			if (!res.isEmpty()) {
				if (!res.getBooleanValue("success")) {
					throw new EminException(res.getString("code"));
				}
				mv.addObject("storeinfo", res.getJSONObject(ApplicationConstain.RESULT_STRING));
			}
		} catch (Exception e) {
			LOGGER.error("商场信息管理界面跳转，加载商场信息出现异常->" + e.getMessage());
		}

		try {
			res = areaApiFeign.list(null);
			this.dealException(res);
			mv.addObject("areas", res.getJSONArray(ApplicationConstain.RESULT_STRING));
		} catch (Exception e) {
			LOGGER.error("商场信息管理界面跳转，加载区域出现异常->" + e.getMessage());
		}
		try {
			JSONObject params = new JSONObject();
			params.putIfAbsent("userId", this.validateAuthorizationToken().getId());
			String operationCodes = menuOperationFilter.menuOperations("top-store", params);
			mv.addObject("operationCodes", operationCodes);
		} catch (Exception e) {
			LOGGER.error("商场信息管理界面跳转，加载权限出现异常->" + e.getMessage());
		}
		
		return mv;
	}
	
	@RequestMapping("/areas")
	@ResponseBody
	public JSONObject areas() {
		JSONObject res = areaApiFeign.list(null);
		if (!res.getBooleanValue("success")) {
			throw new EminException(res.getString("code"));
		}
		return res;
	}
	
	@RequestMapping("/save")
	@ResponseBody
	public JSONObject save(Long id, String key, String value) {
		JSONObject res = storeApiFeign.perfectEcm(id, key, value);
		
		if (!res.getBooleanValue("success")) {
			throw new EminException(res.getString("code"));
		}
		return res;
	}
	
	
	@RequestMapping("/floor-info")
	@ResponseBody
	public ModelAndView goForm(Long id, Long floorId) {
		ModelAndView mv = new ModelAndView("modules/store/floor-info");
		JSONObject res = new JSONObject();
		UserClaim userClaim = this.validateAuthorizationToken();
		Long mallId = userClaim.getMallId();
		if (id != null) {
			try {
				res = areaApiFeign.getFloors(id);
				this.dealException(res, "/api-smart-mall-floor/area/queryFloorByArea");
			} catch(Exception e) {
				LOGGER.error("跳转楼层平面图管理界面，加载楼层信息报错！错误信息->" + e.getMessage());
			}
			mv.addObject("floorList", res.getJSONArray(ApplicationConstain.RESULT_STRING));
		}
		
		mv.addObject("mallId", mallId);
		mv.addObject("floorId", floorId);
		
		try {
			JSONObject params = new JSONObject();
			params.putIfAbsent("userId", this.validateAuthorizationToken().getId());
			String operationCodes = menuOperationFilter.menuOperations("top-store", params);
			mv.addObject("operationCodes", operationCodes);
		} catch (Exception e) {
			LOGGER.error("商场信息管理-楼层平面图管理界面跳转，加载权限出现异常->" + e.getMessage());
		}
		return mv;	
	}
	
	@RequestMapping("/floor-form")
	@ResponseBody
	public ModelAndView floorForm(Long id, Long areaId) {
		ModelAndView mv = new ModelAndView("modules/store/floor-form");
		if (id != null) {
			JSONObject res = new JSONObject();
			try {
				res = floorApiFeign.detail(id);
			} catch(Exception e) {
				LOGGER.error("加载楼层表单界面，查询楼层详情失败！错误详情->" + e.getMessage());
			}
			if (!res.getBooleanValue("success")) {
				throw new EminException(res.getString("code"));
			}
			mv.addObject("floor", res.getJSONObject(ApplicationConstain.RESULT_STRING));
		}
		mv.addObject("areaId", areaId);
		return mv;	
	}


	@RequestMapping("/mag-tpl")
	@ResponseBody
	public ModelAndView magTpl() {
		ModelAndView mv = new ModelAndView("modules/store/floor-pg-mag-tpl");
		return mv;
	}
	
	@RequestMapping("/area-form")
	@ResponseBody
	public ModelAndView areaForm(Long id, String name) {
		ModelAndView mv = new ModelAndView("modules/store/area-form");
		if (id != null) {
			JSONObject res = areaApiFeign.list(id);
			this.dealException(res);
			mv.addObject("info", res.getJSONArray(ApplicationConstain.RESULT_STRING).get(0));
		}
		return mv;	
	}

	@RequestMapping("/vertical-view")
	@ResponseBody
	public ModelAndView verticalView(Long id) {
		ModelAndView mv = new ModelAndView("modules/store/vertical-view");
		UserClaim userClaim = this.validateAuthorizationToken();
		Long mallId = userClaim.getMallId();
		JSONArray configedAreas = new JSONArray();
		JSONArray unconfigAreas = new JSONArray();
		try {
			try {
				JSONObject params = new JSONObject();
				params.putIfAbsent("userId", this.validateAuthorizationToken().getId());
				String operationCodes = menuOperationFilter.menuOperations("top-store", params);
				mv.addObject("operationCodes", operationCodes);
			} catch (Exception e) {
				LOGGER.error("商场信息管理界面跳转，加载权限出现异常->" + e.getMessage());
			}
			JSONObject res = areaApiFeign.queryConfigedAreas(true);
			this.dealException(res);
			configedAreas = res.getJSONArray(ApplicationConstain.RESULT_STRING);
			if (configedAreas != null && !configedAreas.isEmpty()) {
				for (int i = 0; i < configedAreas.size(); i++) {
					JSONObject area = configedAreas.getJSONObject(i);
					Long areaId = area.getLong("id");
					res = areaApiFeign.getVerticalView(mallId, areaId, null);
					this.dealException(res);
					area.put("picture", res.getJSONObject(ApplicationConstain.RESULT_STRING));
					res = areaApiFeign.getLayoutCoordinateByAreaId(areaId);
					this.dealException(res);
					area.put("layoutConfig", res.getJSONObject(ApplicationConstain.RESULT_STRING));
				}
			}
			res = areaApiFeign.queryConfigedAreas(false);
			this.dealException(res);
			unconfigAreas = res.getJSONArray(ApplicationConstain.RESULT_STRING);
			if (unconfigAreas != null && !unconfigAreas.isEmpty()) {
				for (int i = 0; i < unconfigAreas.size(); i++) {
					JSONObject area = unconfigAreas.getJSONObject(i);
					Long areaId = area.getLong("id");
					res = areaApiFeign.getVerticalView(mallId, areaId, null);
					this.dealException(res);
					area.put("picture", res.getJSONObject(ApplicationConstain.RESULT_STRING));
				}
			}
		} catch (Exception e) {
			LOGGER.error("加载园区俯视图界面，查询配置俯视图列表失败！错误详情->" + e.getMessage());
		}
		
		mv.addObject("configedAreas", configedAreas);
		mv.addObject("unconfigAreas", unconfigAreas);
		mv.addObject("mallId", mallId);
		return mv;	
	}
	
	@RequestMapping("/getLayoutView")
	@ResponseBody
	public JSONObject getLayoutView() {
        UserClaim userClaim = this.validateAuthorizationToken();
		Long mallId = userClaim.getMallId();
		JSONObject res = areaApiFeign.getVerticalView(mallId, null, null);
		this.dealException(res);
		return res;
	}
	@RequestMapping("/getLayoutConfigByAreaId")
	@ResponseBody
	public JSONObject getLayoutConfigByAreaId(Long areaId) {
		JSONObject res = areaApiFeign.getLayoutCoordinateByAreaId(areaId);
		this.dealException(res);
		return res;
	}
	
	@RequestMapping("/saveLayoutConfig")
	@ResponseBody
	public JSONObject saveLayoutConfig(String data) {
		JSONObject res = areaApiFeign.saveLayoutCoordinates(data);
		this.dealException(res);
		return res;
	}

	@RequestMapping("/getConfigedAreas")
	@ResponseBody
	public JSONObject getConfigedAreas(String isConfiged) {
		boolean flag = true;
		if (isConfiged == null || isConfiged == "false") {
			flag = false;
		}
		JSONObject res = areaApiFeign.queryConfigedAreas(flag);
		this.dealException(res);
		return res;
	}
	//子系统管理
	@RequestMapping("/sub-system")
	public ModelAndView subsystemindex(String code) {
		ModelAndView mv = new ModelAndView("modules/store/sub-system-manage");
		JSONObject res = new JSONObject();
		try {
			res = centralConApiFeign.querySystem(code);
			mv.addObject("pages", res.getJSONArray(ApplicationConstain.RESULT_STRING));
		} catch (Exception e) {
			LOGGER.error("加载子系统管理界面时报错！错误信息->" + e.getMessage());
		}
		
		JSONObject params = new JSONObject();
		params.putIfAbsent("userId", this.validateAuthorizationToken().getId());
		try {
			String operationCodes = menuOperationFilter.menuOperations("top-store", params);
			mv.addObject("operationCodes", operationCodes);
		} catch (Exception e) {
			LOGGER.error("加载子系统管理权限时报错！错误信息->" + e.getMessage());
		}
		
		
		return mv;
	}
	
	/**
	 * 表单界面
	 * @param code 子系统code//有值为编辑，无值为配置
	 */
	@RequestMapping("/sub-system-form")
	public ModelAndView subSysConfig(String code) {
		ModelAndView mv = new ModelAndView("modules/store/sub-system-form");
		JSONObject res = new JSONObject();
		JSONArray allSubSys = new JSONArray();
		JSONArray noSetSubSys = new JSONArray();
		Boolean status = false;
		try {
			res = centralConApiFeign.queryAllSystem(code);
		} catch (Exception e) {
			LOGGER.error("加载允许接入的子系统数据时报错！错误信息->" + e.getMessage());
		}
		if (!res.isEmpty()) {
			if (!res.getBooleanValue("success")) {
				throw new EminException(res.getString("code"));
			}
			allSubSys = res.getJSONArray(ApplicationConstain.RESULT_STRING);
		}
		if(code!=null) {//编辑
			try {
				res = centralConApiFeign.querySystem(code);
			} catch (Exception e) {
				LOGGER.error("加载子系统数据时报错！错误信息->" + e.getMessage());
			}
			if (!res.isEmpty()) {
				if (!res.getBooleanValue("success")) {
					throw new EminException(res.getString("code"));
				}
				mv.addObject("sysInfo", res.getJSONArray(ApplicationConstain.RESULT_STRING).getJSONObject(0));
			}
			mv.addObject("allSubSys", allSubSys);
			mv.addObject("directive","edit");
		} else {
			try {
				res = centralConApiFeign.querySystem(null);
			} catch (Exception e) {
				LOGGER.error("加载子系统数据时报错！错误信息->" + e.getMessage());
			}
			if (!res.isEmpty()) {
				
				if (!res.getBooleanValue("success")) {
					throw new EminException(res.getString("code"));
				}
				JSONArray  result = res.getJSONArray(ApplicationConstain.RESULT_STRING);
			
				for(int j = 0; j < allSubSys.size(); j ++) {
					JSONObject item = allSubSys.getJSONObject(j);
					String itemCode = item.getString("code");
					status = false;
					for(int i = 0; i < result.size(); i++) {
						JSONObject sub = result.getJSONObject(i);
						String subCode = sub.getString("code");
						
						if(itemCode.equals(subCode)) {
							status = true;
						}
					}
					if(!status) {
						noSetSubSys.add(item);
					}
				}
				mv.addObject("allSubSys", noSetSubSys);
			}
		}
		return mv;
	}

	/**
	 * 设备数据统计
	 * @param floorId 楼层id
	 * @param systemCode 系统码
	 * @return
	 */
	@GetMapping("/statisticData")
	@ResponseBody
	public JSONObject statisticData(Integer floorId, String systemCode) {
		JSONObject res = new JSONObject();
		JSONObject result = new JSONObject();
		JSONObject amountRes = deviceApiFeign.getDeviceCount(systemCode, null, floorId);
		this.dealException(amountRes);
		result.put("amount", amountRes.getInteger("result"));
		JSONObject errorRes = deviceApiFeign.getErrorCount(systemCode, null, floorId);
		this.dealException(errorRes);
		result.put("error", errorRes.getInteger("result"));
		if (systemCode != null) {
			JSONObject stateRes = deviceApiFeign.getCountBusinessStateBySubsystemCode(systemCode, null, floorId);
			this.dealException(stateRes);
			result.put("others", stateRes.getJSONArray("result"));
		}
		res.put("success", true);
		res.put("result", result);
		return res;
	}
	
	/**
	 * 删除商城与区域图片匹配关系
	 * @param areaId 区域id
	 */
	
	@GetMapping("/delAreaPositionMatch")
	@ResponseBody
	public JSONObject delAreaPositionMatch(Long areaId) {
		JSONObject res = areaApiFeign.delAreaPositionMatch(areaId);
		this.dealException(res);
		return res;
	}
	
}