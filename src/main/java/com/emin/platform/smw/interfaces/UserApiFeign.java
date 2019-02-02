package com.emin.platform.smw.interfaces;

import com.alibaba.fastjson.JSONObject;
import com.emin.platform.smw.constain.ApplicationConstain;

import org.springframework.cloud.netflix.feign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;


@FeignClient(value = ApplicationConstain.ZUUL_SERVICE)
public interface UserApiFeign {
	
	/**
	 * 用户列表
	 * @param keyword 查询关键字
	 * @param flockId 角色id
	 * @param isFilterAdmin 是否显示admin false：显示 true：不显示
	 * @param isFilterSuperAadmin 是否显示superadmin false：显示 true：不显示
	 */
	@RequestMapping(value = "/api-smart-mall-user/user/list",method = RequestMethod.GET)
	JSONObject userList(
			@RequestParam(value="keyword") String keyword,
			@RequestParam(value="flockId") Long flockId,
			@RequestParam(value="page") Integer page,
			@RequestParam(value="limit") Integer limit,
			@RequestParam(value="isFilterAdmin") Boolean isFilterAdmin,
			@RequestParam(value="isFilterSuperAadmin") Boolean isFilterSuperAadmin);
	
	/**
	 * 用户详情
	 * @param id 被查询的用户id
	 */
	@RequestMapping(value = "/api-smart-mall-user/user/queryDetail",method = RequestMethod.GET)
	JSONObject detail(
			@RequestParam(value="id") Long id);
	
	
	/**
	 *添加用户
	 * @param realName 用户姓名
	 * @param mobile 用户手机号码
	 * @param personFlocks 用户角色
	 */
	@RequestMapping(value = "/api-smart-mall-user/user/add",method = RequestMethod.POST)
	JSONObject addUser(
			@RequestParam(value="realName") String realName,
			@RequestParam(value="mobile") String mobile,
			@RequestParam(value="personFlocks") Long[] personFlocks);
	/**
	 *编辑用户
	 * @param id 用户id
	 * @param realName 用户姓名
	 * @param mobile 用户手机号码
	 * @param personFlocks 用户角色
	 */
	@RequestMapping(value = "/api-smart-mall-user/user/perfect",method = RequestMethod.POST)
	JSONObject editUser(
			@RequestParam(value="id") Long id,
			@RequestParam(value="realName") String realName,
			@RequestParam(value="mobile") String mobile,
			@RequestParam(value="personFlocks") Long[] personFlocks);
	
	/**
	 *禁用或者启用
	 * @param id 被编辑的用户id
	 * @param status 状态 false:禁用， true：启用
	 */
	@RequestMapping(value = "/api-smart-mall-user/user/status",method = RequestMethod.POST)
	JSONObject userStatus(
			@RequestParam(value="id") String ids,
			@RequestParam(value="status") Boolean status);
	
	/**
	 *删除用户
	 * @param id 用户id
	 */
	@RequestMapping(value = "/api-smart-mall-user/user/delete",method = RequestMethod.POST)
	JSONObject delete(
			@RequestParam(value="id") String id);
	/**
	 *查询权限组
	 * @param keyword 查询字段
	 * @param ecmId 主体Id
	 */
	@RequestMapping(value = "/api-smart-mall-user/flock/getPagePG",method = RequestMethod.GET)
	JSONObject getFlocks(
			@RequestParam(value="keyword") String keyword,
			@RequestParam(value="ecmId") String ecmId,
			@RequestParam(value="page") Integer page,
			@RequestParam(value="limit") Integer limit);
	/**
	 *根据id查询用户角色
	 * @param personId 用户id
	 */
	@GetMapping(value =  "/api-smart-mall-user/user/queryFlocksByPersonId")
    JSONObject getUserFlocks(@RequestParam("personId") Long userId);
	
	/**
	 *修改用户密码
	 * @param id 用户id
	 * @param oldPassword 旧密码
	 * @param newPassword 新密码
	 */
	@RequestMapping(value = "/api-smart-mall-user/user/modifyPassword",method = RequestMethod.POST)
	JSONObject modifyPassword(
			@RequestParam(value="id") Long id,
			@RequestParam(value="oldPassword") String oldPassword,
			@RequestParam(value="newPassword") String newPassword);
	/**
	 *	根据用户Id重置密码
	 * @param id 用户id
	 * @param newPassword 新密码
	 */
	@RequestMapping(value = "/api-smart-mall-user/user/resetPasswd/id/{id}",method = RequestMethod.POST,headers = {"Authorization=emin.smart.mall.super.token"})
	JSONObject resetPasswdById(
			@PathVariable(value="id") Long id,
			@RequestParam(value="newPassword") String newPassword);
	/**
	 *	根据用户手机号重置密码
	 * @param mobile 用户手机号码
	 * @param newPassword 新密码
	 */
	@RequestMapping(value = "/api-smart-mall-user/user/resetPasswd/mobile/{mobile}",method = RequestMethod.POST,headers = {"Authorization=emin.smart.mall.super.token"})
	JSONObject resetPasswdByMobile(
			@PathVariable(value="mobile") String mobile,
			@RequestParam(value="newPassword") String newPassword);
	
	/**
	 *	通过手机号查找当前用户基本信息(包括禁用，删除也会返回当前数据)
	 * @param mobile 用户手机号
	 */
	@RequestMapping(value = "/api-smart-mall-user/user/findPersonByMobile",method = RequestMethod.GET, headers = {"Authorization=emin.smart.mall.super.token"})
	JSONObject findPersonByMobile(
			@RequestParam(value="mobile") String mobile);
	
	/**
	 *	给手机号发送短信
	 * @param channelCode 管道
	 * @param mobile 用户手机号
	 */
	@RequestMapping(value = "/api-common-service/sms/send",method = RequestMethod.POST, headers = {"Authorization=emin.smart.mall.super.token"})
	JSONObject sendSms(
			@RequestParam(value="channelCode") String channelCode,
			@RequestParam(value="content") String content,
			@RequestParam(value="phones") String[] phones);
	
}
