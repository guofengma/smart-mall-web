package com.emin.platform.smw.amqp;

import com.alibaba.fastjson.JSONObject;
import com.emin.platform.smw.dto.amqp.AmqpCommonStructure;
import com.emin.platform.smw.dto.amqp.AmqpNotifyMessageStructure;

/**
 * @auth Anson
 * @name 消息处理器
 * @date 18-6-25
 * @since 1.0.0
 */
public interface AmqpMessageHandler {


    /**
     * @param notify
     * @return boolean
     * @auth Anson
     * @name 是否满足当前处理器
     * @date 18-6-25
     * @since 1.0.0
     */
    default boolean isMatcherHandler(AmqpCommonStructure<AmqpNotifyMessageStructure<JSONObject>> notify) {
        return true;
    }

    /**
     * @param notify
     * @return void
     * @auth Anson
     * @name 处理当前数据
     * @date 18-6-25
     * @since 1.0.0
     */
    void handler(AmqpCommonStructure<AmqpNotifyMessageStructure<JSONObject>> notify);

}
