package com.emin.platform.smw.interfaces;

import com.alibaba.fastjson.JSONObject;
import com.emin.platform.smw.constain.ApplicationConstain;
import org.springframework.cloud.netflix.feign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(value = ApplicationConstain.ZUUL_SERVICE)
public interface PermissionAPIFeign {

    @GetMapping("/api-perm/defaultAdminMenu/{appCode}/queryDetailByCode")
    JSONObject ecmAdminMenu(@PathVariable("appCode") String appCode);

    @GetMapping("/api-perm/permission/{appCode}/permissions")
    JSONObject userMenu(@PathVariable("appCode") String appCode, @RequestParam("groupIds") Long[] groupIds);

    @GetMapping("/api-perm/permission/{appCode}/queryByMenuCode/{menuCode}")
    JSONObject menuOperation(@PathVariable("appCode") String appCode, @PathVariable("menuCode") String menuCode, @RequestParam("groupIds") Long[] groupIds);

    @GetMapping("/api-perm/menu/queryBySuper/{appCode}")
    JSONObject superMenu(@PathVariable("appCode") String appCode);

    @GetMapping("/api-perm/operation/{appCode}/{menuCode}/queryByMenuCode")
    JSONObject menuOperation(@PathVariable("appCode")String appCode,@PathVariable("menuCode")String menuCode);
}
