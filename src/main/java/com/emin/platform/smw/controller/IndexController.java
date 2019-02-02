package com.emin.platform.smw.controller;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.emin.platform.smw.constain.ApplicationConstain;
import com.emin.platform.smw.filter.MenuFilter;
import com.emin.platform.smw.interfaces.ResultCheckUtil;
import com.emin.platform.smw.interfaces.UserApiFeign;
import com.emin.platform.smw.util.UserClaim;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import java.util.Map;

import static com.emin.platform.smw.constain.ApplicationConstain.SMART_MALL_WEB_REDIS_PRE;

@Controller
public class IndexController extends HeaderCommonController {
    /**
     * slf
     */
    private static final Logger LOGGER = LoggerFactory.getLogger(IndexController.class);

    public static final String MODULE_MATCHER_KEY = "{module}";
    public static final String REDIS_URL_QUERY_KEY = SMART_MALL_WEB_REDIS_PRE + MODULE_MATCHER_KEY + ":url";

    @Autowired
    UserApiFeign userApiFeign;

    @Autowired
    transient StringRedisTemplate redisTemplate;

    @Autowired
    private MenuFilter menuFilter;

    @Value("${server.port:80}")
    private Integer port;

    /**
     *@param module
     *@return com.alibaba.fastjson.JSONObject
     *@auth Anson
     *@name 返回某个模块在配置中的真实地址
     *@date 18-10-24
     *@since 1.0.0
     *
     */
    @GetMapping(value = "/system/{module}/url")
    @ResponseBody
    public JSONObject port(@PathVariable String module) {
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("code", "smw_0.0.002");
        jsonObject.put("message", "参数错误");
        jsonObject.put("success", false);
        if (StringUtils.isBlank(module)) {
            return jsonObject;
        }
        String queryKey = REDIS_URL_QUERY_KEY.replace(MODULE_MATCHER_KEY, module);
        String url = redisTemplate.opsForValue().get(queryKey);
        LOGGER.info("查询redis配置url的key={},url={}", queryKey, url);
        if (StringUtils.isBlank(url)) {
            jsonObject.put("message", "未找到当前url配置");
            return jsonObject;
        } else {
            jsonObject.put("code", "ok");
            jsonObject.put("success", true);
            jsonObject.put("message", "");
            jsonObject.put("result", url);
        }
        return jsonObject;
    }

    @GetMapping(value = "/system/info/port")
    @ResponseBody
    public JSONObject port() {
        JSONObject result = new JSONObject();
        result.put("code", "ok");
        result.put(ApplicationConstain.RESULT_STRING, port);
        return result;
    }


    @RequestMapping(value = "/", method = RequestMethod.GET)
    public String index(Map<String, Object> data) {
        UserClaim userClaim = this.validateAuthorizationToken();
        if (userClaim.getId() == null) {
            //验证不通过，则跳转到登录
            return "modules/login/manage";
        }
        Long userId = userClaim.getId();

        JSONObject userDetail = new JSONObject();
        JSONObject user = new JSONObject();
        try {
            userDetail = userApiFeign.detail(userId);
        } catch (Exception e) {
            LOGGER.error("主页加载用户详情时接口出错，详情->" + e.getMessage());
        }
        if (!userDetail.isEmpty()) {
            user = userDetail.getJSONObject(ApplicationConstain.RESULT_STRING);
            ResultCheckUtil.check(userDetail);
        }
        JSONObject flockResult = new JSONObject();
        try {
            flockResult = userApiFeign.getUserFlocks(userId);
        } catch (Exception e) {
            LOGGER.error("主页加载用户flockResult接口出错，详情->" + e.getMessage());
        }
        JSONArray flocks = new JSONArray();
        if (!flockResult.isEmpty()) {
            flocks = flockResult.getJSONArray(ApplicationConstain.RESULT_STRING);
        }

        Integer userType = null;
        if (!user.isEmpty()) {
            userType = user.getIntValue("userType");
        }
        if (userType != null && !flocks.isEmpty()) {
            if (flocks.isEmpty() && userType != 1) {
                data.put("noPermissions", true);
            } else {
                JSONArray menuList = new JSONArray();
                try {
                    if (!flocks.isEmpty()) {
                        Long[] groupIds = new Long[flocks.size()];
                        for (int j = 0; j < flocks.size(); j++) {
                            groupIds[j] = flocks.getJSONObject(j).getLong("id");
                        }
                        menuList = menuFilter.buildMenByUserType(userType, groupIds);
                    } else {
                        menuList = menuFilter.buildMenByUserType(userType);
                    }
                } catch (Exception e) {
                    LOGGER.error("主页加载用户权限菜单列表时出错，详情->" + e.getMessage());
                }
                data.put("menus", menuList);
            }
        }
        data.put("userDetail", user);
        return "index";
    }


    @RequestMapping("/404")
    public ModelAndView pageNotFound() {
        return new ModelAndView("404");
    }

    @RequestMapping("/500")
    public ModelAndView pageError() {
        return new ModelAndView("500");
    }


    @RequestMapping("/no-page")
    public ModelAndView noPage() {
        return new ModelAndView("no-page");
    }
}
