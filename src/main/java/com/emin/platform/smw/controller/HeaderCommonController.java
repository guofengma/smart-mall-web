package com.emin.platform.smw.controller;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.emin.base.controller.BaseController;
import com.emin.base.exception.EminException;
import com.emin.platform.smw.constain.ApplicationConstain;
import com.emin.platform.smw.exception.UnauthorizedException;
import com.emin.platform.smw.interfaces.AuthApiFeign;
import com.emin.platform.smw.util.ResponseBackHelper;
import com.emin.platform.smw.util.TokenThreadLocalUtil;
import com.emin.platform.smw.util.UserClaim;

import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;

public abstract class HeaderCommonController extends BaseController {
    private static final Logger LOGGER = Logger.getLogger(HeaderCommonController.class);

    @Autowired
    AuthApiFeign tokenApiFeign;

    /**
     * @param
     * @return com.emin.platform.permission.util.UserClaim
     * @auth Anson
     * @name 验证当前token值，若非法以及过期都返回空
     * @date 18-5-4
     * @since 1.0.0
     */
    protected UserClaim validateAuthorizationToken() {
        String authorization = TokenThreadLocalUtil.getToken();
        if (StringUtils.isBlank(authorization)) {
            return new UserClaim();
        }
        JSONObject jsonObject = tokenApiFeign.validateAccess(authorization);
        ResponseBackHelper helper = new ResponseBackHelper(jsonObject);
        if (!helper.isSuccess()) {
            return new UserClaim();
        }
        String claims = helper.getHelper().getValue(ApplicationConstain.RESULT_STRING, String.class);

        JSONObject json = JSONObject.parseObject(claims);

        JSONArray organizationGroupIdsJson = json.getJSONArray("organizationGroupIds");
        JSONArray permissionGroupIdsJson = json.getJSONArray("permissionGroupIds");
        Long[] organizationGroupIds1 = jsonArrToLongArr(organizationGroupIdsJson);
        Long[] permissionGroupIds = jsonArrToLongArr(permissionGroupIdsJson);
        UserClaim.UserClaimBuilder builder = UserClaim.UserClaimBuilder.anUserClaim()
                .withAuthLatestSequence(json.getString("authLatestSequence"))
                .withEcmId(json.getLong("ecmId"))
                .withId(json.getLong("id"))
                .withMobile(json.getString("mobile"))
                .withRealName(json.getString("realName"))
                .withUserType(json.getIntValue("userType"))
                .withOrganizationGroupIds(organizationGroupIds1)
                .withPermissionGroupIds(permissionGroupIds);
        return builder.build();
    }

    /**
     *@param ex
     *@return void
     *@auth Anson
     *@name 处理公共异常,兼容以前的常规代码错误
     *@date 18-7-17
     *@since 1.0.0
     *
     */
    protected void handlerException(RuntimeException ex) throws RuntimeException {
        if (UnauthorizedException.class.isAssignableFrom(ex.getClass())) {
            throw ex;
        }
    }

    private Long[] jsonArrToLongArr(JSONArray jsonArray) {
        Long[] idArr = null;
        if (!(jsonArray == null || jsonArray.isEmpty())) {
            List<Long> ids = jsonArray.stream().map(e -> Long.valueOf(e.toString())).collect(Collectors.toCollection(ArrayList::new));
            idArr = ids.toArray(new Long[ids.size()]);
        }
        return idArr;
    }


    protected void dealException(JSONObject res) {
        if (!res.isEmpty()) {
            if (!res.getBooleanValue("success")) {
                throw new EminException(res.getString("code"));
            }
            if (!res.containsKey(ApplicationConstain.RESULT_STRING)) {
                throw new EminException("BASE_0.0.1");
            }
        } else {
            throw new EminException("BASE_0.0.0");
        }
    }

    protected void dealException(JSONObject res, String functionName) {
        if (!res.isEmpty()) {
            if (!res.getBooleanValue("success")) {
                throw new EminException(res.getString("code"));
            }
            if (!res.containsKey(ApplicationConstain.RESULT_STRING)) {
                LOGGER.error("========================>接口未返回必须的result对象============>" + functionName);
                throw new EminException("BASE_0.0.1");
            }
        } else {
            LOGGER.error("========================>接口返回空对象============>" + functionName);
            throw new EminException("BASE_0.0.0");
        }
    }

	private HttpServletRequest request;
    protected  Object getParameterValue(String parameter) {
        String[] parameterArray = getParameterArray(parameter);
        Object result;
        try {
            if (parameterArray != null && parameterArray.length == 1) {
                result = parameterArray[0];
            } else {
                result = request.getAttribute(parameter);
            }
        } catch (Exception e) {
            result = null;
        }
        
        return result == null || result.equals("") ? null : result;
     }

}
