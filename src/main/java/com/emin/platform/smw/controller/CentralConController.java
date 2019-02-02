package com.emin.platform.smw.controller;

import java.text.SimpleDateFormat;

import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import com.alibaba.fastjson.JSON;
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
import com.emin.platform.smw.interfaces.GroupDeviceApiFeign;
import com.emin.platform.smw.util.UserClaim;

@Controller
@RequestMapping("/central-con")
public class CentralConController extends HeaderCommonController {
	private static final Logger LOGGER = Logger.getLogger(CentralConController.class);
	@Value("${spring.application.code}")
	private String appCode;

	@Autowired
	MenuOperationFilter menuOperationFilter;
	@Autowired
	CentralConApiFeign centralConApiFeign;
	@Autowired
	DeviceApiFeign deviceApiFeign;
	@Autowired
	AlarmApiFeign alarmApiFeign;
	@Autowired
	CustomerAnalysisApiFeign customerAnalysisApiFeign;
	@Autowired
	FloorApiFeign floorApiFeign;
	@Autowired
	AreaApiFeign areaApiFeign;
	@Autowired
	GroupDeviceApiFeign groupDeviceApiFeign;
	
	@RequestMapping("/index")
	public ModelAndView index(String code) {
		ModelAndView mv = new ModelAndView("modules/central-con/manage");
		JSONObject res;
		JSONArray susSystems = new JSONArray();
		JSONArray allSystemPanels = new JSONArray();
		JSONObject list = new JSONObject();
		try {
			res = centralConApiFeign.basicPanelData(this.validateAuthorizationToken().getId(),null);
			allSystemPanels = res.getJSONArray(ApplicationConstain.RESULT_STRING);
			mv.addObject("allSystemPanels", res);
		} catch (Exception e) {
			LOGGER.error("加载子系统监控信息报错！错误信息->" + e.getMessage());
		}
		try {
			res = centralConApiFeign.personalPanelData(this.validateAuthorizationToken().getId());
			JSONObject item;
			susSystems = res.getJSONArray(ApplicationConstain.RESULT_STRING);
			for(int i = 0; i < susSystems.size(); i++) {
				item = susSystems.getJSONObject(i);
				if(item.getString("code").equals("passengerflow")) {
					JSONArray systemMonitorDtos = item.getJSONArray("userSystemMonitorDtos");
					for(int j = 0; j < systemMonitorDtos.size(); j ++) {
						if(systemMonitorDtos.getJSONObject(j).getString("code").equals("passengerflow-visitor-count")) {
							item.put("hasHourPassengerFlow", true);
						}
					}
				}
				for(int j = 0; j < allSystemPanels.size(); j++) {
					JSONObject oneSys = allSystemPanels.getJSONObject(j);
					if(item.getString("code").equals(oneSys.getString("code"))) {
						item.put("subModuleNum", oneSys.getJSONArray("userSystemMonitorDtos").size());
					}
				}
			}
			res.put("result", susSystems);
			mv.addObject("subsystemPanels", res);
		} catch (Exception e) {
			LOGGER.error("子系统监控页面跳转，加载子系统数据报错！错误信息->" + e.getMessage());
		}
		try {
			res = centralConApiFeign.queryAllBusinessStateBySubsystemCode("door");
			list.put("door", res.getJSONArray(ApplicationConstain.RESULT_STRING));
			res = centralConApiFeign.queryAllBusinessStateBySubsystemCode("vedio");
			list.put("vedio", res.getJSONArray(ApplicationConstain.RESULT_STRING));
			mv.addObject("allStatus", list);
		} catch (Exception e) {
			LOGGER.error("加载子系统设备状态报错！错误信息->" + e.getMessage());
		}
		try {
			JSONObject params = new JSONObject();
			params.putIfAbsent("userId", this.validateAuthorizationToken().getId());
			String operationCodes = menuOperationFilter.menuOperations("top-central-con", params);
			mv.addObject("operationCodes", operationCodes);
		} catch (Exception e) {
			LOGGER.error("子系统监控页面跳转，加载权限出现异常->" + e.getMessage());
		}
		
		return mv;
	}
	
	//获取接入的子系统和显示在监控区域的子系统
	@RequestMapping("/subsystem-panels")
	@ResponseBody
	public JSONObject subsystemPanels(String code) {
		
		JSONObject res = new JSONObject();
		JSONObject result = new JSONObject();
		JSONArray susSystems = new JSONArray();
		JSONArray allSystemPanels = new JSONArray();
		
		//获取接入的子系统
		res = centralConApiFeign.basicPanelData(this.validateAuthorizationToken().getId(),null);
		this.dealException(res);
		allSystemPanels = res.getJSONArray(ApplicationConstain.RESULT_STRING);
		
		//获取监控界面显示的子系统	
		res = centralConApiFeign.personalPanelData(this.validateAuthorizationToken().getId());
		JSONObject item;
		susSystems = res.getJSONArray(ApplicationConstain.RESULT_STRING);
		for(int i = 0; i < susSystems.size(); i++) {
			item = susSystems.getJSONObject(i);
			if(item.getString("code").equals("passengerflow")) {
				JSONArray systemMonitorDtos = item.getJSONArray("userSystemMonitorDtos");
				for(int j = 0; j < systemMonitorDtos.size(); j ++) {
					if(systemMonitorDtos.getJSONObject(j).getString("code").equals("passengerflow-visitor-count")) {
						item.put("hasHourPassengerFlow", true);
					}
				}
			}
			for(int j = 0; j < allSystemPanels.size(); j++) {
				JSONObject oneSys = allSystemPanels.getJSONObject(j);
				if(item.getString("code").equals(oneSys.getString("code"))) {
					item.put("subModuleNum", oneSys.getJSONArray("userSystemMonitorDtos").size());
				}
			}
		}
		result.put("susSystems", susSystems);
		result.put("allSystemPanels", allSystemPanels);
		res.put("result", result);
		return res;
	}
	
	/**
	 * 查询子系统的监控数据
	 */
	@GetMapping("/getsSubSysMointerData")
	@ResponseBody
	public JSONObject getsSubysMointerData() {
		Long eventAlertTimeStart;
		Long eventAlertTimeEnd;
		JSONObject paramObj = new JSONObject();
		JSONObject res =centralConApiFeign.onlySystem();
		this.dealException(res);
		JSONArray susSystems = res.getJSONArray(ApplicationConstain.RESULT_STRING);
		susSystems = systemSort(susSystems);
		Calendar calendar = new GregorianCalendar();
		calendar.set(Calendar.HOUR_OF_DAY, 0);
		calendar.set(Calendar.MINUTE, 0);
		calendar.set(Calendar.SECOND, 0);
		calendar.set(Calendar.MILLISECOND, 0);
		eventAlertTimeStart = calendar.getTimeInMillis();
		eventAlertTimeEnd = eventAlertTimeStart + 24 * 60 * 60 * 1000 - 1000;
		for(int i = 0; i < susSystems.size(); i ++) {
			JSONObject item = susSystems.getJSONObject(i);
			String subSystemCode = item.getString("code");
			//获取设备总数
			JSONObject devides = deviceApiFeign.getDeviceCount(subSystemCode, null, null);
			this.dealException(devides);
			item.put("deviceNum", devides.getString(ApplicationConstain.RESULT_STRING));
			//获取异常设备数量
			JSONObject getCountPhysicalState = deviceApiFeign.getErrorCount(subSystemCode, null, null);
			this.dealException(getCountPhysicalState);
			item.put("unusualDeviceNum", getCountPhysicalState.getString(ApplicationConstain.RESULT_STRING));
			//获取报警数据	
			if(subSystemCode.equals("vedio")) {
				paramObj.put("eventAlertTimeStart", eventAlertTimeStart);
				paramObj.put("eventAlertTimeEnd", eventAlertTimeEnd);
				paramObj.put("businessSystemCode", subSystemCode);
				JSONObject alarm = alarmApiFeign.alarmSta(paramObj.toJSONString());
				this.dealException(alarm);
				item.put("todayAlarmNum", alarm.getString(ApplicationConstain.RESULT_STRING));
				paramObj.remove("eventAlertTimeStart");
				paramObj.remove("eventAlertTimeEnd");
				alarm = alarmApiFeign.alarmSta(paramObj.toJSONString());
				this.dealException(alarm);
				item.put("alarmNum", alarm.getString(ApplicationConstain.RESULT_STRING));
				paramObj.put("handlerStatus", 200);
				alarm = alarmApiFeign.alarmSta(paramObj.toJSONString());
				this.dealException(alarm);
				item.put("dealAlarmNum", alarm.getString(ApplicationConstain.RESULT_STRING));
				
			}
			//获取业务状态及数量
			if(subSystemCode.equals("vedio") || subSystemCode.equals("door") || subSystemCode.equals("ba")) {
				JSONObject getCountBusiness = deviceApiFeign.getCountBusinessStateBySubsystemCode(subSystemCode, null, null);
				this.dealException(getCountBusiness);
				item.put("deviceBusiness", getCountBusiness.getJSONArray(ApplicationConstain.RESULT_STRING));
			}
			//获取客流数据	
			if(subSystemCode.equals("passengerflow")) {
				SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
				Long todayTime = new Date().getTime();
				String todayDate = sdf.format(new Date(todayTime));
				
				JSONObject params = new JSONObject();
				params.put("beginDate", todayDate);
				params.put("endDate", todayDate);
				params.put("queryType", 4);
				params.put("flowType", 1);
				String paramsStr = JSONObject.toJSONString(params);
				JSONObject passengerFlow = customerAnalysisApiFeign.today(paramsStr, null, null);//今日客流量
				this.dealException(devides);
				item.put("passengerFlow", passengerFlow.getJSONObject(ApplicationConstain.RESULT_STRING));
				params.put("queryType", 5);
				paramsStr = JSONObject.toJSONString(params);
				passengerFlow = customerAnalysisApiFeign.hourPassengerFlow(paramsStr, null, null);//小时客流量
				this.dealException(devides);
				item.put("hourPassengerFlow", passengerFlow.getJSONObject(ApplicationConstain.RESULT_STRING));
			}
		}
		res.put("result", susSystems);
		return res;
	}
	
	/**
	 * 批量保存子系统配置
	 * @param subSystemList 保存配置的子系统数据
	 * @param directive 当前的操作指令：edit，add
	 */
	@PostMapping("/save")
	@ResponseBody
	public JSONObject saveSubSystem(String subSystemList,String directive) {
		JSONObject res;
		JSONArray obj = JSON.parseArray(subSystemList);
		JSONObject item;
		for(int i = 0; i < obj.size(); i++) {
			item = obj.getJSONObject(i);
			item.put("autoConfig", 1);
		}
		subSystemList = obj.toJSONString();
		if(directive.equals("add")) { // 新增
			res = centralConApiFeign.saveSubSystem(subSystemList);
		} else { //编辑
			res = centralConApiFeign.editSystem(subSystemList);
		}
		if (!res.getBooleanValue("success")) {
			throw new EminException(res.getString("code"));
		}
		return res;
	}
	
	/**
	 * 重置配置的子系统
	 * @param code 子系统的code
	 */
	@PostMapping("/resetSystem")
	@ResponseBody
	public JSONObject resetSystem(String code) {
		JSONObject res = centralConApiFeign.resetSystem(code);
		if (!res.getBooleanValue("success")) {
			throw new EminException(res.getString("code"));
		}
		return res;
	}
	
	/**
	 * 获取客流系统的数据
	 * @param code 子系统的code
	 */
	@GetMapping("/getPassengerFlow")
	@ResponseBody
	public JSONObject getPassengerFlow(String code) {
		JSONObject res;
		JSONObject devides;
		JSONObject result;
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
		Long todayTime = new Date().getTime();
		String todayDate = sdf.format(new Date(todayTime));
		JSONObject params = new JSONObject();
		params.put("beginDate", todayDate);
		params.put("endDate", todayDate);
		params.put("queryType", 4);
		params.put("flowType", 1);
		String paramsStr = JSONObject.toJSONString(params);
		res = customerAnalysisApiFeign.today(paramsStr, null, null);
		if (!res.getBooleanValue("success")) {
			throw new EminException(res.getString("code"));
		}
		devides = deviceApiFeign.getDeviceCount("passengerflow", null, null);
		result = res.getJSONObject(ApplicationConstain.RESULT_STRING);
		result.put("deviceNum", devides.getString(ApplicationConstain.RESULT_STRING));
		res.put(ApplicationConstain.RESULT_STRING, result);
		return res;
	}
	
	/**
	 * 根据子系统获取所有的设备状态
	 * @param subsystemCode 子系统的code
	 */
	@GetMapping("/queryAllBusinessStateBySubsystemCode")
	@ResponseBody
	public JSONObject queryAllBusinessStateBySubsystemCode(String subsystemCode) {
		JSONObject res = centralConApiFeign.queryAllBusinessStateBySubsystemCode(subsystemCode);
		this.dealException(res);
		return res;
	}
	/**
	 * 根据设备id获取设备信息，区域楼层信息
	 * @param id 设备id
	 */
	@GetMapping("/anomaly-device")
	@ResponseBody
	public ModelAndView anomalyDevice(Long id) {
		ModelAndView mv = new ModelAndView("modules/alarm/anomaly-location");
		try {
			UserClaim userClaim = this.validateAuthorizationToken();
			Long mallId = userClaim.getMallId();
			Long floorId = null;
			Long areaId = null;
			JSONObject res = new JSONObject();
			mv.addObject("id",id);
			mv.addObject("userId",userClaim.getId());
			mv.addObject("realName",userClaim.getRealName());
			if (id != null) {
				try {
					res = deviceApiFeign.detailNoStatus(id);
					this.dealException(res, "/api-smart-mall-floor/device/detailNoStatus/" +id);
					mv.addObject("device", res.getJSONObject(ApplicationConstain.RESULT_STRING));
					floorId =  res.getJSONObject(ApplicationConstain.RESULT_STRING).getLong("floorId");
				} catch (Exception e) {
					LOGGER.error("报警管理-报警设备定位点页面跳转，加载设备详情报错！错误信息->" + e.getMessage());
				}
				JSONObject group = new JSONObject();
				Long deviceGroupId = res.getJSONObject(ApplicationConstain.RESULT_STRING).getLong("deviceGroupId");

				group.put("deviceGroupId", deviceGroupId);
				group.put("deviceGroupName", res.getJSONObject(ApplicationConstain.RESULT_STRING).getString("deviceGroupName"));
				
				if (floorId != null) {
					try {
						res = floorApiFeign.detailNoStatus(floorId);
						this.dealException(res, "/api-smart-mall-floor/floor/queryFloorNoStatus?floorId=" + floorId);
						mv.addObject("floor", res.getJSONObject(ApplicationConstain.RESULT_STRING));
						areaId = res.getJSONObject(ApplicationConstain.RESULT_STRING).getLong("areaId");
					} catch (Exception e) {
						LOGGER.error("报警管理-报警设备定位点页面跳转，加载楼层详情报错！错误信息->" + e.getMessage());
					}
					
					try {
						res = areaApiFeign.getVerticalView(mallId, areaId, floorId);
						this.dealException(res, "/api-smart-mall-floor/area/queryAreaFloorPicture?mallId=" + mallId + "&areaId=" + areaId + "&floorId=" + floorId);
						mv.addObject("floorPg", res.getJSONObject(ApplicationConstain.RESULT_STRING));
					} catch (Exception e) {
						LOGGER.error("报警管理-报警设备定位点页面跳转，加载楼层平面图详情报错！错误信息->" + e.getMessage());
					}
					
					if(deviceGroupId != null) {
						JSONObject deviceGroup = new JSONObject();
						try {
							deviceGroup = groupDeviceApiFeign.detailGroup(deviceGroupId.intValue());
							this.dealException(deviceGroup);
							group.put("devideGroupRemark", deviceGroup.getJSONObject(ApplicationConstain.RESULT_STRING).getString("remark"));
						} catch (Exception e) {
							LOGGER.error("报警管理-报警设备定位点页面跳转，加载设备分组报错！错误信息->" + e.getMessage());
						}
					}
					mv.addObject("group",group);
					try {
						res = areaApiFeign.getVerticalView(mallId, null, null);
						this.dealException(res, "/api-smart-mall-floor/area/queryAreaFloorPicture?mallId=" + mallId + "&areaId=null&floorId=null");
						if (res.getJSONObject(ApplicationConstain.RESULT_STRING) != null) {
							mv.addObject("vv", res.getJSONObject(ApplicationConstain.RESULT_STRING));
							try {
								res = areaApiFeign.queryConfigedAreas(true);
								this.dealException(res, "/api-smart-mall-floor/area/queryAreaRatio?flag=true");
								JSONArray configedAreas = res.getJSONArray(ApplicationConstain.RESULT_STRING);
								if (configedAreas != null && !configedAreas.isEmpty()) {
									for (int i = 0; i < configedAreas.size(); i++) {
										JSONObject area = configedAreas.getJSONObject(i);
										Long configedAreaId = area.getLong("id");
										res = areaApiFeign.getVerticalView(mallId, configedAreaId, null);
										this.dealException(res, "/api-smart-mall-floor/area/queryAreaFloorPicture?mallId=" + mallId + "&areaId=" + configedAreaId + "&floorId=null");
										area.put("picture", res.getJSONObject(ApplicationConstain.RESULT_STRING));
										res = areaApiFeign.getLayoutCoordinateByAreaId(configedAreaId);
										this.dealException(res, "/api-smart-mall-floor/area/queryPictureRatio?areaId=" + configedAreaId);
										area.put("layoutConfig", res.getJSONObject(ApplicationConstain.RESULT_STRING));
									}
								}
								mv.addObject("configedAreas", configedAreas);
							} catch (Exception e) {
								LOGGER.error("报警管理-报警设备定位点页面跳转，加载已配置区域楼层俯视图信息报错！错误信息->" + e.getMessage());
							}
						}
					} catch (Exception e) {
						LOGGER.error("报警管理-报警设备定位点页面跳转，查询商场俯视图报错！错误信息->" + e.getMessage());
					}
				}
			}
		} catch (Exception e) {
			LOGGER.error("报警信息异常定位加载页面报错，错误信息->" + e.getMessage());
		}
		return mv;	
	}
	/**
	 * 获取模块权限
	 * @param paramStr 查询字段
	 */
	@GetMapping("/operationCodes")
	@ResponseBody
	public JSONObject operationCodes(String moduleCode) {
		JSONObject res = new JSONObject();
		res.put("success", true);
		res.put("message", "获取权限失败");
		try {
			JSONObject params = new JSONObject();
			params.putIfAbsent("userId", this.validateAuthorizationToken().getId());
			String operationCodes = menuOperationFilter.menuOperations(moduleCode, params);
			res.put("result", operationCodes);
			res.remove("message");
		} catch (Exception e) {
			LOGGER.error("加载权限出现异常->" + e.getMessage());
		}
		return res;
	}
	/**
	 * 查询允许接入的监控界面数据
	 * @param userId 用户id
	 */
	@GetMapping("/basic-Panel")
	@ResponseBody
	public ModelAndView basicPanelData(String keyword) {
		ModelAndView mv = new ModelAndView("modules/central-con/right-panel");
		try {
			JSONObject res = centralConApiFeign.basicPanelData(this.validateAuthorizationToken().getId(), keyword);
			mv.addObject("basicPanels", res.getJSONArray(ApplicationConstain.RESULT_STRING));
		} catch (Exception e) {
			LOGGER.error("子系统监控，加载监控面板管理信息报错！错误信息->" + e.getMessage());
		}
		mv.addObject("keyword", keyword);
		return mv;	
	}
	/**
	 * 查询允许监控的所有模块
	 * @param userId 用户id
	 */
	@GetMapping("/all-panels")
	@ResponseBody
	public JSONObject allPanelData(String keyword) {
		JSONObject res = centralConApiFeign.basicPanelData(this.validateAuthorizationToken().getId(),keyword);
		this.dealException(res);
		return res;	
	}
	/**
	 * 保存用户的个性化配置
	 * @param userId 用户id
	 * @param personality 用户配置
	 */
	@PostMapping("/savePersonality")
	@ResponseBody
	public JSONObject savePersonality(String personality,String systemCode) {
		JSONObject res = centralConApiFeign.savePersonality(this.validateAuthorizationToken().getId(), personality,systemCode);
		this.dealException(res);
		return res;
	}
	/**
	 * 删除系统显示
	 * @param userId 用户id
	 * @param systemCode 子系统code
	 */
	@GetMapping("/delPersonality")
	@ResponseBody
	public JSONObject delPersonality(String systemCode) {
		JSONObject res = centralConApiFeign.delPersonality(this.validateAuthorizationToken().getId(), systemCode);
		this.dealException(res);
		return res;
	}
	
	/**
	 * 获取设备状态
	 * @param subSystemCode 子系统code
	 */
	@GetMapping("/getPhysicalStateData")
	@ResponseBody
	public JSONObject getsPhysicalStateData(String subSystemCode) {
		JSONObject item = new JSONObject();
		//获取设备总数
		JSONObject res = deviceApiFeign.getDeviceCount(subSystemCode, null, null);
		this.dealException(res);
		item.put("deviceNum", res.getString(ApplicationConstain.RESULT_STRING));
		//获取异常设备数
		res = deviceApiFeign.getErrorCount(subSystemCode, null, null);
		this.dealException(res);
		item.put("unusualDeviceNum", res.getString(ApplicationConstain.RESULT_STRING));
		res.put("result", item);
		res.put("subSystemCode", subSystemCode);
		res.put("type", subSystemCode + "-device-status");
		return res;
	}
	
	/**
	 * 获取设备业务状态
	 * @param subSystemCode 子系统code
	 */
	@GetMapping("/getBusinessData")
	@ResponseBody
	public JSONObject getBusinessData(String subSystemCode) {
		JSONObject res = deviceApiFeign.getCountBusinessStateBySubsystemCode(subSystemCode, null, null);
		this.dealException(res);
		res.put("subSystemCode", subSystemCode);
		res.put("type", subSystemCode + "-run-status");
		return res;
	}
	
	/**
	 * 获取子系统报警数量
	 * @param subSystemCode 子系统code
	 */
	@GetMapping("/getAlarmData")
	@ResponseBody
	public JSONObject getAlarmData(String subSystemCode) {
		JSONObject paramObj = new JSONObject();
		JSONObject item = new JSONObject();
		paramObj.put("businessSystemCode", subSystemCode);
	
		JSONObject res = alarmApiFeign.alarmSta(paramObj.toJSONString());
		this.dealException(res);
		item.put("alarmNum", res.getString(ApplicationConstain.RESULT_STRING));
		paramObj.put("handlerStatus", 200);
		res = alarmApiFeign.alarmSta(paramObj.toJSONString());
		this.dealException(res);
		item.put("dealAlarmNum", res.getString(ApplicationConstain.RESULT_STRING));
		res.put("result", item);
		res.put("subSystemCode", subSystemCode);
		res.put("type", subSystemCode + "-alarm");
		return res;
	}
	
	/**
	 * 获取客流系统客流数据
	 * @param subSystemCode 子系统code
	 */
	@GetMapping("/getPpassengerFlowData")
	@ResponseBody
	public JSONObject getPpassengerFlowData() {
		JSONObject item = new JSONObject();
		String  subSystemCode = "passengerflow";
		
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
		Long todayTime = new Date().getTime();
		String todayDate = sdf.format(new Date(todayTime));
		
		JSONObject params = new JSONObject();
		params.put("beginDate", todayDate);
		params.put("endDate", todayDate);
		params.put("queryType", 4);
		params.put("flowType", 1);
		String paramsStr = JSONObject.toJSONString(params);
		JSONObject res = customerAnalysisApiFeign.today(paramsStr, null, null);//今日客流量
		this.dealException(res);
		item.put("passengerFlow", res.getJSONObject(ApplicationConstain.RESULT_STRING));
		params.put("queryType", 5);
		paramsStr = JSONObject.toJSONString(params);
		JSONObject passengerFlow = customerAnalysisApiFeign.hourPassengerFlow(paramsStr, null, null);//小时客流量
		this.dealException(passengerFlow);
		item.put("hourPassengerFlow", passengerFlow.getJSONObject(ApplicationConstain.RESULT_STRING));
		
		res.put("result", item);
		res.put("subSystemCode", subSystemCode);
		res.put("type", subSystemCode + "-visitor-count");
		return res;
	}
	
	
	
	public JSONArray systemSort(JSONArray data) {
		Integer size = data.size();
		JSONObject obj = new JSONObject();
		JSONArray arr1 = new JSONArray();//用于存放输出的结果
		JSONArray arr2 = new JSONArray();//用于存放无固定位置的项
		JSONObject item = new JSONObject();
		String systemCode;
		if(size > 1) {
			for(int i = 0; i < size; i++) {
				item = data.getJSONObject(i);
				systemCode = item.getString("code");
				if(systemCode.equals("vedio") || systemCode.equals("door") || systemCode.equals("passengerflow") || systemCode.equals("ba") || systemCode.equals("ap")) {
					obj.put(systemCode, item);
				} else {
					arr2.add(item);
				}
			}
			if(!obj.isEmpty()) {
				item = obj.getJSONObject("vedio");
				if(item != null) {
					arr1.add(item);
				}
				item = obj.getJSONObject("door");
				if(item != null) {
					arr1.add(item);
				}
				item = obj.getJSONObject("passengerflow");
				if(item != null) {
					arr1.add(item);
				}
				item = obj.getJSONObject("ap");
				if(item != null) {
					arr1.add(item);
				}
				item = obj.getJSONObject("ba");
				if(item != null) {
					arr1.add(item);
				}
				
				for(int i = 0; i < arr2.size(); i++) {
					arr1.add(arr2.getJSONObject(i));
				}
				return arr1;
			} else {
				return arr2;
			}
		} else {
			return data;
		}
		
	}
	
}
