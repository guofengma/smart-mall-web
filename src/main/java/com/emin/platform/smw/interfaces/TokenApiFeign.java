/**
 *
 */
package com.emin.platform.smw.interfaces;

import com.alibaba.fastjson.JSONObject;
import com.emin.platform.smw.constain.ApplicationConstain;
import org.springframework.cloud.netflix.feign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * @auth Anson
 * @name
 * @date 18-5-4
 * @since 1.0.0
 */
@FeignClient(value = ApplicationConstain.ZUUL_SERVICE)
public interface TokenApiFeign {

    String API_PRE = "/api-smart-mall-token";

    @PostMapping(value = API_PRE + "/token/jwt/access", consumes = MediaType.APPLICATION_JSON_UTF8_VALUE)
    JSONObject jwtAccess(
            @RequestParam(name = "claims", required = false) String claims,
            @RequestParam(name = "isPutHeader", required = false, defaultValue = "true") Boolean isPutHeader);


    @GetMapping(value = API_PRE + "/token/jwt/validateAccess")
    JSONObject validateAccess(@RequestParam(name = "token") String token);


}
