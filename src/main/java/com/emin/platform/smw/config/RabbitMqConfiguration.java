package com.emin.platform.smw.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;


/**
 * @author Anson
 * @date 17-12-11
 * @name 消息队列配置器
 * @since 1.0.0
 */
@Configuration
public class RabbitMqConfiguration {


    public static final String NOTIFY_MESSAGE_ALARM_ROUTE_KEY = "com.emin.smart.mall.notify.message.*";

    public static final String NOTIFY_MESSAGE_ALARM_QUEUE_KEY = "com.emin.smart.mall.notify.message.*";


    /**
     * @author Anson
     * @date 17-12-11
     * @name
     * @since 1.0.0
     */
    @Bean("notifyEventQueue")
    Queue notifyEventQueue() {
        Map<String, Object> arguments = new HashMap<>();
        arguments.put("x-message-ttl", 5000);//当前消息存活5秒
        Queue queue = new Queue(NOTIFY_MESSAGE_ALARM_QUEUE_KEY, true, false, false, arguments);
        return queue;
    }


    /**
     * @author Anson
     * @date 17-12-11
     * @name 当前处理交换器
     * @since 1.0.0
     */
    @Bean("notifyTopicExchange")
    TopicExchange notifyTopicExchange() {
        return new TopicExchange("notify.topic");
    }


    /**
     * @param notifyEventQueue
     * @param notifyTopicExchange
     * @author Anson
     * @date 17-12-11
     * @name 将当前队列与转换器按照当前路由进行匹配
     * @since 1.0.0
     */
    @Bean("notifyMessageAlarmQueueBind")
    Binding bindingEcmStorageExchangeMessage(@Autowired
                                             @Qualifier("notifyEventQueue")
                                                     Queue notifyEventQueue,
                                             @Autowired
                                             @Qualifier("notifyTopicExchange")
                                                     TopicExchange notifyTopicExchange) {
        return BindingBuilder.bind(notifyEventQueue)
                .to(notifyTopicExchange).with(NOTIFY_MESSAGE_ALARM_ROUTE_KEY);
    }

}
