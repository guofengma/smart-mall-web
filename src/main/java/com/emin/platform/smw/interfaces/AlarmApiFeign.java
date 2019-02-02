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
 * 
 * @author Danica
 * @beginDate 2018/05/22 04:27
 */

@FeignClient(value = ApplicationConstain.ZUUL_SERVICE)
public interface AlarmApiFeign {
	
	@RequestMapping(value = "/api-smart-mall-event/eventSource/page", method = RequestMethod.GET)
	JSONObject page(@RequestParam(value="page")Integer cur,
			@RequestParam(value="limit")Integer limit,
			@RequestParam(value="paramStr")String params,
			@RequestParam(value="sort")String sort,
			@RequestParam(value="order")String order);
	

	@RequestMapping(value = "/api-smart-mall-event/eventSource/handle", method = RequestMethod.POST, consumes=MediaType.APPLICATION_JSON_UTF8_VALUE)
	JSONObject deal(@RequestBody String handler);
	

	@RequestMapping(value = "/api-smart-mall-event/eventSource/status/handle/finish/{id}", method = RequestMethod.POST, consumes=MediaType.APPLICATION_JSON_UTF8_VALUE)
	JSONObject finish(@PathVariable("id") Long id,
			@RequestParam(value="handlerUserId") String handlerUserId,
			@RequestParam(value="handlerUserName") String handlerUserName);
	
	
	@RequestMapping(value = "/api-smart-mall-event/eventSource/get/{id}", method = RequestMethod.GET)
	JSONObject detail(@PathVariable("id") Long id);
	
	/**
	 * 子系统报警次数统计
	 * @param businessCode 子系统code
	 * @param subSystemCode 设备系统code
	 */
	@RequestMapping(value = "/api-smart-mall-event/eventSource/stats/{businessCode}", method = RequestMethod.GET)
	JSONObject subSysAlarmSta(@PathVariable("businessCode") String businessCode,
			@RequestParam("subSystemCode") String subSystemCode);
	
	/**
	 * 根据业务系统获取当前告警次数汇总,不传参数,则标识为查询有效的告警信息
	 * @param paramStr 查询字段
	 */
	@RequestMapping(value = "/api-smart-mall-event/eventSource/stats", method = RequestMethod.GET)
	JSONObject alarmSta(@RequestParam("paramStr") String paramStr);
	
	/**
	 * 将选中的未读消息置为已读
	 * @param viewDoReadDto 当前已读信息
	 */
	@RequestMapping(value = "/api-smart-mall-event/eventSource/doRead", method = RequestMethod.POST, consumes=MediaType.APPLICATION_JSON_UTF8_VALUE)
	JSONObject doRead(@RequestBody String viewDoReadDto);
	
	/**
	 * 将所有的未读消息置为已读
	 * @param doReadDto json数据 当前已读处理信息录入
	 */
	@RequestMapping(value = "/api-smart-mall-event/eventSource/doAllRead", method = RequestMethod.POST, consumes=MediaType.APPLICATION_JSON_UTF8_VALUE)
	JSONObject doAllRead(@RequestBody String doReadDto);
		
}


