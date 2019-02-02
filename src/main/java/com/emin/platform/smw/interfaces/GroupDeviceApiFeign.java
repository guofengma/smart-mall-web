package com.emin.platform.smw.interfaces;

import com.alibaba.fastjson.JSONObject;

import com.emin.platform.smw.constain.ApplicationConstain;
import org.springframework.cloud.netflix.feign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

/***
 * 
 * @author Danica
 * @beginDate 2018/07/04 10:04
 */

@FeignClient(value = ApplicationConstain.ZUUL_SERVICE)
public interface GroupDeviceApiFeign {
	
	@RequestMapping(value = "/api-smart-mall-floor/deviceGroup/addDevice", method = RequestMethod.POST, consumes=MediaType.APPLICATION_JSON_UTF8_VALUE)
	JSONObject addDevices(@RequestParam(value="deviceGroupId")Integer deviceGroupId,
			@RequestParam(value="deviceIds")Integer[] deviceIds);
	

	@RequestMapping(value = "/api-smart-mall-floor/deviceGroup/createOrUpdate", method = RequestMethod.POST, consumes=MediaType.APPLICATION_JSON_UTF8_VALUE)
	JSONObject saveGroup(@RequestBody String deviceGroup);
	

	@RequestMapping(value = "/api-smart-mall-floor/deviceGroup/delDevice", method = RequestMethod.DELETE)
	JSONObject removeDevices(@RequestParam(value="deviceGroupId")Integer deviceGroupId,
			@RequestParam(value="deviceIds")Integer[] deviceIds);
	
	
	@RequestMapping(value = "/api-smart-mall-floor/deviceGroup/delete", method = RequestMethod.DELETE)
	JSONObject removeGroup(@RequestParam(value="id")Integer id);
	

	@RequestMapping(value = "/api-smart-mall-floor/deviceGroup/detail/{id}", method = RequestMethod.GET)
	JSONObject detailGroup(@RequestParam(value="id")Integer id);

	
	@RequestMapping(value = "/api-smart-mall-floor/deviceGroup/moveDevice", method = RequestMethod.POST, consumes=MediaType.APPLICATION_JSON_UTF8_VALUE)
	JSONObject moveDevices(@RequestParam(value="oldDeviceGroupId")Integer oldDeviceGroupId,
		@RequestParam(value="newDeviceGroupId")Integer newDeviceGroupId,
		@RequestParam(value="deviceIds")Integer[] deviceIds);

		
	@RequestMapping(value = "/api-smart-mall-floor/deviceGroup/page", method = RequestMethod.GET)
	JSONObject pageGroup(@RequestParam(value="keyword")String keyword,
		@RequestParam(value="systemCode")String systemCode,
		@RequestParam(value="page")Integer page,
		@RequestParam(value="limit")Integer limit);

		
	@RequestMapping(value = "/api-smart-mall-floor/deviceGroup/pageDeviceNotGroup", method = RequestMethod.GET)
	JSONObject pageUnGroupDevices(@RequestParam(value="keyword")String keyword,
		@RequestParam(value="systemCode")String systemCode,
		@RequestParam(value="areaId")Integer areaId,
		@RequestParam(value="floorId")Integer floorId,
		@RequestParam(value="versionCode") String versionCode,
		@RequestParam(value="page")Integer page,
		@RequestParam(value="limit")Integer limit);

		
	@RequestMapping(value = "/api-smart-mall-floor/deviceGroup/pageDeviceInGroup", method = RequestMethod.GET)
	JSONObject pageGroupDevices(@RequestParam(value="keyword")String keyword,
		@RequestParam(value="deviceGroupId")Integer deviceGroupId,
		@RequestParam(value="versionCode") String versionCode,
		@RequestParam(value="page")Integer page,
		@RequestParam(value="limit")Integer limit);
	
	/**
	 * 按照设备分组查找子系统的设备版本
	 * @param deviceGroupId 组id
	 * @param subsystemCode 子系统code
	 */
	@RequestMapping(value = "/api-smart-mall-floor/device/getVersionCodeByDeviceGroup", method = RequestMethod.GET)
	JSONObject getVersionCodeByDeviceGroup(@RequestParam(value="deviceGroupId") Long deviceGroupId,
		@RequestParam(value="subsystemCode") String subsystemCode);
	/**
	 * 查询分组中设备的数量
	 * @param deviceGroupId 组id
	 * @param subsystemCode 子系统code
	 */
	@RequestMapping(value = "/api-smart-mall-floor/device/getCountByDeviceGroupId", method = RequestMethod.GET)
	JSONObject getCountByDeviceGroupId(@RequestParam(value="deviceGroupId") Long deviceGroupId,
		@RequestParam(value="subsystemCode") String subsystemCode);
}



