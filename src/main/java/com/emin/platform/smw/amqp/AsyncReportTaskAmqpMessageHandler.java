package com.emin.platform.smw.amqp;

import com.alibaba.fastjson.JSONObject;
import com.emin.platform.smw.constain.ApplicationConstain;
import com.emin.platform.smw.dto.amqp.AmqpCommonStructure;
import com.emin.platform.smw.dto.amqp.AmqpNotifyMessageStructure;
import com.emin.platform.smw.ws.NotifyWebSocketServer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.Objects;

/**
 * @auth Anson
 * @name 报表的消息推送
 * @date 18-6-25
 * @since 1.0.0
 */
public class AsyncReportTaskAmqpMessageHandler implements AmqpMessageHandler {

    /**
     * 日志
     */
    private static final Logger LOGGER = LoggerFactory.getLogger(AsyncReportTaskAmqpMessageHandler.class);


    /**
     * @param notify
     * @return boolean
     * @auth Anson
     * @name 是否满足当前处理器
     * @date 18-6-25
     * @since 1.0.0
     */
    @Override
    public boolean isMatcherHandler(AmqpCommonStructure<AmqpNotifyMessageStructure<JSONObject>> notify) {
        if (Objects.isNull(notify) || Objects.isNull(notify.getData()) || Objects.isNull(notify.getData().getMessage())) {
            //当前对象为空的时候
            return false;
        }
        return ApplicationConstain.AmqpDtoCategoryEventCode.NOTIFY_MESSAGE.getCode().equals(notify.getDtoCategoryId())
                &&
                ApplicationConstain.AmqpNotifyMessageEventCode.REPORT.getCode().equals(notify.getData().getEventCode());
    }

    @Override
    public void handler(AmqpCommonStructure<AmqpNotifyMessageStructure<JSONObject>> notify) {
        JSONObject message = notify.getData().getMessage();
        try {
            NotifyWebSocketServer.broadcastNotifyType(message.toJSONString(),
                    ApplicationConstain.AmqpNotifyMessageEventCode.REPORT.getCode());
        } catch (IOException e) {
            LOGGER.error("广播告警信息失败");
        }
    }
}
