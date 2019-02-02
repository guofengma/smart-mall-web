package com.emin.platform.smw.dto.amqp;

import com.alibaba.fastjson.JSONObject;
import com.emin.platform.smw.util.JsonObjectHelper;

public final class AmqpCommonPushAppSourceInfoBuilder {
    private String appName;
    private String appCode;
    private String appIp;

    private AmqpCommonPushAppSourceInfoBuilder() {
    }

    public static AmqpCommonPushAppSourceInfoBuilder anAmqpCommonPushAppSourceInfo() {
        return new AmqpCommonPushAppSourceInfoBuilder();
    }

    public AmqpCommonPushAppSourceInfoBuilder withAppName(String appName) {
        this.appName = appName;
        return this;
    }

    public AmqpCommonPushAppSourceInfoBuilder withAppCode(String appCode) {
        this.appCode = appCode;
        return this;
    }

    public AmqpCommonPushAppSourceInfoBuilder withAppIp(String appIp) {
        this.appIp = appIp;
        return this;
    }

    public AmqpCommonPushAppSourceInfo build() {
        AmqpCommonPushAppSourceInfo amqpCommonPushAppSourceInfo = new AmqpCommonPushAppSourceInfo();
        amqpCommonPushAppSourceInfo.setAppName(appName);
        amqpCommonPushAppSourceInfo.setAppCode(appCode);
        amqpCommonPushAppSourceInfo.setAppIp(appIp);
        return amqpCommonPushAppSourceInfo;
    }

    public static AmqpCommonPushAppSourceInfo converter(JSONObject jsonObject) {
        JsonObjectHelper helper = new JsonObjectHelper(jsonObject);
        return AmqpCommonPushAppSourceInfoBuilder.anAmqpCommonPushAppSourceInfo()
                .withAppName(helper.getValue("appName", String.class))
                .withAppCode(helper.getValue("appCode", String.class))
                .withAppIp(helper.getValue("appIp", String.class))
                .build();
    }
}
