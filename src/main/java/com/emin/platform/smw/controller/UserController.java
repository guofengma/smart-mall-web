package com.emin.platform.smw.controller;

import org.apache.commons.lang3.RandomStringUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.emin.base.exception.EminException;
import com.emin.platform.smw.constain.ApplicationConstain;
import com.emin.platform.smw.filter.MenuOperationFilter;
import com.emin.platform.smw.interfaces.CentralConApiFeign;
import com.emin.platform.smw.interfaces.RepairGroupApiFeign;
import com.emin.platform.smw.interfaces.UserApiFeign;
import com.emin.platform.smw.util.Md5Utils;
import com.emin.platform.smw.util.UserClaim;

@Controller
@RequestMapping("/user")
public class UserController extends HeaderCommonController {
	private static final Logger LOGGER = Logger.getLogger(UserController.class);
	@Value("${spring.application.code}")
	private String appCode;

	@Autowired
	MenuOperationFilter menuOperationFilter;

	@Autowired
	UserApiFeign userApiFeign;
	@Autowired
	RepairGroupApiFeign repairGroupApiFeign;
	
	@Autowired
	CentralConApiFeign centralConApiFeign;

	@Autowired
	RepairGroupApiFeign rgApiFeign;

	@RequestMapping("/index")
	public ModelAndView index(String subModule) {
		ModelAndView mv = new ModelAndView("modules/user/manage");
		if(subModule != null) {
			mv.addObject("subModule",subModule);
		}
		try {
			JSONObject params = new JSONObject();
			params.putIfAbsent("userId", this.validateAuthorizationToken().getId());
			String operationCodes = menuOperationFilter.menuOperations("top-user", params);
			mv.addObject("operationCodes", operationCodes);
		} catch (Exception e) {
			LOGGER.error("用户管理界面跳转，加载权限出现异常->" + e.getMessage());
		}
		return mv;
	}
	
	/**
	 * 获取员工管理界面及数据
	 * @return
	 */
	@RequestMapping("/staff")
	public ModelAndView staff(String keyword, Long flockId) {
		ModelAndView mv = new ModelAndView("modules/user/staff");
		JSONObject res = new JSONObject();
		UserClaim userClaim = this.validateAuthorizationToken();
		Long mallId = userClaim.getMallId();
		System.out.println(mallId);
		try {
			Integer page = getPageRequestData().getCurrentPage();
			Integer limit = getPageRequestData().getLimit();
			if (keyword != null) {
				mv.addObject("keyword", keyword);
			}
			if (flockId != null) {
				mv.addObject("flockId", flockId);
			}
			mv.addObject("limit", limit);
			mv.addObject("page", page);
			res = userApiFeign.userList(keyword, flockId, page, limit, true, true);
		} catch (Exception e) {
			LOGGER.error("加载员工管理页面时报错！错误信息->" + e.getMessage());
		}

		if (!res.isEmpty()) {
			if (!res.getBooleanValue("success")) {
				throw new EminException(res.getString("code"));
			}
			mv.addObject("pages", res.getJSONObject(ApplicationConstain.RESULT_STRING));
		}
		try {
			JSONObject params = new JSONObject();
			params.putIfAbsent("userId", this.validateAuthorizationToken().getId());
			String operationCodes = menuOperationFilter.menuOperations("top-user", params);
			mv.addObject("operationCodes", operationCodes);
		} catch (Exception e) {
			LOGGER.error("加载权限出现异常->" + e.getMessage());
		}
		mv.addObject("userType", userClaim.getUserType());
		return mv;
	}
	
	/**
	 * 获取员工管理界面及数据
	 * @return
	 */
	@RequestMapping("/repair-group")
	public ModelAndView repairGroup(String teamName,String keyMapParam, String sort,String order) {
		ModelAndView mv = new ModelAndView("modules/user/repair-group");
		JSONObject res = new JSONObject();
		UserClaim userClaim = this.validateAuthorizationToken();
		Long mallId = userClaim.getMallId();
		System.out.println(mallId);
		try {
			Integer page = getPageRequestData().getCurrentPage();
			Integer limit = getPageRequestData().getLimit();
			if (teamName != null) {
				mv.addObject("teamName", teamName);
			}
			if (keyMapParam != null) {
				mv.addObject("keyMapParam", keyMapParam);
			}
			mv.addObject("limit", limit);
			mv.addObject("page", page);
			res = repairGroupApiFeign.getTeamList(teamName, keyMapParam, page, limit, sort, order);
		} catch (Exception e) {
			LOGGER.error("加载维修班组管理页面时报错！错误信息->" + e.getMessage());
		}

		if (!res.isEmpty()) {
			if (!res.getBooleanValue("success")) {
				throw new EminException(res.getString("code"));
			}
			mv.addObject("pages", res.getJSONObject(ApplicationConstain.RESULT_STRING));
		}
		try {
			JSONObject params = new JSONObject();
			params.putIfAbsent("userId", userClaim.getId());
			String operationCodes = menuOperationFilter.menuOperations("top-user", params);
			mv.addObject("operationCodes", operationCodes);
			mv.addObject("userId",userClaim.getId());
		} catch (Exception e) {
			LOGGER.error("加载权限出现异常->" + e.getMessage());
		}

		return mv;
	}
	
	@RequestMapping("/list")
	public ModelAndView list(String keyword, Long flockId) {
		ModelAndView mv = new ModelAndView("modules/user/list");
		JSONObject res = new JSONObject();
		try {
			Integer page = getPageRequestData().getCurrentPage();
			Integer limit = getPageRequestData().getLimit();
			if (keyword != null) {
				mv.addObject("keyword", keyword);
			}
			if (flockId != null) {
				mv.addObject("flockId", flockId);
			}
			mv.addObject("limit", limit);
			mv.addObject("page", page);
			res = userApiFeign.userList(keyword, flockId, page, limit, true, true);
		} catch (Exception e) {
			LOGGER.error("加载用户管理主页时报错！错误信息->" + e.getMessage());
		}

		if (!res.isEmpty()) {
			if (!res.getBooleanValue("success")) {
				throw new EminException(res.getString("code"));
			}
			mv.addObject("pages", res.getJSONObject(ApplicationConstain.RESULT_STRING));
		}

		
		res = userApiFeign.getFlocks(null, null, null, 10000);
		if (!res.getBooleanValue("success")) {
			throw new EminException(res.getString("code"));
		}
		mv.addObject("flocks", res.getJSONObject(ApplicationConstain.RESULT_STRING).getJSONArray("resultList"));
		mv.addObject("user", this.validateAuthorizationToken());
		return mv;
	}

	@RequestMapping("/serviceList")
	public ModelAndView serviceList(String keyword, Long flockId, String code) {
		ModelAndView mv = new ModelAndView("modules/user/service-list");
		JSONObject res = new JSONObject();
		try {
			// Integer page = getPageRequestData().getCurrentPage();
			// Integer limit = getPageRequestData().getLimit();
			if (keyword != null) {
				mv.addObject("keyword", keyword);
			}
			if (flockId != null) {
				mv.addObject("flockId", flockId);
			}
			// mv.addObject("limit", limit);
			// mv.addObject("page", page);
			res = rgApiFeign.serviceList(this.validateAuthorizationToken().getId(), code, keyword, flockId == null ? null : flockId.toString());
			this.dealException(res);
			mv.addObject("pages", res.getJSONArray(ApplicationConstain.RESULT_STRING));

			
			res = rgApiFeign.groupFlocks();
			this.dealException(res);
			mv.addObject("flocks", res.getJSONArray(ApplicationConstain.RESULT_STRING));

			
			mv.addObject("user", this.validateAuthorizationToken());
		} catch (Exception e) {
			LOGGER.error("加载用户维修组列表页时报错！错误信息->" + e.getMessage());
		}

		return mv;
	}

	/**
	 * 分页查询
	 * @param keyword 查询字段
	 * @param orgId 组织结构的id
	 * @return
	 */
	@RequestMapping("/getPage")
	@ResponseBody
	public JSONObject getPage(Long flockId, String keyword) {
		JSONObject apiResponse;
		Integer page = getPageRequestData().getCurrentPage();
		Integer limit = getPageRequestData().getLimit();
		apiResponse = userApiFeign.userList(keyword, flockId, page, limit, true, true);
		if (!apiResponse.getBooleanValue("success")) {
			throw new EminException(apiResponse.getString("code"));
		}
		apiResponse = apiResponse.getJSONObject(ApplicationConstain.RESULT_STRING);
		return apiResponse;
	}

	/**
	 * 根据id查询详情
	 * @param id 工作人员id
	 * @return
	 */
	@RequestMapping("/detail")
	@ResponseBody
	public JSONObject detail(Long id) {
		JSONObject apiResponse = userApiFeign.detail(id);
		if (!apiResponse.getBooleanValue("success")) {
			throw new EminException(apiResponse.getString("code"));
		}
		apiResponse = apiResponse.getJSONObject(ApplicationConstain.RESULT_STRING);
		return apiResponse;
	}


	@RequestMapping("/save")
	@ResponseBody
	public JSONObject save(Long id, String realName, String mobile, Long[] personFlocks) {
		JSONObject res;
		if(id == null) { // 新增
			res = userApiFeign.addUser(realName, mobile, personFlocks);
		} else {
			res = userApiFeign.editUser(id, realName, mobile, personFlocks);
		}
		if (!res.getBooleanValue("success")) {
			throw new EminException(res.getString("code"));
		}
		return res;
	}

	@RequestMapping("/remove")
	@ResponseBody
	public JSONObject remove (String id) {
		JSONObject res;
		Long userId = Long.valueOf(id);
		
		res = userApiFeign.delete(id);
		this.dealException(res);
		return res;
	}

	/**
	 * 工作人员的启用与禁用
	 * @param id 工作人员id
	 * @param status 状态 true or false
	 * @return
	 */
	@RequestMapping("/changeStatus")
	@ResponseBody
	public JSONObject changeStatus(String id, Boolean status) {
		JSONObject res = userApiFeign.userStatus(id, status);
		if (!res.getBooleanValue("success")) {
			throw new EminException(res.getString("code"));
		}
		return res;
	}
	
	/**
	 * 根据id查询用户角色
	 * @param id 工作人员id
	 * @return
	 */
	@RequestMapping("/getFlocks")
	@ResponseBody
	public JSONArray getFlocks() {
		JSONObject res = userApiFeign.getFlocks(null, null, null, 10000);
		if (!res.getBooleanValue("success")) {
			throw new EminException(res.getString("code"));
		}
		JSONArray resArray = res.getJSONObject(ApplicationConstain.RESULT_STRING).getJSONArray("resultList");
		return resArray;
	}
	
	/**
	 *修改用户密码
	 * @param id 用户id
	 * @param oldPassword 旧密码
	 * @param newPassword 新密码
	 */
	@RequestMapping("/modifyPassword")
	@ResponseBody
	public JSONObject modifyPassword(String oldPassword, String newPassword) {
		UserClaim userClaim = this.validateAuthorizationToken();
		JSONObject res;
		Long userId = null;
        if (userClaim.getId() != null) {
        	userId = userClaim.getId();
        }
		res = userApiFeign.modifyPassword(userId, oldPassword, newPassword);
		this.dealException(res);
		return res;
	}
	
	/**
	 * 获取创建运维班组的界面
	 */
	@RequestMapping("/create-repair-group")
	public ModelAndView createRepairGroup() {
		ModelAndView mv = new ModelAndView("modules/user/create-form");
		JSONObject res;	
		try {
			res = centralConApiFeign.onlySystem();
			mv.addObject("subsystems", res.getJSONArray(ApplicationConstain.RESULT_STRING));
		} catch (Exception e) {
			LOGGER.error("加载子系统数据报错！错误信息->" + e.getMessage());
		}
		try {
			res = repairGroupApiFeign.groupFlocks();
			mv.addObject("flocks", res.getJSONArray(ApplicationConstain.RESULT_STRING));
		} catch (Exception e) {
			LOGGER.error("加载数据出现异常->" + e.getMessage());
		}
		return mv;
	}
	
	/**
	 * 维修班组成员列表的界面
	 * @param id 运维班组id
	 */
	@RequestMapping("/group-members")
	public ModelAndView groupMembers(Long id) {
		ModelAndView mv = new ModelAndView("modules/user/group-members");
		JSONObject res;
		UserClaim userClaim = this.validateAuthorizationToken();
		Long userId = null;
        if (userClaim.getId() != null) {
        	userId = userClaim.getId();
        }
		try {
			res = repairGroupApiFeign.groupFlocks();
			mv.addObject("flocks", res.getJSONArray(ApplicationConstain.RESULT_STRING));
		} catch (Exception e) {
			LOGGER.error("加载数据出现异常->" + e.getMessage());
		}
		try {
			res = repairGroupApiFeign.getManager(id);
			JSONObject manager = res.getJSONObject(ApplicationConstain.RESULT_STRING);
			
			
			if(manager.getLong("id") == userId) {
				mv.addObject("isManager", "true");
				manager.put("isManager", "true");
			} else {
				mv.addObject("isManager", "false");
				manager.put("isManager", "false");
			}
			mv.addObject("manager", manager);
		} catch (Exception e) {
			LOGGER.error("查询管理员出错" + e.getMessage());
		}
		try {
			res = repairGroupApiFeign.getLeader(id);
			mv.addObject("leader", res.getJSONObject(ApplicationConstain.RESULT_STRING));
		} catch (Exception e) {
			LOGGER.error("查询组长出错" + e.getMessage());
		}
		
		mv.addObject("id",id);
		return mv;
	}
	/**
	 * 返回添加组员的界面
	 * @param id 运维班组id
	 */
	@RequestMapping("/add-members")
	public ModelAndView addMembers(Long id) {
		ModelAndView mv = new ModelAndView("modules/user/choose-members");
		JSONObject res;
		try {
			res = repairGroupApiFeign.groupFlocks();
			mv.addObject("flocks", res.getJSONArray("result"));
		} catch (Exception e) {
			LOGGER.error("加载数据出现异常->" + e.getMessage());
		}
		mv.addObject("teamId",id);
		return mv;
	}
	
	/**
	 * 返回添加组员的界面
	 * @param id 运维班组id
	 */
	@RequestMapping("/edit-group")
	public ModelAndView editGroup(Long id) {
		ModelAndView mv = new ModelAndView("modules/user/basic");
		JSONObject res;
		try {
			res = centralConApiFeign.onlySystem();
			mv.addObject("subsystems", res.getJSONArray(ApplicationConstain.RESULT_STRING));
		} catch (Exception e) {
			LOGGER.error("加载子系统数据报错！错误信息->" + e.getMessage());
		}
		mv.addObject("id",id);
		return mv;
	}
	/**
	 *	根据用户Id重置密码
	 * @param id 用户id
	 * @param newPassword 新密码
	 */
	@RequestMapping("/reset-password")
	@ResponseBody
	public JSONObject resetPasswdById(Long id,String mobile) {
       
		String newPassword = RandomStringUtils.randomNumeric(6);
        String encodePassword = Md5Utils.encoderByMd5(newPassword);
       
		JSONObject res = userApiFeign.resetPasswdById(id, encodePassword);
		this.dealException(res);
		String content = "您的账户(" + mobile + ")重置密码成功，新的密码为" + newPassword;
		String[] phones = new String[]{mobile};
		JSONObject sendSms = userApiFeign.sendSms("clwh", content, phones);
		this.dealException(sendSms);
		return res;
	}

}
