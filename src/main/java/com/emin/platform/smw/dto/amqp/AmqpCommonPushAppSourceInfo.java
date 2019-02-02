package com.emin.platform.smw.dto.amqp;

import java.io.Serializable;


public class AmqpCommonPushAppSourceInfo implements Serializable {


    private String appName;

    private String appCode;

    private String appIp;


    public String getAppName() {
        return appName;
    }

    public void setAppName(String appName) {
        this.appName = appName;
    }

    public String getAppCode() {
        return appCode;
    }

    public void setAppCode(String appCode) {
        this.appCode = appCode;
    }

    public String getAppIp() {
        return appIp;
    }

    public void setAppIp(String appIp) {
        this.appIp = appIp;
    }


}
