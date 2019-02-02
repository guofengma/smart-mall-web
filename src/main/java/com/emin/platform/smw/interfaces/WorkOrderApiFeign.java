package com.emin.platform.smw.interfaces;

import com.alibaba.fastjson.JSONObject;

import com.emin.platform.smw.constain.ApplicationConstain;

import org.springframework.cloud.netflix.feign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

/***
 * 
 * @author Danica
 * @beginDate 2018/11/05 05:35 PM
 */

@FeignClient(value = ApplicationConstain.ZUUL_SERVICE)
public interface WorkOrderApiFeign {
	/**
	 * 我的任务
	 */
	@GetMapping(value = "/api-smart-mall-abnormal/workOrderQuery/pageMyTask")
	JSONObject tasks(
			@RequestParam(value="userId")Long userId,
			@RequestParam(value="systemCode")String systemCode,
			@RequestParam(value="startTime")Long startDate,
			@RequestParam(value="endTime")Long endDate,
			@RequestParam(value="keyword")String keyword,
			@RequestParam(value="taskType")Integer taskType,
			@RequestParam(value="page")Integer page,
			@RequestParam(value="limit")Integer limit,
			@RequestParam(value="sort")String sort,
			@RequestParam(value="order")String order);

		
	/**
	 * 我指派的
	 */	
	@GetMapping(value = "/api-smart-mall-abnormal/workOrderQuery/pageMyDesignate")
	JSONObject assigns(
			@RequestParam(value="userId")Long userId,
			@RequestParam(value="systemCode")String systemCode,
			@RequestParam(value="startTime")Long startDate,
			@RequestParam(value="endTime")Long endDate,
			@RequestParam(value="keyword")String keyword,
			@RequestParam(value="taskType")Integer taskType,
			@RequestParam(value="page")Integer page,
			@RequestParam(value="limit")Integer limit,
			@RequestParam(value="sort")String sort,
			@RequestParam(value="order")String order);

	/**
	 * 我处理的
	 */
	@GetMapping(value = "/api-smart-mall-abnormal/workOrderQuery/pageMyDealFinish")
	JSONObject deals(
			@RequestParam(value="userId")Long userId,
			@RequestParam(value="systemCode")String systemCode,
			@RequestParam(value="startTime")Long startDate,
			@RequestParam(value="endTime")Long endDate,
			@RequestParam(value="keyword")String keyword,
			@RequestParam(value="taskType")Integer taskType,
			@RequestParam(value="page")Integer page,
			@RequestParam(value="limit")Integer limit,
			@RequestParam(value="sort")String sort,
			@RequestParam(value="order")String order);
	
	/**
	 * 追踪工单生命周期
	 */
	@GetMapping(value = "/api-smart-mall-abnormal/workOrderDeal/getProcessDetailByEventSourceId")
	JSONObject lifeCircle(@RequestParam(value="eventSourceId") Long abnormalId);
	
	/**
	 * 处理工单
	 * @param dealResultDto
	 * @return
	 */	
	@PostMapping(value = "/api-smart-mall-abnormal/workOrderDeal/dealWorkOrder",consumes = MediaType.APPLICATION_JSON_UTF8_VALUE)
	JSONObject deal(@RequestBody String dealResultDto);

	
	/**
	 * 工单状态修改追踪
	 */
	@PostMapping(value = "/api-smart-mall-abnormal/workOrderDeal/transferWorkOrder",consumes = MediaType.APPLICATION_JSON_UTF8_VALUE)
	JSONObject transfer(@RequestBody String appointDto);
}


