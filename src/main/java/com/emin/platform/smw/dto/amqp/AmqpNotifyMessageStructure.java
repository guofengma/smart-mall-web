package com.emin.platform.smw.dto.amqp;

import java.io.Serializable;

public class AmqpNotifyMessageStructure<T extends Serializable> implements Serializable {


    private String eventCode;//当前消息事件类型码:alerm,business,person,broadcast等等
    private String eventName;//当前消息事件类型名称:告警推送事件,业务推送事件,个人消息事件,广播事件等等
    private T message; //不同的消息事件类型码定义各自不同的协议

    public String getEventCode() {
        return eventCode;
    }

    public void setEventCode(String eventCode) {
        this.eventCode = eventCode;
    }

    public String getEventName() {
        return eventName;
    }

    public void setEventName(String eventName) {
        this.eventName = eventName;
    }

    public T getMessage() {
        return message;
    }

    public void setMessage(T message) {
        this.message = message;
    }

}
