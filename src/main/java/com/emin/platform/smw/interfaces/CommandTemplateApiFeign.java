package com.emin.platform.smw.interfaces;

import com.alibaba.fastjson.JSONObject;
import com.emin.platform.smw.constain.ApplicationConstain;
import org.springframework.cloud.netflix.feign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

/***
 * 命令模板接口桥梁定义
 * @author winnie
 */
@FeignClient(value = ApplicationConstain.ZUUL_SERVICE)
public interface CommandTemplateApiFeign {
	
	/**
	 * 查询版本号下的命令模板
	 * @param versionCode 版本号code
	 * @param mallId 商场id
	 * @param keywords 查询关键字
	 */
	@RequestMapping(value = "/smart-mall-floor-service/commandModule/findAll",method = RequestMethod.GET)
	JSONObject findCommandModuleByVersion(
			@RequestParam(value="versionCode") String versionCode,
			@RequestParam(value="mallId") Long mallId,
			@RequestParam(value="keywords") String keywords);
	
	/**
	 * 保存命令模板
	 * @param commandModuleDetailList 命令模板参数明细
	 * @param commandModuleStr 命令模板JSON字符串
	 */
	@RequestMapping(value = "/smart-mall-floor-service/commandModule/saveModuleAndDetail",method = RequestMethod.POST,consumes = MediaType.APPLICATION_JSON_UTF8_VALUE)
	JSONObject save(
			@RequestBody String commandModuleDetailList,
			@RequestParam(value="commandModuleStr") String commandModuleStr);
	
	/**
	 * 根据id查询命令模板
	 * @param id 命令模板id
	 */
	@RequestMapping(value = "/smart-mall-floor-service/commandModule/detail/{id}",method = RequestMethod.GET)
	JSONObject detail(
			@PathVariable(value="id") Long id);
	
	/**
	 * 根据id删除命令模板
	 * @param id 命令模板id
	 */
	@RequestMapping(value = "/smart-mall-floor-service/commandModule/delete",method = RequestMethod.DELETE)
	JSONObject delete(
			@RequestParam(value="id") Long id);
	
	
}

