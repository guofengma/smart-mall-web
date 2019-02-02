package com.emin.platform.smw.interfaces;

import com.alibaba.fastjson.JSONObject;

import com.emin.platform.smw.constain.ApplicationConstain;
import org.springframework.cloud.netflix.feign.FeignClient;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

/***
 * 登录注销接口桥梁定义
 * @author winnie
 */
@FeignClient(value = ApplicationConstain.ZUUL_SERVICE)
public interface LoginApiFeign {
	
	/**
	 * 用户登录
	 * @param username 账号
	 * @param password 密码
	 * @param code 验证码
	 */
	@RequestMapping(value = "/api-smart-mall-user/login",method = RequestMethod.POST)
	JSONObject login(@RequestParam(value="username") String username,
			@RequestParam(value="password") String password,
			@RequestParam(value="code") String code);
	
	/**
	 * 获取验证图片
	 */
	@RequestMapping(value = "/api-smart-mall-user/common/get_img",method = RequestMethod.GET)
	byte[] getImg();
	
	/**
	 *验证用户是否登录
	 * @param token 用过户登录时获取到的token值
	 */
	@RequestMapping(value = "/api-smart-mall-user/validate",method = RequestMethod.POST)
	JSONObject userValidate(
			@RequestParam(value="token") String token);
	
	/**
	 *用户退出登录
	 * @param token 用过户登录时获取到的token值
	 */
	@RequestMapping(value = "/api-smart-mall-user/outLogin",method = RequestMethod.POST)
	JSONObject outLogin(
			@RequestParam(value="token") String token);
	
}