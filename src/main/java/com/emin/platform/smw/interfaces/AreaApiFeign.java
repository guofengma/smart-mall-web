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
 * @beginDate 2018/06/05 02:13 123
 */

@FeignClient(value = ApplicationConstain.ZUUL_SERVICE)
public interface AreaApiFeign {

	@RequestMapping(value = "/api-smart-mall-floor/area/delArea", method = RequestMethod.GET)
	JSONObject remove(@RequestParam(value="areaId") Long areaId);
	
	
	@RequestMapping(value = "/api-smart-mall-floor/area/queryArea", method = RequestMethod.GET)
	JSONObject list(@RequestParam(value="areaId") Long areaId);
	

	@RequestMapping(value = "/api-smart-mall-floor/area/queryAreaRatio", method = RequestMethod.GET)
	JSONObject queryConfigedAreas(@RequestParam(value="flag") boolean isConfiged);

	@RequestMapping(value = "/api-smart-mall-floor/area/queryAreaFloorPicture", method = RequestMethod.GET)
	JSONObject getVerticalView(@RequestParam(value="mallId") Long mallId,
			@RequestParam(value="areaId") Long areaId,
			@RequestParam(value="floorId") Long floorId);
	

	@RequestMapping(value = "/api-smart-mall-floor/area/queryFloorByArea", method = RequestMethod.GET)
	JSONObject getFloors(@RequestParam(value="areaId") Long areaId);
	

	@RequestMapping(value = "/api-smart-mall-floor/area/saveArea", method = RequestMethod.POST, consumes=MediaType.APPLICATION_JSON_UTF8_VALUE)
	JSONObject save(@RequestBody String areaDetail);

	@RequestMapping(value = "/api-smart-mall-floor/area/saveAreaFloor", method = RequestMethod.POST, consumes=MediaType.APPLICATION_JSON_UTF8_VALUE)
	JSONObject saveFloor(@RequestBody String jsonObject);
	
	@RequestMapping(value = "/api-smart-mall-floor/area/saveAreaFloorPicture", method = RequestMethod.POST, consumes=MediaType.APPLICATION_JSON_UTF8_VALUE)
	JSONObject saveVerticalView(@RequestBody String picture);
	

	@RequestMapping(value = "/api-smart-mall-floor/area/queryPictureRatio", method = RequestMethod.GET)
	JSONObject getLayoutCoordinateByAreaId(@RequestParam(value="areaId") Long areaId);
	
	@RequestMapping(value = "/api-smart-mall-floor/area/savePictureRatio", method = RequestMethod.POST, consumes=MediaType.APPLICATION_JSON_UTF8_VALUE)
	JSONObject saveLayoutCoordinates(@RequestBody String positionMatch);
	
	/**
	 * 删除商城与区域图片匹配关系
	 * @param areaId 区域id
	 */
	@RequestMapping(value = "/api-smart-mall-floor/area/delAreaPositionMatch", method = RequestMethod.GET)
	JSONObject delAreaPositionMatch(@RequestParam(value="areaId") Long areaId);
		
}


