package com.emin.platform.smw.controller;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.emin.base.dao.PageRequest;
import com.emin.platform.smw.constain.ApplicationConstain;
import com.emin.platform.smw.filter.MenuOperationFilter;
import com.emin.platform.smw.interfaces.AlarmApiFeign;
import com.emin.platform.smw.interfaces.AreaApiFeign;
import com.emin.platform.smw.interfaces.DeviceApiFeign;
import com.emin.platform.smw.interfaces.FloorApiFeign;
import com.emin.platform.smw.interfaces.GroupDeviceApiFeign;
import com.emin.platform.smw.interfaces.UserApiFeign;
import com.emin.platform.smw.util.DateUtil;
import com.emin.platform.smw.util.UserClaim;

@Controller
@RequestMapping("/alarm")
public class AlarmController extends HeaderCommonController {
	private static final Logger LOGGER = Logger.getLogger(AlarmController.class);
	@Value("${spring.application.code}")
	private String appCode;

	@Autowired
	MenuOperationFilter menuOperationFilter;
	
	@Autowired
	DeviceApiFeign deviceApiFeign;

	@Autowired
	AlarmApiFeign alarmApiFeign;
	
	@Autowired
	UserApiFeign userApiFeign;

	@Autowired
	FloorApiFeign floorApiFeign;
	
	@Autowired
	AreaApiFeign areaApiFeign;
	
	@Autowired
	GroupDeviceApiFeign groupDeviceApiFeign;

	@RequestMapping("/index")
	public ModelAndView index(Long eventAlertTimeStart, 
			Long eventAlertTimeEnd, 
			String keyword, 
			String subSystemCode, 
			Integer handlerStatus,
			Integer viewStatus,
			Integer eventSourceId) {
		ModelAndView mv = new ModelAndView("modules/alarm/manage");
		JSONObject res = new JSONObject();
		
		try {
			res = deviceApiFeign.subSystems(null);
		} catch (Exception e) {
			LOGGER.error("报警管理页面跳转，加载子系统数据报错！错误信息->" + e.getMessage());
		}
		this.dealException(res);
		mv.addObject("subsystems", res.getJSONArray(ApplicationConstain.RESULT_STRING));
		
		try {
			PageRequest pr = getPageRequestData();
			Integer curr = pr.getCurrentPage();
			Integer limit = pr.getLimit();
			String sort = "";
			if (handlerStatus == null) {
				handlerStatus = 0;
			}
			if (handlerStatus == 200) {
				sort = "handlerTime";
			} else {
				sort = "createTime";
			}
			JSONObject params = new JSONObject();
			params.put("eventAlertTimeStart", eventAlertTimeStart);
			params.put("eventAlertTimeEnd", eventAlertTimeEnd);
			params.put("keyword", keyword);
			params.put("businessSystemCode", subSystemCode);
			params.put("handlerStatus", handlerStatus);
			params.put("viewStatus", viewStatus);
			params.put("eventSourceId", eventSourceId);
			String paramsString = params.isEmpty() ? null : JSONObject.toJSONString(params);
			params.put("curr", curr);
			params.put("limit", limit);
			mv.addObject("params", params);
			
			res = alarmApiFeign.page(curr, limit, paramsString, sort, "desc");
			mv.addObject("pages", res.getJSONObject(ApplicationConstain.RESULT_STRING));
		} catch (Exception e) {
			LOGGER.error("报警管理页面跳转，加载子系统数据报错！错误信息->" + e.getMessage());
		}

		try {
			JSONObject params = new JSONObject();
			params.putIfAbsent("userId", this.validateAuthorizationToken().getId());
			String operationCodes = menuOperationFilter.menuOperations("top-alarm", params);
			mv.addObject("operationCodes", operationCodes);
		} catch (Exception e) {
			LOGGER.error("商场信息管理界面跳转，加载权限出现异常->" + e.getMessage());
		}
		return mv;
	}
	
	
	@RequestMapping("/anomaly-location")
	@ResponseBody
	public ModelAndView goAnomalyLocation(Long id) {
		ModelAndView mv = new ModelAndView("modules/alarm/anomaly-location");
		try {
			UserClaim userClaim = this.validateAuthorizationToken();
			Long mallId = userClaim.getMallId();
			Long deviceUUId = null;
			Long floorId = null;
			Long areaId = null;
			JSONObject res = new JSONObject();
			mv.addObject("id",id);
			mv.addObject("userId",userClaim.getId());
			mv.addObject("realName",userClaim.getRealName());
			try {
				res = alarmApiFeign.detail(id);
				this.dealException(res, "/api-smart-mall-event/eventSource/get/" + id);
				mv.addObject("info", res.getJSONObject(ApplicationConstain.RESULT_STRING));
				deviceUUId = res.getJSONObject(ApplicationConstain.RESULT_STRING).getLong("deviceUUId");
			} catch (Exception e) {
				LOGGER.error("报警管理-报警设备定位点页面跳转，加载报警详情报错！错误信息->" + e.getMessage());
			}
			if (deviceUUId != null) {
				try {
					res = deviceApiFeign.detailNoStatus(deviceUUId);
					this.dealException(res, "/api-smart-mall-floor/device/detailNoStatus/" + deviceUUId);
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
	
	@RequestMapping("/deal-history")
	@ResponseBody
	public ModelAndView goDealHistory(Long id) {
		ModelAndView mv = new ModelAndView("modules/alarm/deal-history");
		JSONObject res = new JSONObject();
		try {
			res = alarmApiFeign.detail(id);
		} catch (Exception e) {
			LOGGER.error("报警管理-处理记录页面跳转，加载报警详情报错！错误信息->" + e.getMessage());
		}

		this.dealException(res);
		
		mv.addObject("info", res.getJSONObject(ApplicationConstain.RESULT_STRING));
		return mv;	
	}
	
	@RequestMapping("/deal-info")
	@ResponseBody
	public ModelAndView goDealInfo(Long id) {
		ModelAndView mv = new ModelAndView("modules/alarm/deal-info");
		try {
			mv.addObject("id", id);
			JSONObject res = userApiFeign.userList(null, null, 1, 10000, true, true);
			this.dealException(res);
			
	
			mv.addObject("userId", this.validateAuthorizationToken().getId());
			mv.addObject("realName", this.validateAuthorizationToken().getRealName());
			JSONArray users = res.getJSONObject(ApplicationConstain.RESULT_STRING).getJSONArray("resultList");
			mv.addObject("users", users);
		} catch (Exception e) {
			LOGGER.error("报警管理-处理详情页面跳转，报错->" + e.getMessage());
		}
		return mv;	
	}
	@GetMapping("/page")
	@ResponseBody
	public JSONObject page(Long eventAlertTimeStart,
			Long eventAlertTimeEnd, 
			String keyword, 
			String subSystemCode, 
			Integer handlerStatus,
			Integer viewStatus,
			Integer eventSourceId,
			String rangeType) {
		
		PageRequest pr = getPageRequestData();
		Integer curr = pr.getCurrentPage();
		Integer limit = pr.getLimit();
		String sort = "";
		String order = "";
		if (handlerStatus == null) {
			handlerStatus = 0;
		}
		if (handlerStatus == 200) {
			sort = "handlerTime";
			order = "desc";
		} else {
			sort = "eventAlertLevel,createTime";
			order = "asc,desc";
		}
		JSONObject params = new JSONObject();
		String timeRange = "";
		if (rangeType == "all") {
			eventAlertTimeStart = null;
			eventAlertTimeEnd = null;
		}
		rangeType = rangeType == null ? "all" : rangeType;
		switch(rangeType) {
			case "all":
				timeRange = "";
				break;
			case "today": 
				timeRange = DateUtil.rangeToday();
				break;
			case "yesterday":
				timeRange = DateUtil.rangeYesterday();
				break;
			case "week":
				timeRange = DateUtil.rangeWeek();
				break;
		}

		if (!timeRange.equals("") && timeRange.indexOf(",") > 0) {
			eventAlertTimeStart = Long.valueOf(timeRange.split(",")[0]);
			eventAlertTimeEnd = Long.valueOf(timeRange.split(",")[1]);
		}
		params.put("eventAlertTimeStart", eventAlertTimeStart);
		params.put("eventAlertTimeEnd", eventAlertTimeEnd);
		params.put("keyword", keyword);
		params.put("businessSystemCode", subSystemCode);
		params.put("handlerStatus", handlerStatus);
		params.put("viewStatus", viewStatus);
		params.put("eventSourceId", eventSourceId);
		String paramsString = params.isEmpty() ? null : JSONObject.toJSONString(params);
		params.put("curr", curr);
		params.put("limit", limit);
			
		JSONObject res = alarmApiFeign.page(curr, limit, paramsString, sort, order);
		this.dealException(res);
		res.put("params", params);
		return res;
	}
	@PostMapping("/deal")
	@ResponseBody
	public JSONObject deal(String data) {
		JSONObject viewDoReadDto = new JSONObject();
		JSONObject res = alarmApiFeign.deal(data);
		this.dealException(res);
		JSONObject dealInfo = JSONObject.parseObject(data);
		Long eventId = dealInfo.getLong("eventSourceId");
		String userId = dealInfo.getString("handlerUserId");
		String userName = dealInfo.getString("handlerUserName");
		res = alarmApiFeign.finish(eventId, userId, userName);
		//处理过的报警置为已读；
		JSONArray array = new JSONArray();
		array.add(eventId);
		viewDoReadDto.put("eventSourceIds", array);
		viewDoReadDto.put("handlerUserId", userId);
		viewDoReadDto.put("handlerUserName", userName);
		
		alarmApiFeign.doRead(viewDoReadDto.toJSONString());
		
		this.dealException(res);
		return res;
	}
	/**
	 * 将选中的未读消息置为已读
	 * @param viewDoReadDto 当前已读信息
	 */
	@PostMapping("/doRead")
	@ResponseBody
	public JSONObject doRead(Long[] ids) {
		JSONObject res = new JSONObject();
		JSONObject viewDoReadDto = new JSONObject();
		UserClaim userClaim = this.validateAuthorizationToken();
	    if (userClaim.getId() == null) {
	            //验证不通过，则跳转到登录
	    	res.put("success", "false");
	        return res;
	    }
	    Long userId = userClaim.getId();
	    String userName = userClaim.getRealName();
		viewDoReadDto.put("handlerUserId", userId);
		viewDoReadDto.put("handlerUserName", userName);
		if(ids == null || ids.length == 0) {//不传id，全部置为已读
			res = alarmApiFeign.doAllRead(viewDoReadDto.toJSONString());
		} else {//将选中项置为已读
			viewDoReadDto.put("eventSourceIds", ids);
			res = alarmApiFeign.doRead(viewDoReadDto.toJSONString());
		}
		
		this.dealException(res);
		return res;
	}
	
	/**
	 * 根据业务系统获取当前告警次数汇总,不传参数,则标识为查询有效的告警信息
	 * @param paramStr 查询字段
	 */
	@GetMapping("/alarmSta")
	@ResponseBody
	public JSONObject alarmSta(String paramStr) {
		JSONObject res = alarmApiFeign.alarmSta(paramStr);
		this.dealException(res);
		return res;
	}
}