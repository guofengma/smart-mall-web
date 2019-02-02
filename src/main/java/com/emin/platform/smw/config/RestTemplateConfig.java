package com.emin.platform.smw.config;

import org.apache.http.client.HttpClient;
import org.apache.http.impl.client.DefaultHttpRequestRetryHandler;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.impl.conn.PoolingHttpClientConnectionManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.Charset;

/**
 * @auth Anson
 * @name 配置当前json格式的调用客户端
 * @date 18-5-21
 * @since 1.0.0
 */
@Configuration
public class RestTemplateConfig {

    @Bean
    RestTemplate restTemplate(ClientHttpRequestFactory factory) {
        RestTemplate restTemplate = new RestTemplate(factory);
        restTemplate.getMessageConverters().add(0, new StringHttpMessageConverter(Charset.forName("UTF-8")));
        return restTemplate;

    }

    @Bean
    PoolingHttpClientConnectionManager poolingHttpClientConnectionManager() {
        PoolingHttpClientConnectionManager poolingHttpClientConnectionManager
                = new PoolingHttpClientConnectionManager();// 开始设置连接池
        poolingHttpClientConnectionManager.setMaxTotal(200); // 最大连接数200
        poolingHttpClientConnectionManager.setDefaultMaxPerRoute(20); // 同路由并发数20
        return poolingHttpClientConnectionManager;
    }

    @Bean
    ClientHttpRequestFactory simpleClientHttpRequestFactory(PoolingHttpClientConnectionManager poolingHttpClientConnectionManager) {
        HttpClientBuilder httpClientBuilder = HttpClientBuilder.create();
        httpClientBuilder.setConnectionManager(poolingHttpClientConnectionManager);
        httpClientBuilder.setRetryHandler(new DefaultHttpRequestRetryHandler(3, true));// 重试次数
        HttpClient httpClient = httpClientBuilder.build();
        HttpComponentsClientHttpRequestFactory clientHttpRequestFactory
                = new HttpComponentsClientHttpRequestFactory(httpClient);
        clientHttpRequestFactory.setReadTimeout(5000);//ms
        clientHttpRequestFactory.setConnectTimeout(15000);//ms
        clientHttpRequestFactory.setConnectionRequestTimeout(200);// 连接不够用的等待时间
        return clientHttpRequestFactory;
    }


}
