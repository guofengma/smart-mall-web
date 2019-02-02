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
 * 组合模式接口桥梁定义
 * @author winnie
 */
@FeignClient(value = ApplicationConstain.ZUUL_SERVICE)
public interface CombPatternApiFeign {
	
	/**
	 * 组合模式模式列表
	 * @param mallId 商场id
	 */
	@RequestMapping(value = "/smart-mall-floor-service/subsystemPatternSet/findAll",method = RequestMethod.GET)
	JSONObject queryCombpatterns(
			@RequestParam(value="mallId") Long mallId);
	
	/**
	 * 组合模式详情
	 * @param id 组合模式id
	 */
	@RequestMapping(value = "/smart-mall-floor-service/subsystemPatternSet/detail/{id}",method = RequestMethod.GET)
	JSONObject detail(
			@PathVariable(value="id") Long id);
	
	/**
	 * 保存组合模式
	 * @param subsystemPatternSetDetailList 选中模模式数据明细
	 * @param subsystemPatternSetStr 模式中的其他数据，如名字、备注
	 */
	@RequestMapping(value = "/smart-mall-floor-service/subsystemPatternSet/saveSetAndDetail",method = RequestMethod.POST,consumes = MediaType.APPLICATION_JSON_UTF8_VALUE )
	JSONObject saveCombpattern(
			@RequestBody String subsystemPatternSetDetailList,
			@RequestParam(value="subsystemPatternSetStr") String subsystemPatternSetStr);
	
	/**
	 * 删除组合模式
	 * @param id 组合模式id
	 */
	@RequestMapping(value = "smart-mall-floor-service/subsystemPatternSet/delete",method = RequestMethod.DELETE)
	JSONObject delete(
			@RequestParam(value="id") Long id);
}
