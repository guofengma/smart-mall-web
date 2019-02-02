package com.emin.platform.smw.interfaces;

import com.alibaba.fastjson.JSONObject;
import com.emin.platform.smw.constain.ApplicationConstain;
import org.springframework.cloud.netflix.feign.FeignClient;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;


@FeignClient(value = ApplicationConstain.ZUUL_SERVICE)
public interface EcmApiFeign {
	
	
	@RequestMapping(value = "/api-erdm-ecm/ecm/findEcmByIds", method = RequestMethod.GET)
	JSONObject findEcmByIds(@RequestParam(value="ids") String ids);
	
	
}
