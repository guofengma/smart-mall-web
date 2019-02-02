package com.emin.platform.smw.interfaces;

import com.alibaba.fastjson.JSONObject;

import com.emin.platform.smw.constain.ApplicationConstain;

import org.springframework.cloud.netflix.feign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

/***
 * 忘记密码-重置密码接口桥梁定义
 * @author winnie
 */
@FeignClient(value = ApplicationConstain.ZUUL_SERVICE)
public interface RetrievePasswordApiFeign {

	
	/**
	 * 获取手机验证码
	 * @param validateType 验证码类别定义,目前支持sms
	 * @param sequence 当前请求唯一标识符
	 * @param expire 过期时间,单位毫秒
	 * @param strategy 验证码内容生成策略,0:混合秘钥,1:纯数字,2:纯字母 ,100:计算性的验证码(默认选择)
	 * @param extendParams 扩展参数传递,json格式
	 */
	@RequestMapping(value = "/api-smart-mall-auth/validate/validateCode/{validateType}",method = RequestMethod.GET,headers = {"Authorization=emin.smart.mall.super.token"})
	JSONObject getMobileCode(
			@PathVariable(value="validateType") String validateType,
			@RequestParam(value="sequence") String sequence,
			@RequestParam(value="expire") Long expire,
			@RequestParam(value="strategy") Long strategy,
			@RequestParam(value="extendParams") String extendParams);
}