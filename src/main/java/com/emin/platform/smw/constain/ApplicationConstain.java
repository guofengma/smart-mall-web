package com.emin.platform.smw.constain;

public abstract class ApplicationConstain {

    //同步下载的容量大小redis的key
    public static final String SMART_MALL_WEB_REDIS_PRE = "com:emin:smart:mall:smw:config:";


    public static final String AUTHORIZATION_KEY = "Authorization";

    public static final String ZUUL_SERVICE = "zuul";

    public static final String RESULT_STRING = "result";
    /**
     * @auth Anson
     * @name 通信队列类型
     * @date 18-6-22
     * @since 1.0.0
     */
    public static enum AmqpDtoCategoryEventCode {
        NOTIFY_MESSAGE("notify-message", "消息通知事件");

        private String code;
        private String message;

        AmqpDtoCategoryEventCode(String code, String message) {
            this.code = code;
            this.message = message;
        }

        public String getCode() {
            return code;
        }

        public String getMessage() {
            return message;
        }

    }

    /**
     * @auth Anson
     * @name 消息通知的事件类别
     * @date 18-6-22
     * @since 1.0.0
     */
    public enum AmqpNotifyMessageEventCode {
        ALARM("alarm", "事件告警"),
        REPORT("report", "报表推送事件"),
        BUSINESS("business", "业务推送事件"),
        PERSON("person", "个人消息事件"),
        BROADCAST("broadcast", "广播事件"),
        ABNORMAL("abnormal", "异常通知"),;

        private String code;
        private String message;

        AmqpNotifyMessageEventCode(String code, String message) {
            this.code = code;
            this.message = message;
        }

        public String getCode() {
            return code;
        }

        public String getMessage() {
            return message;
        }

    }

}
