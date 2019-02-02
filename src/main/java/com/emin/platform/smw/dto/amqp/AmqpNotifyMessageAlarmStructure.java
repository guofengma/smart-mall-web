package com.emin.platform.smw.dto.amqp;

import java.io.Serializable;

public class AmqpNotifyMessageAlarmStructure implements Serializable {


    private Long eventSourceId;

    public Long getEventSourceId() {
        return eventSourceId;
    }

    public void setEventSourceId(Long eventSourceId) {
        this.eventSourceId = eventSourceId;
    }
}
