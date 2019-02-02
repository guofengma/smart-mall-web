package com.emin.platform.smw.amqp;

import java.nio.charset.Charset;
import java.util.HashSet;
import java.util.Set;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitHandler;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.emin.platform.smw.config.RabbitMqConfiguration;
import com.emin.platform.smw.dto.amqp.AmqpCommonStructure;
import com.emin.platform.smw.dto.amqp.AmqpNotifyMessageStructure;
import com.emin.platform.smw.dto.amqp.NotifyMessageStructure;

/**
 * @author Anson
 * @date 17-12-7
 * @name 接受消息服务
 * @since 1.0.0
 */
@Component
@Order(10)
public class NotifyMessageReceiver implements Receiver {

    /**
     * 日志
     */
    private static final Logger LOGGER = LoggerFactory.getLogger(NotifyMessageReceiver.class);

    private final Set<AmqpMessageHandler> handlers = new HashSet<>();

    public NotifyMessageReceiver() {
        handlers.add(new AlarmAmqpMessageHandler());
        handlers.add(new AsyncReportTaskAmqpMessageHandler());
        handlers.add(new AbnormalAmqpMessageHandler());
    }


    @RabbitListener(queues = RabbitMqConfiguration.NOTIFY_MESSAGE_ALARM_QUEUE_KEY)
    @RabbitHandler
    public void listener(Message data) {
        if (data == null) {
            return;
        }
        if (String.class.isAssignableFrom(data.getClass())) {
            this.receiver(data.toString());
        } else {
            this.receiver(new String(data.getBody(), Charset.forName("utf-8")));
        }
    }


    /**
     * @param data
     * @author Anson
     * @date 17-12-13
     * @name 当前公共处理方法
     * @since 1.0.0
     */

    @Override
    public void receiver(String data) {
        if (StringUtils.isBlank(data)) {
            return;
        }
        AmqpCommonStructure<AmqpNotifyMessageStructure<JSONObject>> notify
                = NotifyMessageStructure.converter(JSON.parseObject(data));
        LOGGER.info("接受到新的消息推送--->notify={}", data);
        handlers.stream().filter(e -> e.isMatcherHandler(notify)).forEach(e -> {
            try {
                e.handler(notify);
            } catch (Exception ex) {
                LOGGER.error("当前推送处理错误,handler={},notify={}", e, notify);
            }
        });
    }

}
