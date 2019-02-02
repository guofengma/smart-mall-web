package com.emin.platform.smw.util;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

/**
 * @auth Anson
 * @name json对象的帮助对象
 * @date 18-1-17
 * @since 1.0.0
 */
public final class JsonObjectHelper {

    private final JSONObject jsonObject;

    private static Map<Class<?>, ValueHandler<?>> handlerMap = new HashMap<>();

    static {
        handlerMap.putIfAbsent(String.class, (v, key) -> (v.getString(key)));
        handlerMap.putIfAbsent(Boolean.class, (v, key) -> (v.getBoolean(key)));
        handlerMap.putIfAbsent(Integer.class, (v, key) -> (v.getInteger(key)));
        handlerMap.putIfAbsent(Double.class, (v, key) -> (v.getDouble(key)));
        handlerMap.putIfAbsent(Long.class, (v, key) -> (v.getLong(key)));
        handlerMap.putIfAbsent(Float.class, (v, key) -> (v.getFloat(key)));
        handlerMap.putIfAbsent(Byte.class, (v, key) -> (v.getByte(key)));
        handlerMap.putIfAbsent(BigDecimal.class, (v, key) -> (v.getBigDecimal(key)));
        handlerMap.putIfAbsent(JSONObject.class, (v, key) -> (v.getJSONObject(key)));
        handlerMap.putIfAbsent(JSONArray.class, (v, key) -> (v.getJSONArray(key)));
        handlerMap.putIfAbsent(Object.class, (v, key) -> (v.get(key)));
    }

    public JsonObjectHelper(JSONObject jsonObject) {
        this.jsonObject = jsonObject;
    }


    /**
     * @auth Anson
     * @name 默认值不能为空
     * @date 18-1-3
     * @since 1.0.0
     */
    public final <T> T getValue(String key, T defaultValue) {
        if (this.jsonObject == null) {
            return defaultValue;
        }
        return getValue(key, defaultValue, null);
    }

    /**
     * @auth Anson
     * @name 默认值不能为空
     * @date 18-1-3
     * @since 1.0.0
     */
    public final <T> T getValue(String key, Class<T> targetClass) {
        if (this.jsonObject == null) {
            return null;
        }
        return getValue(key, null, targetClass);
    }

    /**
     * @auth Anson
     * @name 默认值不能为空
     * @date 18-1-3
     * @since 1.0.0
     */
    public final <T> T getValue(String key, T defaultValue, Class<T> targetClass) {
        if (this.jsonObject == null) {
            return defaultValue;
        }
        Class<T> clazz = targetClass != null ? targetClass : (Class<T>) defaultValue.getClass();
        return jsonObject.containsKey(key) ? this.doHandleJsonValue(this.jsonObject, key, clazz) :
                defaultValue;
    }


    private final <T> T doHandleJsonValue(JSONObject v, String key, Class<T> clazz) {
        return (T) handlerMap.get(clazz).handler(v, key);
    }

    @FunctionalInterface
    interface ValueHandler<T> {
        T handler(JSONObject v, String key);
    }

}
