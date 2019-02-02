package com.emin.platform.smw.dto.amqp;

import java.io.Serializable;

public class AmqpCommonStructure<T extends Serializable> implements Serializable {

    private String dtoCategoryId;

    private String version = "1.0.0";

    private Long pushTime;

    private AmqpCommonPushAppSourceInfo pushAppSourceInfo;

    private T data;

    public String getDtoCategoryId() {
        return dtoCategoryId;
    }

    public void setDtoCategoryId(String dtoCategoryId) {
        this.dtoCategoryId = dtoCategoryId;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public Long getPushTime() {
        return pushTime;
    }

    public void setPushTime(Long pushTime) {
        this.pushTime = pushTime;
    }

    public AmqpCommonPushAppSourceInfo getPushAppSourceInfo() {
        return pushAppSourceInfo;
    }

    public void setPushAppSourceInfo(AmqpCommonPushAppSourceInfo pushAppSourceInfo) {
        this.pushAppSourceInfo = pushAppSourceInfo;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }



}
