package com.emin.platform.smw.dto.amqp;

import com.alibaba.fastjson.JSONObject;
import com.emin.platform.smw.util.JsonObjectHelper;

public final class AmqpNotifyMessageStructureBuilder {
    private String eventCode;//当前消息事件类型码:alerm,business,person,broadcast等等
    private String eventName;//当前消息事件类型名称:告警推送事件,业务推送事件,个人消息事件,广播事件等等

    private AmqpNotifyMessageStructureBuilder() {
    }

    public static AmqpNotifyMessageStructureBuilder anAmqpNotifyMessageStructure() {
        return new AmqpNotifyMessageStructureBuilder();
    }

    public AmqpNotifyMessageStructureBuilder withEventCode(String eventCode) {
        this.eventCode = eventCode;
        return this;
    }

    public AmqpNotifyMessageStructureBuilder withEventName(String eventName) {
        this.eventName = eventName;
        return this;
    }

    public AmqpNotifyMessageStructure build() {
        AmqpNotifyMessageStructure amqpNotifyMessageStructure = new AmqpNotifyMessageStructure();
        amqpNotifyMessageStructure.setEventCode(eventCode);
        amqpNotifyMessageStructure.setEventName(eventName);
        return amqpNotifyMessageStructure;
    }

    public static AmqpNotifyMessageStructure<JSONObject> converter(JSONObject jsonObject) {
        JsonObjectHelper helper = new JsonObjectHelper(jsonObject);
        AmqpNotifyMessageStructure<JSONObject> structure = AmqpNotifyMessageStructureBuilder.anAmqpNotifyMessageStructure()
                .withEventCode(helper.getValue("eventCode", String.class))
                .withEventName(helper.getValue("eventName", String.class))
                .build();
        structure.setMessage(helper.getValue("message", JSONObject.class));
        return structure;
    }
}
