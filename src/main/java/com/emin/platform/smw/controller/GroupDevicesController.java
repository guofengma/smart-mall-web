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
import com.emin.base.dao.PageRequest;
import com.emin.platform.smw.constain.ApplicationConstain;
import com.emin.platform.smw.filter.MenuOperationFilter;
import com.emin.platform.smw.interfaces.AreaApiFeign;
import com.emin.platform.smw.interfaces.DeviceApiFeign;
import com.emin.platform.smw.interfaces.FloorApiFeign;
import com.emin.platform.smw.interfaces.GroupDeviceApiFeign;


@Controller
@RequestMapping("/group-devices")
public class GroupDevicesController extends HeaderCommonController {
	private static final Logger LOGGER = Logger.getLogger(GroupDevicesController.class);
	@Value("${spring.application.code}")
	private String appCode;

	@Autowired
	MenuOperationFilter menuOperationFilter;

	@Autowired
	GroupDeviceApiFeign groupDeviceApiFeign;

	@Autowired
	AreaApiFeign areaApiFeign;

	@Autowired
	FloorApiFeign floorApiFeign;

	@Autowired
	DeviceApiFeign deviceApiFeign;
	/**
	 * 加载设备分组表单界面
	 */
	@RequestMapping("/groupForm")
	public ModelAndView groupForm(Integer id) {
		ModelAndView mv = new ModelAndView("modules/door/group-form");
		
		JSONObject res = new JSONObject();
		if (id != null) {
			try {
				res = groupDeviceApiFeign.detailGroup(id);
				this.dealException(res);
				res = res.getJSONObject(ApplicationConstain.RESULT_STRING);
			} catch (Exception e) {
				LOGGER.error("加载设备分组表单界面报错，错误信息->" + e.getMessage());
			}
		}
		mv.addObject("info", res);
		return mv;
	}

	@RequestMapping("/moveForm")
	public ModelAndView moveForm(String systemCode, Integer oldGroupId) {
		ModelAndView mv = new ModelAndView("modules/door/move-form");
		JSONObject res = new JSONObject();
		JSONObject unGroup = new JSONObject();
		unGroup.put("id", "-1");
		unGroup.put("deviceGroupName", "未分组");
		try {
			res = groupDeviceApiFeign.pageGroup(null, systemCode, 1, 10000);
			this.dealException(res);
			res = res.getJSONObject(ApplicationConstain.RESULT_STRING);
			JSONArray groups = res.getJSONArray("resultList");
			JSONArray moveGroups = new JSONArray();
			for (int i = 0; i < groups.size(); i++) {
				if (groups.getJSONObject(i).getInteger("id") != oldGroupId) {
					moveGroups.add(groups.getJSONObject(i));
				}
			}
			mv.addObject("moveGroups", moveGroups);
			mv.addObject("oldGroupId", oldGroupId);
		} catch (Exception e) {
			LOGGER.error("加载设备分组表单界面报错，错误信息->" + e.getMessage());
		}
		return mv;
	}
	
	/**
	 * 加载添加设备选择界面
	 */
	@RequestMapping("/devicesSelector")
	@ResponseBody
	public ModelAndView devicesSelector(String systemCode) {
		ModelAndView mv = new ModelAndView("modules/door/devices-selector");
		JSONObject res =  new JSONObject();
		JSONArray areas = new JSONArray();
		try {
			res = areaApiFeign.list(null);
			this.dealException(res);
			areas = res.getJSONArray(ApplicationConstain.RESULT_STRING);
			mv.addObject("areas", areas);
		} catch (Exception e) {
			LOGGER.error("未分组设备管理界面跳转，加载区域列表报错，错误信息->" + e.getMessage());
		}
		if (!areas.isEmpty()) {
			Long areaId = areas.getJSONObject(0).getLong("id");
			mv.addObject("areaId", areaId);
		}
		mv.addObject("systemCode", systemCode);
		return mv;	
	}

	/**
	 * 保存设备分组
	 */
	@RequestMapping("/saveGroup")
	@ResponseBody
	public JSONObject saveGroup(String data) {
		JSONObject res = groupDeviceApiFeign.saveGroup(data);
		this.dealException(res);
		return res;
	}

	/**
	 * 删除分组
	 */
	@RequestMapping("/removeGroup")
	@ResponseBody
	public JSONObject removeGroup(Integer id) {
		JSONObject res = groupDeviceApiFeign.removeGroup(id);
		this.dealException(res);
		return res;
	}

	/**
	 * 查询设备分组列表
	 */
	@RequestMapping("/lstGroup")
	@ResponseBody
	public JSONObject lstGroup(String systemCode, String name) {
		JSONObject res = groupDeviceApiFeign.pageGroup(name, systemCode, 1, 10000);
		this.dealException(res);
		return res;
	}
	
	/**
	 * 查询设备分组（包括设备数量）列表
	 */
	@RequestMapping("/lstGroupAndDeviceNum")
	@ResponseBody
	public JSONObject lstGroupAndDeviceNum(String systemCode, String name) {
		JSONObject res;
		JSONObject count;
		JSONObject result;
		JSONArray groups;
		JSONObject group;
		Long groupId = null;
		res = groupDeviceApiFeign.pageGroup(name, systemCode, 1, 10000);
		this.dealException(res);
		result = res.getJSONObject(ApplicationConstain.RESULT_STRING);
		groups = result.getJSONArray("resultList");
		for(int i = 0; i < groups.size(); i++) {
			group = groups.getJSONObject(i);
			groupId = group.getLong("id");
			count = groupDeviceApiFeign.getCountByDeviceGroupId(groupId, systemCode);
			this.dealException(count);
			group.put("deviceNum", count.getString(ApplicationConstain.RESULT_STRING));
		}
		count = groupDeviceApiFeign.getCountByDeviceGroupId(null, systemCode);
		this.dealException(count);
		result.put("unGroupDeviceNum", count.getString(ApplicationConstain.RESULT_STRING));
		result.put("groups", groups);
		res.put(ApplicationConstain.RESULT_STRING, result);
		return res;
	}

	/**
	 * 分组设备查询
	 */
	@RequestMapping("/pageGroupDevices")
	@ResponseBody
	public JSONObject pageGroupDevices(Integer groupId, String name, String versionCode) {
		PageRequest  pr = getPageRequestData();
		Integer page = pr.getCurrentPage();
		Integer limit = pr.getLimit();
		JSONObject res = groupDeviceApiFeign.pageGroupDevices(name, groupId, versionCode, page, limit);
		this.dealException(res);
		return res;
	}

	/**
	 * 未分组设备查询器
	 */
	@RequestMapping("/pageUngroupDevices")
	@ResponseBody
	public JSONObject pageUngroupDevices(String systemCode, String name, Integer areaId, Integer floorId,String versionCode) {
		PageRequest  pr = getPageRequestData();
		Integer page = pr.getCurrentPage();
		Integer limit = pr.getLimit();
		JSONObject res = groupDeviceApiFeign.pageUnGroupDevices(name, systemCode, areaId, floorId, versionCode, page, limit);
		this.dealException(res);
		if (areaId != null) {
			JSONObject floorsRes = areaApiFeign.getFloors(Long.valueOf(areaId));
			this.dealException(floorsRes);
			JSONArray floors = floorsRes.getJSONArray(ApplicationConstain.RESULT_STRING);
			res.put("floors", floors);
		}
		return res;
	}

	/**
	 * 添加设备至指定分组
	 */
	@RequestMapping("/addDevices")
	@ResponseBody
	public JSONObject addDevices(Integer groupId, Integer[] deviceIds) {
		JSONObject res = groupDeviceApiFeign.addDevices(groupId, deviceIds);
		this.dealException(res);
		return res;
	}

	/**
	 * 从设备分组中移除设备（归至未分类组）
	 */
	@RequestMapping("/removeDevices")
	@ResponseBody
	public JSONObject removeDevices(Integer groupId, Integer[] deviceIds) {
		JSONObject res = groupDeviceApiFeign.removeDevices(groupId, deviceIds);
		this.dealException(res);
		return res;
	}

	/**
	 * 将设备从当前设备分组移动至另一分组
	 */
	@RequestMapping("/moveDevices")
	@ResponseBody
	public JSONObject moveDevices(Integer[] deviceIds, Integer oldGroupId, Integer newGroupId) {
		JSONObject res = groupDeviceApiFeign.moveDevices(oldGroupId, newGroupId, deviceIds);
		this.dealException(res);
		return res;
	}

	@RequestMapping("/deviceDetail")
	public ModelAndView deviceDetail(Long deviceId) {
		ModelAndView mv = new ModelAndView("modules/door/device-detail");
		
		JSONObject res;
		if (deviceId != null) {
			try {
				res = deviceApiFeign.detail(deviceId);
				this.dealException(res);
				JSONObject detail = res.getJSONObject(ApplicationConstain.RESULT_STRING);
				Long floorId = detail.getLong("floorId");
				res = floorApiFeign.detail(floorId);
				this.dealException(res);
				JSONObject floor = res.getJSONObject(ApplicationConstain.RESULT_STRING);
				res = floorApiFeign.getPlanGraph(floorId);
				this.dealException(res);
				JSONObject floorPlanGraph = res.getJSONObject(ApplicationConstain.RESULT_STRING).getJSONObject("picture");
				detail.put("floor", floor);
				detail.put("planGraph", floorPlanGraph);
				res = deviceApiFeign.subSystems(detail.getString("systemCode"));
				this.dealException(res);
				String systemName = "";
				JSONArray brands = new JSONArray();
				if (!res.getJSONArray(ApplicationConstain.RESULT_STRING).isEmpty()) {
					JSONObject systemInfo = res.getJSONArray(ApplicationConstain.RESULT_STRING).getJSONObject(0);
					systemName = systemInfo.getString("name");
					brands = systemInfo.getJSONArray("brands");
				}
				detail.put("systemName", systemName);
				detail.put("brands", brands);
				mv.addObject("info", detail);
			
			} catch (Exception e) {
				LOGGER.error("设备详情界面跳转，加载设备相关信息报错，错误信息->" + e.getMessage());
			}
		}
		return mv;
	}
	
}