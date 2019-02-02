package com.emin.platform.smw.controller;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.emin.base.util.CookieUtil;
import com.emin.platform.smw.annotation.IgnoreIterceptor;
import com.emin.platform.smw.constain.ApplicationConstain;
import com.emin.platform.smw.interfaces.AuthApiFeign;
import com.emin.platform.smw.interfaces.UserApiFeign;
import com.emin.platform.smw.util.TokenThreadLocalUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

/**
 * 登录控制层
 * 
 * @author 李丹
 *
 */
@Controller
public class LoginController extends HeaderCommonController {

	private static final String VALIDATE_TYPE = "commonImage";
	private static final String LOGIN_TYPE = "tryMatcherAll";

	@Autowired
	UserApiFeign userApiFeign; // 用户管理api
	@Autowired
	AuthApiFeign authApiFeign;

	public static final String LOGIN_PATH = "/login";

	/**
	 * 登录页面跳转
	 * 
	 * @param keyword
	 * @param ecmId
	 * @return
	 */
	@RequestMapping(LOGIN_PATH)
	@ResponseBody
	@IgnoreIterceptor
	public ModelAndView goManage(String keyword, Long ecmId) {
		return new ModelAndView("modules/login/manage");
	}

	/**
	 * 获取登录验证码
	 * 
	 * @return
	 */
	@GetMapping("/getValidImg")
	@ResponseBody
	@IgnoreIterceptor
	public byte[] getImg(String sequence, int width, int height,String fontName) {
		JSONObject extend = new JSONObject();
		Long expire = 60 * 1000 * 2L;
		extend.put("height", height);
		extend.put("width", width);
		extend.put("fontName", fontName);
		return authApiFeign.getValidateCode(VALIDATE_TYPE, sequence, expire, 100, extend.toJSONString());
	}

	/**
	 * 登入
	 * 
	 * @param username 用户名
	 * @param password 密码
	 * @param code 验证码
	 * @return
	 */
	@RequestMapping("/loginIn")
	@ResponseBody
	@IgnoreIterceptor
	public JSONObject login(String username, String password, String code, String sequence) {
		JSONObject validateResult = authApiFeign.check(VALIDATE_TYPE, sequence, code, null);
		this.dealException(validateResult);
		//获取token
		JSONObject params = new JSONObject();
		params.put("info", username);
		params.put("password", password);
		ResponseEntity<JSONObject> tokenResult = authApiFeign.login(JSON.toJSONString(params), LOGIN_TYPE);
		JSONObject tokenBody = tokenResult.getBody();
		this.dealException(tokenBody);
		String authorization = tokenResult.getHeaders().getFirst(ApplicationConstain.AUTHORIZATION_KEY);
		//默认一个月
		CookieUtil.addCookie(this.getResponse(), ApplicationConstain.AUTHORIZATION_KEY, authorization, 60 * 60 * 24 * 7 * 4);
		TokenThreadLocalUtil.setToken(authorization);
		
		return tokenBody;
	}

	/**
	 * 登出
	 * 
	 * @param
	 * @return
	 */
	@RequestMapping("/logout")
	@ResponseBody
	public JSONObject logout() {
		JSONObject res = new JSONObject();
		res.put("code", "ok");
		res.put("success",true);
		res.put(ApplicationConstain.RESULT_STRING, true);
		this.getRequest().getSession().invalidate();
		CookieUtil.delCookie(this.getResponse(), ApplicationConstain.AUTHORIZATION_KEY);
		return res;
	}

	/**
	 * 验证用户是否登录
	 *
	 * @param token
	 * @return
	 */
	@RequestMapping("/userValidate")
	@ResponseBody
	public JSONObject userValidate(String token) {
		JSONObject res = new JSONObject();
		res.put("code", "ok");
		res.put("success",true);
		res.put(ApplicationConstain.RESULT_STRING, true);
		return res;
	}
}