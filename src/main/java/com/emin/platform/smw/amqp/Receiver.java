package com.emin.platform.smw.amqp;

/**
 * @author Anson
 * @date 17-12-11
 * @name
 * @since 1.0.0
 */
public interface Receiver {


    /**
     * @param data
     * @author Anson
     * @date 17-12-12
     * @name 接受某一个对象
     * @since 1.0.0
     */
    void receiver(String data);
}
