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
 * @beginDate 2018/07/10 14:24
 */

@FeignClient(value = ApplicationConstain.ZUUL_SERVICE)
public interface CustomerAnalysisApiFeign {
	
	@RequestMapping(value = "/api-smart-mall-visitors/visitor/all", method = RequestMethod.POST, consumes=MediaType.APPLICATION_JSON_UTF8_VALUE)
	JSONObject all(@RequestBody String perData);

	/**
	 * 今日客流统计
	 * @param perData 查询参数,json格式的字符串
	 * @param system 系统
	 * @param version 版本号
	 * return
	 */
	@RequestMapping(value = "/api-smart-mall-visitors/visitor/today", method = RequestMethod.POST, consumes=MediaType.APPLICATION_JSON_UTF8_VALUE)
	JSONObject today(@RequestBody String perData,
					@RequestParam (value="system") String system,
					@RequestParam (value="version") String version);
	
	/**
	 * 统计客流系统某个时间区间内，每小时的客流数
	 * @param perData 查询参数,json格式的字符串
	 * @param system 系统
	 * @param version 版本号
	 */
	@RequestMapping(value = "/api-smart-mall-visitors/visitor/count", method = RequestMethod.POST, consumes=MediaType.APPLICATION_JSON_UTF8_VALUE)
	JSONObject hourPassengerFlow(@RequestBody String perData,
					@RequestParam (value="system") String system,
					@RequestParam (value="version") String version);


	
		
}


