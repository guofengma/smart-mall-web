/**
 *
 */
package com.emin.platform.smw.filter;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.emin.base.util.CommonsUtil;
import com.emin.platform.smw.constain.ApplicationConstain;
import com.emin.platform.smw.interfaces.PermissionAPIFeign;
import com.emin.platform.smw.interfaces.UserApiFeign;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * @author jim.lee
 */
@Component
public class MenuOperationFilter {

    @Value("${spring.application.code}")
    private String appCode;

    @Autowired
    private PermissionAPIFeign permissionAPIFeign;
    @Autowired
    private UserApiFeign userApiFeign;

    public String menuOperations(String menuCode, JSONObject param) {
        Long userId = param.getLong("userId");
        JSONObject userDetail = userApiFeign.detail(userId);
        JSONObject user = userDetail.getJSONObject(ApplicationConstain.RESULT_STRING);
        JSONObject flockResult = userApiFeign.getUserFlocks(userId);
        JSONArray flocks = flockResult.getJSONArray(ApplicationConstain.RESULT_STRING);
        JSONArray operations = null;
        if (user.getIntValue("userType") != 1) {
            if (flocks.size() > 0) {
                Long[] groupIds = new Long[flocks.size()];
                for (int i = 0; i < flocks.size(); i++) {
                    groupIds[i] = flocks.getJSONObject(i).getLong("id");
                }
                JSONObject result = permissionAPIFeign.menuOperation(appCode, menuCode, groupIds);
                operations = result.getJSONObject(ApplicationConstain.RESULT_STRING).getJSONArray("operation");
            }
        } else {

            JSONObject result = permissionAPIFeign.menuOperation(appCode, menuCode);
            operations = result.getJSONArray(ApplicationConstain.RESULT_STRING);
        }

        if (operations != null) {
            String[] operationCodes = new String[operations.size()];
            for (int i = 0; i < operations.size(); i++) {
                operationCodes[i] = operations.getJSONObject(i).getString("code");
            }
            return CommonsUtil.stringArrToString(operationCodes);
        }

        return "";
    }
}
