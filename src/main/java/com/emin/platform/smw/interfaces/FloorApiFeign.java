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
 * @beginDate 2018/05/11 02:19
 */

@FeignClient(value = ApplicationConstain.ZUUL_SERVICE)
public interface FloorApiFeign {
	/**
	 * 删除楼层
	 * @param id 楼层id
	 * @return
	 */
	@RequestMapping(value = "/api-smart-mall-floor/floor/deleteFloor/{id}", method = RequestMethod.POST)
	JSONObject remove(@PathVariable("id")Long id);
	
	/**
	 * 楼层数据查询
	 * @return
	 */
	@RequestMapping(value = "/api-smart-mall-floor/floor/getFloorList", method = RequestMethod.GET)
	JSONObject list();
	
	/**
	 * 楼层信息详情
	 * @param id
	 * @return
	 */
	@RequestMapping(value = "/api-smart-mall-floor/floor/queryFloor/{id}", method = RequestMethod.POST)
	JSONObject detail(@PathVariable("id")Long id);
	

	@RequestMapping(value = "/api-smart-mall-floor/floor/queryFloorNoStatus", method = RequestMethod.GET)
	JSONObject detailNoStatus(@RequestParam(value="floorId")Long floorId);
	
	/**
	 * 保存楼层
	 * @param floor 楼层基本数据
	 * @return
	 */
	@RequestMapping(value = "/api-smart-mall-floor/floor/saveFloor", method = RequestMethod.POST, consumes=MediaType.APPLICATION_JSON_UTF8_VALUE)
	JSONObject save(@RequestBody String floor);
	
	/**
	 * 查询楼层关联平面图信息
	 * @param id 楼层编号
	 * @return
	 */
	@RequestMapping(value = "/api-smart-mall-floor/floor/picture/queryPicture", method = RequestMethod.GET)
	JSONObject getPlanGraph(@RequestParam(value="id")Long id);
	
	/**
	 * 保存楼层平面图关联
	 * @param picture
	 * @return
	 */
	@RequestMapping(value = "/api-smart-mall-floor/floor/picture/savePicture", method = RequestMethod.POST, consumes=MediaType.APPLICATION_JSON_UTF8_VALUE)
	JSONObject savePlanGraph(@RequestBody String picture);
	
	/**
	 * 删除楼层平面图关联
	 * @param id 关联编号
	 * @return
	 */
	@RequestMapping(value = "/api-smart-mall-floor/floor/picture/deletePicture/{id}", method = RequestMethod.POST, consumes=MediaType.APPLICATION_JSON_UTF8_VALUE)
	JSONObject removePlanGraph(@PathVariable("id")Long id);
	
}


