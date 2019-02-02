package com.emin.platform.smw.interfaces;

import com.alibaba.fastjson.JSONObject;

import com.emin.platform.smw.constain.ApplicationConstain;
import org.springframework.cloud.netflix.feign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;


@FeignClient(value = ApplicationConstain.ZUUL_SERVICE)
public interface CentralConApiFeign {
	/**
	 * 查询所有允许介入的子系统
	 * @param subsystemCode 子系统的code，用于子系统的查询
	 */
	@RequestMapping(value = "/smart-mall-floor-service/device/getSubsystemInfoByCode",method = RequestMethod.GET)
	JSONObject queryAllSystem(@RequestParam(value="subsystemCode") String subsystemCode);
	
	/**
	 * 中控界面中已经配置的子系统及详细数据
	 * @param code 查询的子系统的code
	 */
	@RequestMapping(value = "/smart-mall-floor-service/floor/subsystem/querySystem",method = RequestMethod.POST)
	JSONObject querySystem(@RequestParam(value="code") String code);
	
	/**
	 * 中控界面中已经配置的子系统（无子系统下面的品牌、版本等数据）
	 */
	@RequestMapping(value = "/smart-mall-floor-service/floor/subsystem/queryOneSystem",method = RequestMethod.POST)
	JSONObject onlySystem();
	
	@RequestMapping(value = "/smart-mall-floor-service/floor/subsystem/queryBrandBySystem",method = RequestMethod.GET)
	JSONObject brandsBySysCode(@RequestParam(value="systemCode") String systemCode);
	
	/**
	 * 新增子系统配置
	 * @param subSystemList 新增子系统的数据
	 */
	@RequestMapping(value = "/smart-mall-floor-service/floor/subsystem/saveSubSystem",method = RequestMethod.POST, consumes=MediaType.APPLICATION_JSON_UTF8_VALUE)
	JSONObject saveSubSystem(
			@RequestBody String subSystemList);
	
	/**
	 * 编辑已经配置系统
	 * @param subSystemList 新增子系统的数据
	 */
	@RequestMapping(value = "/smart-mall-floor-service/floor/subsystem/editSystem",method = RequestMethod.POST, consumes=MediaType.APPLICATION_JSON_UTF8_VALUE)
	JSONObject editSystem(
			@RequestBody String subSystemList);
	
	/**
	 * 重置子系统
	 * @param code 查询的子系统的code
	 */
	@RequestMapping(value = "/smart-mall-floor-service/floor/subsystem/resetSystem",method = RequestMethod.POST)
	JSONObject resetSystem(@RequestParam(value="code") String code);
	
	/**
	 * 根据子系统获取所有的设备状态
	 * @param subsystemCode 子系统的code
	 */
	@RequestMapping(value = "/api-smart-mall-floor/device/getAllBusinessStateBySubsystemCode",method = RequestMethod.GET)
	JSONObject queryAllBusinessStateBySubsystemCode(@RequestParam(value="subsystemCode") String subsystemCode);
	
	/**
	 * 查询监控界面的个性化配置
	 * @param userId 用户id
	 */
	@RequestMapping(value = "/api-smart-mall-floor/floor/monitor/initMonitor",method = RequestMethod.GET)
	JSONObject personalPanelData(@RequestParam(value="userId") Long userId);
	
	/**
	 * 查询允许接入的监控界面数据
	 * @param userId 用户id
	 * @param keyWord 查询关键字
	 */
	@RequestMapping(value = "/api-smart-mall-floor/floor/monitor/panel",method = RequestMethod.GET)
	JSONObject basicPanelData(@RequestParam(value="userId") Long userId,
			@RequestParam(value="keyWord") String keyword);
	
	/**
	 * 保存用户的个性化配置
	 * @param userId 用户id
	 * @param personality  用户配置
	 * @param systemCode 子系统code，只改变某一个系统配置时传递该参数
	 */
	@RequestMapping(value = "/api-smart-mall-floor/floor/monitor/savePersonality",method = RequestMethod.POST, consumes=MediaType.APPLICATION_JSON_UTF8_VALUE)
	JSONObject savePersonality(@RequestParam(value="userId") Long userId,
			@RequestBody String personality,
			@RequestParam(value="systemCode") String systemCode);
	
	/**
	 * 删除系统显示
	 * @param userId 用户id
	 * @param systemCode 子系统code
	 */
	@RequestMapping(value = "/api-smart-mall-floor/floor/monitor/delPersonality",method = RequestMethod.GET)
	JSONObject delPersonality(@RequestParam(value="userId") Long userId,
			@RequestParam(value="systemCode") String systemCode);
	
	
}
