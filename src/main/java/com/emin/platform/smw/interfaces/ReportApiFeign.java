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


@FeignClient(value = ApplicationConstain.ZUUL_SERVICE)
public interface ReportApiFeign {
	
	/**
	 * 获取某个报表的详细
	 * @param id 报表id
	 */
	@RequestMapping(value = "/api-smart-mall-report/report-query/get/{id}",method = RequestMethod.GET)
	JSONObject reportDetail(
			@PathVariable(value="id") Integer id);
	/**
	 * 查询列表
	 * @param params 查询参数
	 * @param sort 按照某个属性进行排序,多个属性按照’,’英文逗号隔开,同理与order属性一起
	 * @param order 可选值:asc(默认,升序),desc(降序),多个属性按照’,’英文逗号隔开
	 * @param page 当前页
	 * @param limit 每页显示记录数 
	 */
	@RequestMapping(value = "/api-smart-mall-report/report-query/page",method = RequestMethod.POST,consumes = MediaType.APPLICATION_JSON_UTF8_VALUE )
	JSONObject page(
			@RequestBody String params,
			@RequestParam(value="sort") String sort,
			@RequestParam(value="order") String order,
			@RequestParam(value="page") Integer page,
			@RequestParam(value="limit") Integer limit);
	
	/**
	 * 获取某个报表信息的详细
	 * @param id 报表id
	 */
	@RequestMapping(value = "/api-smart-mall-report/report-query/task/{taskId}",method = RequestMethod.GET)
	JSONObject taskDetail(
			@PathVariable(value="taskId") String taskId);
	
	/**
	 * 删除报表
	 * @param taskId 报表id
	 */
	@RequestMapping(value = "/api-smart-mall-report/report/delete/{taskId}",method = RequestMethod.POST)
	JSONObject delete(
			@PathVariable(value="taskId") String taskId);
	
	/**
	 * 注册一个报表任务,返回当前任务的id
	 * @param reportRegister 注册参数
	 */
	@RequestMapping(value = "/api-smart-mall-report/report/register",method = RequestMethod.POST,consumes = MediaType.APPLICATION_JSON_UTF8_VALUE )
	JSONObject register(
			@RequestBody String reportRegister);
	
	/**
	 * 重新执行任务
	 * @param taskId 报表id
	 */
	@RequestMapping(value = "//api-smart-mall-report/report/retry/{taskId}",method = RequestMethod.POST)
	JSONObject retry(
			@PathVariable(value="taskId") String taskId);
	
}