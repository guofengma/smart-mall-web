package com.emin.platform.smw.controller;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.emin.base.util.CookieUtil;
import com.emin.platform.smw.annotation.IgnoreIterceptor;
import com.emin.platform.smw.constain.ApplicationConstain;
import com.emin.platform.smw.interfaces.AuthApiFeign;
import com.emin.platform.smw.interfaces.RetrievePasswordApiFeign;
import com.emin.platform.smw.interfaces.UserApiFeign;
import com.emin.platform.smw.util.TokenThreadLocalUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

/**
 * 忘记密码、重置密码控制层
 * 
 * @author Winnie
 *
 */
@Controller
public class RetrievePasswordController extends HeaderCommonController {

	private static final String VALIDATE_TYPE_IMG = "commonImage";
	private static final String VALIDATE_TYPE_SMS = "sms";
	private static final String LOGIN_TYPE = "tryMatcherAll";
	private static final String SUPER_TOKEN = "emin.smart.mall.super.token";

	@Autowired
	UserApiFeign userApiFeign; // 用户管理api
	@Autowired
	AuthApiFeign authApiFeign;
	@Autowired
	RetrievePasswordApiFeign retrievePasswordApiFeign;// 忘记密码api


	/**
	 * 登录页面跳转
	 * 
	 * @param keyword
	 * @param ecmId
	 * @return
	 */
	@RequestMapping("/retrieve-password")
	@ResponseBody
	@IgnoreIterceptor
	public ModelAndView goManage() {
		return new ModelAndView("modules/retrieve-password/manage");
	}

	/**
	 * 根据手机号查询用户
	 * @param mobile 手机号
	 * @param code 验证码
	 * @return
	 */
	@RequestMapping("/findPersonByMobile")
	@ResponseBody
	@IgnoreIterceptor
	public JSONObject findPersonByMobile(String mobile, String code, String sequence) {
		//验证码验证
		JSONObject validateResult = authApiFeign.check(VALIDATE_TYPE_IMG, sequence, code, null);
		this.dealException(validateResult);
		//获取用户信息
		JSONObject res = userApiFeign.findPersonByMobile(mobile);
		this.dealException(res);
		return res;
	}
	/**
	 * 获取手机验证码
	 * @param validateType 验证码类别定义,sms表示短信验证码
	 * @param sequence 当前请求唯一标识符
	 * @param expire 过期时间,单位毫秒
	 * @param strategy 验证码内容生成策略,0:混合秘钥,1:纯数字,2:纯字母 ,100:计算性的验证码(默认选择)
	 * @param extendParams 扩展参数传递,json格式
	 */
	@RequestMapping("/getMobileCode")
	@ResponseBody
	@IgnoreIterceptor
	public JSONObject getMobileCode(String mobile, String sequence, Long expire, Long strategy, String extendParams) {
		if(expire == null) {
			expire = 60 * 1000 * 10L;
		}
		if(strategy == null) {
			strategy = 200L;
		}
		JSONObject res = retrievePasswordApiFeign.getMobileCode(VALIDATE_TYPE_SMS, sequence, expire, strategy, extendParams);
		this.dealException(res);
		return res;
	}
	
	/**
	 * 根据手机号重置密码
	 * @param mobile 手机号
	 * @param code 验证码
	 * @param newPassword 新密码
	 * @return
	 */
	@RequestMapping("/resetPasswdByMobile")
	@ResponseBody
	@IgnoreIterceptor
	public JSONObject resetPasswdByMobile(String mobile, String mobileCode, String sequence,String newPassword) {
		//验证短信码验证
		JSONObject validateResult = authApiFeign.check(VALIDATE_TYPE_SMS, sequence, mobileCode, null);
		this.dealException(validateResult);
		//设置新密码
		JSONObject res = userApiFeign.resetPasswdByMobile(mobile, newPassword);
		this.dealException(res);
		return res;
	}
}