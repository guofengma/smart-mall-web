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
 * @author mia
 */

@FeignClient(value = ApplicationConstain.ZUUL_SERVICE)
public interface StoreApiFeign {

	/**
	 * 删除楼层
	 * @param id 楼层id
	 * @return
	 * int long float double
	 */
	@RequestMapping(value = "/api-smart-mall-floor/floor/deleteFloor/{id}", method = RequestMethod.POST, consumes=MediaType.APPLICATION_JSON_UTF8_VALUE)
	JSONObject deleteFloor(@PathVariable("id")Long id);
	
	/**
	 * 查询所有楼层
	 *
	 * @return
	 */
	
	@RequestMapping(value = "/api-smart-mall-floor/floor/getFloorList", method = RequestMethod.GET)
	JSONObject getFloorList();
	
	/**
	 * 增加楼层
	 * @param floor 楼层floor
	 * @return
	 */
	
	@RequestMapping(value = "/api-smart-mall-floor/floor/saveFloor", method = RequestMethod.POST, consumes=MediaType.APPLICATION_JSON_UTF8_VALUE)
	JSONObject saveFloor(@RequestBody String floor);
	
	/**
	 * 新增商城信息
	 * @param  formData 商城form
	 * @return
	 */
	@RequestMapping(value = "/api-smart-mall-ecm/ecm/save", method = RequestMethod.POST, consumes=MediaType.APPLICATION_JSON_UTF8_VALUE)
	JSONObject saveStoreInfo(@RequestParam(value="ecmStr") String ecmStr);
	

	@RequestMapping(value = "/api-smart-mall-ecm/ecm/perfectEcm", method = RequestMethod.POST, consumes=MediaType.APPLICATION_JSON_UTF8_VALUE)
	JSONObject perfectEcm(@RequestParam(value="id") Long id,
			@RequestParam(value="key") String key,
			@RequestParam(value="value") String value);
	
	/**
	 * 商城信息
	 * @param  name 商城 name
	 * @return
	 */
	@RequestMapping(value = "/api-smart-mall-ecm/ecm/findByName", method = RequestMethod.GET)
	JSONObject findByName(@RequestParam(value="name") String name);
	
	/**
	 * 通过IDs查询商城信息
	 * @param  ids商城 ids
	 * @return
	 */
	@RequestMapping(value = "/api-smart-mall-ecm/ecm/findEcmByIds", method = RequestMethod.GET)
	JSONObject findEcmByIds(@RequestParam(value="ids") Long ids);
	
	/**
	 * 通过ID查询商城信息
	 * @param  id商城 id
	 * @return
	 */
	@RequestMapping(value = "/api-smart-mall-ecm/ecm/queryDetail", method = RequestMethod.GET)
	JSONObject queryDetail(@RequestParam(value="id") Long id);
	
}


