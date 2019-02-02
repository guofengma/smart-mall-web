package com.emin.platform.smw.dto.amqp;

import com.alibaba.fastjson.JSONObject;

public class NotifyMessageStructure implements AmqpDataConverter<AmqpNotifyMessageStructure<JSONObject>> {

    public static AmqpCommonStructure<AmqpNotifyMessageStructure<JSONObject>> converter(JSONObject jsonObject) {
        return AmqpCommonStructureBuilder.converter(jsonObject, new NotifyMessageStructure());
    }


    /**
     * Applies this function to the given argument.
     *
     * @param jsonObject the function argument
     * @return the function result
     */
    @Override
    public AmqpNotifyMessageStructure<JSONObject> apply(JSONObject jsonObject) {
        return AmqpNotifyMessageStructureBuilder.converter(jsonObject);
    }
}
