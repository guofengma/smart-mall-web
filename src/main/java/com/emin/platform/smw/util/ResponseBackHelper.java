package com.emin.platform.smw.util;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.emin.platform.smw.constain.ApplicationConstain;

import org.apache.commons.lang3.BooleanUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class ResponseBackHelper {

    /**
     * 日志
     */
    private static final Logger LOGGER = LoggerFactory.getLogger(ResponseBackHelper.class);
    public static final String RESULT = ApplicationConstain.RESULT_STRING;
    public static final String MESSAGE = "message";
    public static final String SUCCESS = "success";
    public static final String CODE = "code";

    private JsonObjectHelper helper;

    private final JSONObject jsonObject;


    public ResponseBackHelper(JSONObject jsonObject) {
        this.jsonObject = jsonObject;
        init();
    }

    public ResponseBackHelper(String jsonObjectStr) {
        this.jsonObject = this.convert(jsonObjectStr);
        init();
    }

    private JSONObject convert(String s) {
        JSONObject t = null;
        try {
            t = JSON.parseObject(s);
        } catch (Exception e) {
            LOGGER.error("json转换jsonObject对象错误", e);
        }
        return t;
    }

    private void init() {
        if (this.jsonObject != null) {
            helper = new JsonObjectHelper(this.jsonObject);
        }
    }

    /**
     * @auth Anson
     * @name 判断当前是否成功
     * @date 18-1-3
     * @since 1.0.0
     */
    public boolean isSuccess() {
        boolean isSuccess = false;
        if (this.jsonObject != null) {
            isSuccess = this.helper.getValue(SUCCESS, Boolean.FALSE);
        }
        return isSuccess;
    }

    public boolean checkResultSuccess() {
        try {

            boolean isSuccess = this.isSuccess();
            if (isSuccess && this.jsonObject != null) {
                isSuccess = this.jsonObject.containsKey(RESULT) ?
                        BooleanUtils.toBoolean(this.getHelper().getValue(RESULT, Boolean.valueOf(false)))
                        : BooleanUtils.toBoolean(this.getHelper().getValue("data", Boolean.valueOf(false)));
            }
            return isSuccess;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * 获取当前错误码
     *
     * @return
     */
    public String code() {
        String code = "";
        code = this.helper.getValue(CODE, code);
        return code;
    }

    /**
     * 获取当前错误码
     *
     * @return
     */
    public String message() {
        String message = "";
        message = this.helper.getValue(MESSAGE, message);
        return message;
    }

    /**
     * @auth Anson
     * @name 获取当前结果集对象
     * @date 18-1-3
     * @since 1.0.0
     */
    public JSONObject getResultObj() {
        JSONObject result = null;
        result = this.helper.getValue(RESULT, new JSONObject());
        return result;
    }

    /**
     * @auth Anson
     * @name 获取当前结果集对象
     * @date 18-1-3
     * @since 1.0.0
     */
    public JSONArray getResultArray() {
        JSONArray result = null;
        result = this.helper.getValue(RESULT, new JSONArray());
        return result;
    }

    public JsonObjectHelper getHelper() {
        return helper;
    }

    public JSONObject getJsonObject() {
        return jsonObject;
    }
}
