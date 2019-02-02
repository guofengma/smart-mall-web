package com.emin.platform.smw.config;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.emin.platform.smw.exception.UnauthorizedException;
import feign.Feign;
import feign.Response;
import feign.RetryableException;
import feign.Util;
import feign.codec.Encoder;
import feign.codec.ErrorDecoder;
import feign.form.spring.SpringFormEncoder;
import jdk.nashorn.internal.runtime.regexp.joni.exception.InternalException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.web.HttpMessageConverters;
import org.springframework.cloud.netflix.feign.support.SpringEncoder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;

@Configuration
public class FeignMultipartSupportConfig {

    @Autowired
    private ObjectFactory<HttpMessageConverters> messageConverters;

    @Bean
    public Encoder feignFormEncoder() {
        return new SpringFormEncoder(new SpringEncoder(messageConverters));
    }

    @Bean
    public ErrorDecoder errorDecoder() {

        return new ErrorDecoder() {

            /** 日志 */
            private final Logger LOGGER = LoggerFactory.getLogger(FeignMultipartSupportConfig.class);

            /**
             * Implement this method in order to decode an HTTP {@link Response} when {@link
             * Response#status()} is not in the 2xx range. Please raise  application-specific exceptions where
             * possible. If your exception is retryable, wrap or subclass {@link RetryableException}
             *
             * @param methodKey {@link Feign#configKey} of the java method that invoked the request.
             *                  ex. {@code IAM#getUser()}
             * @param response  HTTP response where {@link Response#status() status} is greater than or equal
             *                  to {@code 300}.
             * @return Exception IOException, if there was a network error reading the response or an
             * application-specific exception decoded by the implementation. If the throwable is retryable, it
             * should be wrapped, or a subtype of {@link RetryableException}
             */
            @Override
            public Exception decode(String methodKey, Response response) {

                try {
                    if (response.body() != null) {
                        String body = Util.toString(response.body().asReader());
                        LOGGER.error(body);
                        JSONObject jsonObject = JSON.parseObject(body);
                        String statusKey = "status";
                        if (jsonObject.containsKey(statusKey)) {
                            Integer status = jsonObject.getInteger(statusKey);
                            if (401 == status) {
                                //添加当前错误码为未授权异常
                                throw new UnauthorizedException(body);
                            }
                        }
                    }
                } catch (InternalException | IOException var4) {
                    LOGGER.error(var4.getMessage());
                    return new InternalException(var4.getMessage());
                }
                return new InternalException("系统异常,请联系管理员");
            }
        };
    }
}


