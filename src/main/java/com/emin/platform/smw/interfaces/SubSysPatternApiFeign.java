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
 * 子系统模式接口桥梁定义
 * @author winnie
 */
@FeignClient(value = ApplicationConstain.ZUUL_SERVICE)
public interface SubSysPatternApiFeign {
	
	/**
	 * 查询某个子系统的所有模式
	 * @param subsystemCode 子系统code
	 * @param mallId 商场id
	 */
	@RequestMapping(value = "/smart-mall-floor-service/subsystemPattern/findBySubsystemCode",method = RequestMethod.GET)
	JSONObject querySysPatterns(
			@RequestParam(value="subsystemCode") String subsystemCode,
			@RequestParam(value="mallId") Long mallId);
	
	/**
	 * 保存子系统模式
	 * @param subsystemPatternDetailList 选中模模式数据明细
	 * @param subsystemPatternStr 模式中的其他数据，如名字、id
	 */
	@RequestMapping(value = "/smart-mall-floor-service/subsystemPattern/savePatternAndDetail",method = RequestMethod.POST,consumes = MediaType.APPLICATION_JSON_UTF8_VALUE )
	JSONObject saveSubsystempattern(
			@RequestBody String subsystemPatternDetailList,
			@RequestParam(value="subsystemPatternStr") String subsystemPatternStr);
	
	/**
	 * 查询模式详情
	 * @param id 子系统模式id
	 */
	@RequestMapping(value = "/smart-mall-floor-service/subsystemPattern/detail/{id}",method = RequestMethod.GET)
	JSONObject patternDetail(
			@PathVariable(value="id") Long id);
	/**
	 * 删除模式
	 * @param id 子系统模式id
	 */
	@RequestMapping(value = "/smart-mall-floor-service/subsystemPattern/delete",method = RequestMethod.DELETE)
	JSONObject patternDelete(
			@RequestParam(value="id") Long id);
}
