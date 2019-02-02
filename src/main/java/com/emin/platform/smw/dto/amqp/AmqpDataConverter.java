package com.emin.platform.smw.dto.amqp;

import com.alibaba.fastjson.JSONObject;

import java.io.Serializable;
import java.util.function.Function;

@FunctionalInterface
public interface AmqpDataConverter<T extends Serializable> extends Function<JSONObject, T> {
}
