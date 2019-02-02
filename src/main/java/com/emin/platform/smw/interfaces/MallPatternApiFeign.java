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
 * 商场模式接口桥梁定义
 * @author winnie
 */
@FeignClient(value = ApplicationConstain.ZUUL_SERVICE)
public interface MallPatternApiFeign {
	
	/**
	 * 查询所有商场模式
	 */
	@RequestMapping(value = "/smart-mall-floor-service/mallPattern/findAll",method = RequestMethod.GET)
	JSONObject queryAllMallPattern();
	
	/**
	 * 查询所有商场模式及其详情
	 */
	@RequestMapping(value = "/smart-mall-floor-service/mallPattern/findAllDetail",method = RequestMethod.GET)
	JSONObject queryAllMallPatternDetail();
	
	/**
	 * 根据id查询商场模式的详情
	 * @param id 商场模式id
	 */
	@RequestMapping(value = "/smart-mall-floor-service/mallPattern/detail/{id}",method = RequestMethod.GET)
	JSONObject queryMallPatternDetail(
			@PathVariable(value="id") Long id);
	
	/**
	 * 根据id查询商场模式的时段
	 * @param mallPatternId 商场模式id
	 */
	@RequestMapping(value = "/smart-mall-floor-service/mallPatternTime/findByMallPatternId",method = RequestMethod.POST)
	JSONObject queryMallPattern(
			@RequestParam(value="mallPatternId") Long mallPatternId);
	
	/**
	 * 取消商场模式下的模式设置
	 * @param id 商场模式id
	 */
	@RequestMapping(value = "/smart-mall-floor-service/mallPatternTime/cancelSubsystemPatternSet",method = RequestMethod.DELETE)
	JSONObject cancelSubsystemPatternSet(
			@RequestParam(value="id") Long id);
	
	
	/**
	 * 更改商场模式的配置
	 * @param id 商场模式的id
	 * @param key 字段名称
	 * @param value 字段值
	 */
	@RequestMapping(value = "/smart-mall-floor-service/mallPatternTime/perfectMallPatternTime",method = RequestMethod.POST)
	JSONObject perfectMallPattern(
			@RequestParam(value="id") Long id,
			@RequestParam(value="key") String key,
			@RequestParam(value="value") String value);
	/**
	 * 保存商场模式
	 * @param mallPatternTimeList 商场模式时间段及其明细
	 * @param mallPatternStr 模式中的其他数据，如name、id
	 */
	@RequestMapping(value = "/smart-mall-floor-service/mallPattern/savePatternAndTimeDetail",method = RequestMethod.POST,consumes = MediaType.APPLICATION_JSON_UTF8_VALUE )
	JSONObject saveMallPattern(
			@RequestBody String mallPatternTimeList,
			@RequestParam(value="mallPatternStr") String mallPatternStr);
	/**
	 * 保存临时商场模式
	 * @param mallPatternTimeList 商场模式时间段及其明细
	 * @param mallPatternStr 模式中的其他数据，如name、id
	 * @param yyyymmdd 日期（年月日）
	 */
	@RequestMapping(value = "/smart-mall-floor-service/mallPattern/saveTempPatternAndTimeDetailForYyyymmdd",method = RequestMethod.POST,consumes = MediaType.APPLICATION_JSON_UTF8_VALUE )
	JSONObject saveMallPatternForYyyymmdd(
			@RequestBody String mallPatternTimeList,
			@RequestParam(value="mallPatternStr") String mallPatternStr,
			@RequestParam(value="yyyymmdd") String yyyymmdd);
	/**
	 * 删除模式
	 * @param id 模式id
	 */
	@RequestMapping(value = "/smart-mall-floor-service/mallPattern/delete",method = RequestMethod.DELETE)
	JSONObject mallPatternDelete(
			@RequestParam(value="id") Long id);
}
