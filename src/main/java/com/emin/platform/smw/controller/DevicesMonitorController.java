package com.emin.platform.smw.controller;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import java.util.Date;
import java.util.HashSet;
import java.util.Set;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.emin.base.dao.PageRequest;
import com.emin.platform.smw.constain.ApplicationConstain;
import com.emin.platform.smw.filter.MenuOperationFilter;
import com.emin.platform.smw.interfaces.AreaApiFeign;
import com.emin.platform.smw.interfaces.CentralConApiFeign;
import com.emin.platform.smw.interfaces.DeviceApiFeign;
import com.emin.platform.smw.interfaces.FloorApiFeign;
import com.emin.platform.smw.interfaces.SupplierApiFeign;
import com.emin.platform.smw.util.UserClaim;

@Controller
@RequestMapping("/devices-monitor")
public class DevicesMonitorController extends HeaderCommonController {
	private static final Logger LOGGER = Logger.getLogger(StoreController.class);
	private static final String R = ApplicationConstain.RESULT_STRING;
	@Autowired
	MenuOperationFilter menuOperationFilter;
	@Autowired
	AreaApiFeign areaApi;
	@Autowired
	FloorApiFeign floorApi;
	@Autowired
	CentralConApiFeign centralConApiFeign;
	@Autowired
	DeviceApiFeign deviceApi;
	@Autowired
	SupplierApiFeign supplierApi;

	@RequestMapping("/index")
	public ModelAndView index(String systemCode) {
		ModelAndView mv = new ModelAndView("modules/devices-monitor/index");
		mv.addObject("systemCode", systemCode);
		return mv;
	}
	
	public JSONObject subSystems() {
		JSONObject subSystems = new JSONObject();
		JSONArray sortItems = new JSONArray();
		JSONArray canAddSystems = new JSONArray();
		String[] codes = new String[]{"vedio","door","ap","passengerflow"};
		try {
			JSONObject res = new JSONObject();
			res = deviceApi.queryShowDeviceSubSystem();
			this.dealException(res);
			JSONArray items = res.getJSONArray(R);

			// 系统码排序
			JSONArray otherItems = new JSONArray();

			for (String code : codes) {
				JSONObject item = new JSONObject();
				String systemCode = "";
				for (int i = 0; i < items.size(); i++) {
					item = items.getJSONObject(i);
					systemCode = item.getString("systemCode");
					if (code.equals(systemCode)) {
						break;
					}
				}
				if (systemCode.equals(code)) {
					sortItems.add(item);
				}
			}

			for (int i = 0; i < items.size(); i++) {
				JSONObject item = items.getJSONObject(i);
				String systemCode = item.getString("systemCode");
				Integer unCount = 0;
				for (String code : codes) {
					if (!code.equals(systemCode)) {
						unCount++;
					}				
				}
				if (unCount == codes.length) {
					otherItems.add(item);
				}
			}

			for (int i = 0; i < otherItems.size(); i++) {
				JSONObject item = otherItems.getJSONObject(i);
				sortItems.add(item);
			}
			
			// 可以进行添加编辑操作的系统
			res = deviceApi.queryAddDeviceVersion(null);
			this.dealException(res);
			JSONArray addItems = res.getJSONArray(R);
			Set<String> str_codes = new HashSet<String>();
			Set<String> str_vcodes = new HashSet<String>();
			for (int i = 0; i < addItems.size(); i++) {
				JSONObject item = addItems.getJSONObject(i);
				str_codes.add(item.getString("systemCode"));
				str_vcodes.add(item.getString("versionCode"));
			}
			for (Object code : str_codes) {
				String c = code.toString();
				JSONObject item = new JSONObject();
				String systemCode = "";
				for (int i = 0; i < items.size(); i++) {
					item = items.getJSONObject(i);
					systemCode = item.getString("systemCode");
					if (systemCode.equals(c)) {
						break;
					}
				}
				if (systemCode.equals(c)) {
					canAddSystems.add(item);
				}
			}

			subSystems.put("add_codes", str_codes);
			subSystems.put("add_vcodes", str_vcodes);
			subSystems.put("sortItems", sortItems);
			subSystems.put("addItems", canAddSystems);

		} catch (Exception e) {
			LOGGER.error("设备监控界面跳转，加载商场接入子系统出现异常->" + e.getMessage());
		}
		return subSystems;
	}

	@RequestMapping("/manage")
	public ModelAndView manage(Long timestamp) {
		ModelAndView mv = new ModelAndView("modules/devices-monitor/manage");
		try {
			JSONObject res = new JSONObject();
			res = areaApi.list(null);
			this.dealException(res);
			mv.addObject("areas", res.getJSONArray(R));
		} catch (Exception e) {
			LOGGER.error("设备监控界面跳转，加载商场关联区域出现异常->" + e.getMessage());
		}


		UserClaim userClaim = this.validateAuthorizationToken();
		
		try {
			JSONObject params = new JSONObject();
			params.putIfAbsent("userId", userClaim.getId());
			String operationCodes = menuOperationFilter.menuOperations("top-devices-monitor", params);
			mv.addObject("operationCodes", operationCodes);
		} catch (Exception e) {
			LOGGER.error("设备监控界面跳转，加载权限出现异常->" + e.getMessage());
		}

		
		mv.addObject("systems", subSystems());
		
		Long mallId = this.validateAuthorizationToken().getMallId(); // 商场Id
		mv.addObject("mallId", mallId);

		mv.addObject("timestamp", System.currentTimeMillis());

		return mv;
	}

	@GetMapping("/floorsByAreaId")
	@ResponseBody
	public JSONArray floorsByAreaId(Long areaId) {
		JSONArray res = new JSONArray();
		JSONObject apiRes = areaApi.getFloors(areaId);
		this.dealException(apiRes);
		res = apiRes.getJSONArray(R);
		return res;
	}

	@GetMapping("/systemDevices")
	@ResponseBody
	public ModelAndView systemDevices(Long floorId,
		String systemCode,
		String sort,
		String order,
		String keyword,
		Integer physicalstate,
		String keySearch) {
		ModelAndView mv = new ModelAndView("modules/devices-monitor/system-devices");

		if (keySearch != null && keySearch.equals("1")) {
			floorId = null;
		}
		mv.addObject("keySearch", keySearch);
		try {
			JSONObject res = new JSONObject();
			PageRequest pr = getPageRequestData();
			Integer page = pr.getCurrentPage();
			Integer limit = 10;
			res = deviceApi.page(floorId, systemCode, page, limit, keyword, physicalstate, sort, order);
			this.dealException(res);
			JSONObject result = res.getJSONObject(R);
			JSONArray resultList = result.getJSONArray("resultList");
			if (floorId == null) {
				for (int i = 0; i < resultList.size(); i++) {
					JSONObject device = resultList.getJSONObject(i);
					Long _floorId = device.getLong("floorId");
					JSONObject _floorInfo = new JSONObject();
					try{
						_floorInfo = floorApi.detail(_floorId);
						this.dealException(_floorInfo);
						_floorInfo = _floorInfo.getJSONObject(R);
					} catch (Exception e) {
						_floorInfo = new JSONObject();
					} finally {
						device.put("floor", _floorInfo);
					}
				}
			}
			mv.addObject("devices", result);
		} catch (Exception e) {
			LOGGER.error("加载系统设备出现异常->" + e.getMessage());
		}
		return mv;
	}
	
	/**
	 * 楼层平面图及关联设备点加载
	 * @param floorId 楼层编号
	 * @param systemCode 接入系统码
	 * @param timestamp 唯一标识
	 * @return
	 */
	@GetMapping("/floor-plan")
	@ResponseBody
	public ModelAndView floorPlan(Long floorId, String systemCode, Long timestamp) {
		ModelAndView mv = new ModelAndView("modules/devices-monitor/floor-plan");
		mv.addObject("timestamp", timestamp);
		try {
			JSONObject res = floorApi.getPlanGraph(floorId);
			this.dealException(res);
			mv.addObject("floorPic", res.getJSONObject(R).getJSONObject("picture").getJSONArray("storage").getJSONObject(0).getString("fileStorageUrl"));
		} catch (Exception e) {
			LOGGER.error("加载楼层平面图报错->" + e.getMessage());
			e.printStackTrace();
		}
		try {
			JSONObject res = deviceApi.page(floorId, systemCode, 1, 1000, null, null, null, null);
			LOGGER.error("richard here........." + JSONObject.toJSONString(res));
			this.dealException(res);
			mv.addObject("devices", res.getJSONObject(R).getJSONArray("resultList"));
		} catch (Exception e) {
			LOGGER.error("加载楼层平面图关联设备报错->" + e.getMessage());
			e.printStackTrace();
		}
		return mv;
	}
	/**
	 * 用于楼层平面图的解耦开发 未完成==================================
	 * @param floorId
	 * @param systemCode
	 * @return
	 */
	@GetMapping("/floor-plan-devices")
	@ResponseBody
	public ModelAndView floorPlanDevices(Long floorId, String systemCode) {
		ModelAndView mv = new ModelAndView("modules/devices-monitor/floor-plan-devices");
		try {
			JSONObject res = deviceApi.page(floorId, systemCode, 1, 10000, null, null, null, null);
			this.dealException(res);
			mv.addObject("devices", res.getJSONObject(R).getJSONArray("resultList"));
		} catch (Exception e) {
			LOGGER.error("加载楼层平面图关联设备报错->" + e.getMessage());
			e.printStackTrace();
		}
		return mv;
	}
	
	@GetMapping("/contextmenu")
	@ResponseBody
	public ModelAndView contextmenu() {
		ModelAndView mv = new ModelAndView("modules/devices-monitor/contextmenu");
		mv.addObject("systems", subSystems());
		return mv;
	}

	public ModelAndView deviceInfo(Long deviceId, ModelAndView mv) {
		JSONObject item = new JSONObject();
		try {
			JSONObject res = deviceApi.detail(deviceId);
			this.dealException(res);
			item = res.getJSONObject(R);
		} catch (Exception e) {
			LOGGER.error("加载设备详情报错->" + e.getMessage());
			e.printStackTrace();
		}
		try {
			JSONObject res = floorApi.getPlanGraph(item.getLong("floorId"));
			this.dealException(res);
			mv.addObject("floorPic", res.getJSONObject(R).getJSONObject("picture").getJSONArray("storage").getJSONObject(0).getString("fileStorageUrl"));
			mv.addObject("timestamp", new Date().getTime());
		} catch (Exception e) {
			LOGGER.error("加载设备详情报错->" + e.getMessage());
			e.printStackTrace();
		}
		mv.addObject("item", item);
		mv.addObject("x", item.getDouble("x"));
		mv.addObject("y", item.getDouble("y"));
		mv.addObject("systemCode", item.getString("systemCode"));
		return mv;
	}

	@GetMapping("/detail")
	@ResponseBody
	public ModelAndView detail(Long deviceId, String manageName) {
		ModelAndView mv = new ModelAndView("modules/devices-monitor/detail");
		mv = deviceInfo(deviceId, mv);
		mv.addObject("manageName", manageName);
		return mv;
	}

	@GetMapping("/form")
	@ResponseBody
	public ModelAndView form(Long floorId, Long deviceId, String manageName, String systemCode, String x, String y) {
		
		ModelAndView mv = new ModelAndView("modules/devices-monitor/form");
		if (deviceId != null) {
			mv = deviceInfo(deviceId, mv);
		} else {
			mv.addObject("x", x);
			mv.addObject("y", y);
			mv.addObject("systemCode", systemCode);
		}
		
		mv.addObject("systems", subSystems());
		mv.addObject("manageName", manageName);
		mv.addObject("floorId", floorId);
		return mv;
	}

	@PostMapping("/setPoint")
	@ResponseBody
	public JSONObject setPoint(Long id, double x, double y) {
		JSONObject res = new JSONObject();
		// 查询设备详情
		res = deviceApi.detail(id);
		this.dealException(res);
		JSONObject detail = res.getJSONObject(R);
		// 定点赋值
		detail.put("x", x);
		detail.put("y", y);
		//保存
		res = deviceApi.save(JSONObject.toJSONString(detail));
		this.dealException(res);

		return res;
	}

	@GetMapping("/baseinfo")
	@ResponseBody
	public ModelAndView baseinfo(String versionCode, Long deviceId) {
		ModelAndView mv = new ModelAndView("modules/devices-monitor/form_baseinfo");
		JSONArray baseinfo = new JSONArray();
		if (deviceId != null) {
			try {
				JSONObject res = deviceApi.detail(deviceId);
				this.dealException(res);
				// 如果查询详情后的版本号跟传入的版本号一致，或者未传入版本号，则使用详情中的baseinfo 
				if (versionCode == null || res.getJSONObject(R).getString("deviceTypeCode").equals(versionCode)) {
					baseinfo = res.getJSONObject(R).getJSONArray("deviceOtherInfo");
					versionCode = null;
				}
			} catch (Exception e) {
				LOGGER.error("加载设备详情报错->" + e.getMessage());
				e.printStackTrace();
			}
		}
		// 版本号未被设置为null，则根据版本号查询baseinfo
		if (versionCode != null) {
			try {
				JSONObject res = deviceApi.formConfig(versionCode);
				this.dealException(res);
				baseinfo = res.getJSONArray(R);				
			} catch (Exception e) {
				LOGGER.error("加载设备详情报错->" + e.getMessage());
				e.printStackTrace();
			}
		}

		mv.addObject("baseinfo", baseinfo);
		return mv;
	}

	@GetMapping("/suppliers")
	@ResponseBody
	public ModelAndView suppliers(String versionCode) {
		ModelAndView mv = new ModelAndView("modules/devices-monitor/form_suppliers");
		try {
			JSONObject res = deviceApi.queryBranchByVersionCode(versionCode);
			this.dealException(res);
			String bcode = res.getJSONObject(R).getString("brandCode");
			String scode = res.getJSONObject(R).getString("businessSystemCode");
			res = supplierApi.querySuppliersBySystemCodeBrandCode(scode, bcode);
			this.dealException(res);
			mv.addObject("suppliers", res.getJSONArray(R));
		} catch (Exception e) {
			LOGGER.error("加载设备详情报错->" + e.getMessage());
			e.printStackTrace();
		}
		return mv;
	}

	@GetMapping("/versionsCanAdd")
	@ResponseBody
	public JSONObject versionsCanAdd(String systemCode) {
		JSONObject res = new JSONObject();
		res = deviceApi.queryAddDeviceVersion(systemCode);
		this.dealException(res);
		return res;
	}
	
}