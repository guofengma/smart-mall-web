package com.emin.platform.smw.dto.amqp;

import com.alibaba.fastjson.JSONObject;
import com.emin.platform.smw.util.JsonObjectHelper;

import java.io.Serializable;
import java.util.function.Function;

public final class AmqpCommonStructureBuilder {
    private String dtoCategoryId;
    private String version = "1.0.0";
    private Long pushTime;
    private AmqpCommonPushAppSourceInfo pushAppSourceInfo;

    private AmqpCommonStructureBuilder() {
    }

    public static AmqpCommonStructureBuilder anAmqpCommonStructure() {
        return new AmqpCommonStructureBuilder();
    }

    public AmqpCommonStructureBuilder withDtoCategoryId(String dtoCategoryId) {
        this.dtoCategoryId = dtoCategoryId;
        return this;
    }

    public AmqpCommonStructureBuilder withVersion(String version) {
        this.version = version;
        return this;
    }

    public AmqpCommonStructureBuilder withPushTime(Long pushTime) {
        this.pushTime = pushTime;
        return this;
    }

    public AmqpCommonStructureBuilder withPushAppSourceInfo(AmqpCommonPushAppSourceInfo pushAppSourceInfo) {
        this.pushAppSourceInfo = pushAppSourceInfo;
        return this;
    }


    public AmqpCommonStructure build() {
        AmqpCommonStructure amqpCommonStructure = new AmqpCommonStructure();
        amqpCommonStructure.setDtoCategoryId(dtoCategoryId);
        amqpCommonStructure.setVersion(version);
        amqpCommonStructure.setPushTime(pushTime);
        amqpCommonStructure.setPushAppSourceInfo(pushAppSourceInfo);
        return amqpCommonStructure;
    }

    /**
     * @param jsonObject
     * @param function
     * @return com.emin.platform.smw.dto.amqp.AmqpCommonStructure<T>
     * @auth Anson
     * @name json格式转换
     * @date 18-6-25
     * @since 1.0.0
     */
    public static <T extends Serializable> AmqpCommonStructure<T> converter(JSONObject jsonObject, Function<JSONObject, T> function) {
        JsonObjectHelper helper = new JsonObjectHelper(jsonObject);
        AmqpCommonPushAppSourceInfo info = AmqpCommonPushAppSourceInfoBuilder.converter(helper.getValue("pushAppSourceInfo", JSONObject.class));
        AmqpCommonStructure<T> structure = AmqpCommonStructureBuilder.anAmqpCommonStructure()
                .withDtoCategoryId(helper.getValue("dtoCategoryId", String.class))
                .withPushTime(helper.getValue("pushTime", Long.class))
                .withVersion(helper.getValue("version", String.class))
                .withPushAppSourceInfo(info)
                .build();
        T t = function.apply(helper.getValue("data", JSONObject.class));
        structure.setData(t);
        return structure;
    }

}
