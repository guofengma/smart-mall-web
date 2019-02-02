/**
 *
 */
package com.emin.platform.smw.interfaces;

import com.alibaba.fastjson.JSONObject;
import com.emin.platform.smw.constain.ApplicationConstain;
import org.springframework.cloud.netflix.feign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * @author jim.lee
 */
@FeignClient(value = ApplicationConstain.ZUUL_SERVICE)
public interface AuthApiFeign {

    String API_PRE = "api-smart-mall-auth";

    /**
     * 用户登录
     *
     * @param params    参数传递
     * @param loginType 登录类别
     */
    @PostMapping(value = API_PRE + "/authorize/login/{loginType}",
            headers = {"noAuthorization=true"},
            consumes = MediaType.APPLICATION_JSON_UTF8_VALUE)
    ResponseEntity<JSONObject> login(@RequestParam(value = "params") String params,
                                     @PathVariable(value = "loginType") String loginType);

    /**
     * 获取验证图片
     */
    @GetMapping(value = API_PRE + "/validate/validateCode/{validateType}",
            headers = {"noAuthorization=true"})
    byte[] getValidateCode(@PathVariable("validateType") String validateType,
                           @RequestParam("sequence") String sequence,
                           @RequestParam("expire") Long expire,
                           @RequestParam(value = "strategy", defaultValue = "100", required = false) Integer strategy,
                           @RequestParam(value = "extendParams", required = false) String extendParams);


    @PostMapping(value = API_PRE + "/validate/check/{validateType}",
            consumes = MediaType.APPLICATION_JSON_UTF8_VALUE,
            headers = {"noAuthorization=true"})
    JSONObject check(
            @PathVariable("validateType") String validateType,
            @RequestParam("sequence") String sequence,
            @RequestParam("validateValue") String validateValue,
            @RequestParam(value = "extendParams", required = false) String extendParams);


    @GetMapping(value = API_PRE + "/token/validateAccess",
            headers = {"noAuthorization=true"})
    JSONObject validateAccess(@RequestParam(name = "token") String token);
}
