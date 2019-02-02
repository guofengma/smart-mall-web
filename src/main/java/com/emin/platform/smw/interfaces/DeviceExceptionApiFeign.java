package com.emin.platform.smw.interfaces;

import com.alibaba.fastjson.JSONObject;

import com.emin.platform.smw.constain.ApplicationConstain;

import org.springframework.cloud.netflix.feign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

/***
 * 
 * @author Danica
 * @beginDate 2018/10/16 09:41 AM
 */

@FeignClient(value = ApplicationConstain.ZUUL_SERVICE)
public interface DeviceExceptionApiFeign {

	@GetMapping(value = "/api-smart-mall-abnormal/event/status")
	JSONObject status();
	
	@GetMapping(value = "/api-smart-mall-abnormal/event/eventList")
	JSONObject all(@RequestParam(value="userId")Integer userId,
			@RequestParam(value="startDate")Long startDate,
			@RequestParam(value="endDate")Long endDate,
			@RequestParam(value="status")Long[] status,
			@RequestParam(value="page")Integer page,
			@RequestParam(value="limit")Integer limit,
			@RequestParam(value="sort")String sort,
			@RequestParam(value="order")String order,
			@RequestParam(value="keyValue")String keyValue,
			@RequestParam(value="keyMapParam")String keyMapParam,
			@RequestParam(value="eventType")Integer eventType);

	@GetMapping(value = "/api-smart-mall-abnormal/event/queryNewAlertCount")
	JSONObject eventCount(@RequestParam(value="userId")Integer userId,
			@RequestParam(value="startDate")Long startDate,
			@RequestParam(value="endDate")Long endDate,
			@RequestParam(value="status")Long[] status,
			@RequestParam(value="keyValue")String keyValue,
			@RequestParam(value="keyMapParam")String keyMapParam,
			@RequestParam(value="eventType")Integer eventType);
		
	@GetMapping(value = "/api-smart-mall-abnormal/event/isMaintainManage")
	JSONObject canAssign(@RequestParam(value="userId")Integer userId);
	
	@GetMapping(value = "/api-smart-mall-abnormal/event/queryEventById")
	JSONObject detail(@RequestParam(value="id")Long id);

	@GetMapping(value = "/api-smart-mall-abnormal/workOrderDeal/getProcessDetailByEventSourceId")
	JSONObject lifeCircle(@RequestParam(value="eventSourceId") Long abnormalId);

	@GetMapping(value = "/api-smart-mall-abnormal/event/changeStatus")
	JSONObject changeStatus(@RequestParam(value="ids") Long[] ids,
		@RequestParam(value="code") Integer code);

	@GetMapping(value = "/api-smart-mall-abnormal/event/notRead")
	JSONObject notRead(@RequestParam(value="userId")Long userId,
	@RequestParam(value="eventType")Integer eventType);

	
	@GetMapping(value = "/api-smart-mall-abnormal/workOrderQuery/getAbnormalTypeCode")
	JSONObject getAbnormalType();

	
	@GetMapping(value = "/api-smart-mall-abnormal/workOrderQuery/getEventTypeCode")
	JSONObject getEventTypeCode();
}


