package com.emin.platform.smw.interfaces;

import com.alibaba.fastjson.JSONObject;

import com.emin.platform.smw.constain.ApplicationConstain;
import org.springframework.cloud.netflix.feign.FeignClient;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

/***
 * 
 * @author Danica
 * @beginDate 2018/09/17 15:50
 */

@FeignClient(value = ApplicationConstain.ZUUL_SERVICE)
public interface BaApiFeign {
	
	@RequestMapping(value = "/api-smart-mall-ba/ba/getBaData", method = RequestMethod.GET)
	JSONObject datas();
}


