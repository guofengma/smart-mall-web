package com.emin.platform.smw.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSONObject;
import com.emin.platform.smw.interfaces.RepairGroupApiFeign;
import com.emin.platform.smw.util.UserClaim;

@Controller
@RequestMapping("/repair-group")
public class RepairGroupController extends HeaderCommonController {
	@Autowired
	RepairGroupApiFeign repairGroupApiFeign;
	
	/**
	 * 查询班组列表
	 * @param teamName 运维班组名称
	 * @param keyMapParam 其余查询条件，数据类型为字符串，类似于{"systemCode":"door"}形式
	 * @param sort 排序字段
	 * @param order 排序
	 */
	@GetMapping("/getTeamList")
	@ResponseBody
	public JSONObject getTeamList(String teamName, String keyMapParam, String sort, String order) {
		Integer page = getPageRequestData().getCurrentPage();
		Integer limit = getPageRequestData().getLimit();
		JSONObject res = repairGroupApiFeign.getTeamList(teamName, keyMapParam, page, limit, sort, order);
		this.dealException(res);
		return res;
	}
	/**
	 * 班组的待选用户
	 * @param teamId 班组id
	 * @param opUserId 当前操作人的id
	 * @param flock 权限对应的id
	 */
	@GetMapping("/choiceTeamMember")
	@ResponseBody
	public JSONObject choiceTeamMember(Long teamId, String flock, String name) {
		
		JSONObject res;
		res = repairGroupApiFeign.choiceTeamMember(teamId, name,flock);
		this.dealException(res);
		return res;
	}
	/**
	 * 批量移除班组成员
	 * @param teamId 班组id
	 * @param userId 当前操作人的id
	 * @param userIds 被移除的成员的id
	 * @param dissolve 是否解散，true解散，false不解散
	 */
	@GetMapping("/delTeamMembers")
	@ResponseBody
	public JSONObject delTeamMembers(Long teamId, Long[] memberIds, Boolean dissolve) {
		UserClaim userClaim = this.validateAuthorizationToken();
		JSONObject res;
		Long userId = null;
        if (userClaim.getId() != null) {
        	userId = userClaim.getId();
        }
		res = repairGroupApiFeign.delTeamMembers(teamId, userId, memberIds, dissolve);
		this.dealException(res);
		return res;
	}
	
	/**
	 * 禁用和启用运维班组
	 * @param teamIds 班组id
	 * @param userId 当前操作人的id
	 * @param isforbidden 是否禁用，true禁用，false不禁用
	 */
	@GetMapping("/forbiddenGroup")
	@ResponseBody
	public JSONObject forbiddenGroup(Long[] teamIds, Boolean isforbidden) {
		UserClaim userClaim = this.validateAuthorizationToken();
		JSONObject res;
		Long userId = null;
        if (userClaim.getId() != null) {
        	userId = userClaim.getId();
        }
		res = repairGroupApiFeign.forbiddenGroup(teamIds, userId, isforbidden);
		this.dealException(res);
		return res;
	}
	
	/**
	 * 查询某个维修组人数
	 * @param teamId 班组id
	 */
	@GetMapping("/getTeamMemberCount")
	@ResponseBody
	public JSONObject getTeamMemberCount(Long teamId) {
        JSONObject res = repairGroupApiFeign.getTeamMemberCount(teamId);
        this.dealException(res);
		return res;
	}
	
	/**
	 * 查询班组成员列表
	 * @param teamId 班组id
	 * @param flockId 权限编码
	 * @param keyWord 其余模糊查询条件，用户名或者电话
	 * @param sort 排序字段
	 * @param order 排序
	 */
	@GetMapping("/getTeamMemberList")
	@ResponseBody
	public JSONObject getTeamMemberList(Long teamId, String sort, String order, String flockId,String keyword) {
		Integer page = getPageRequestData().getCurrentPage();
		Integer limit = getPageRequestData().getLimit();
		JSONObject totalMembers = repairGroupApiFeign.getTeamMemberCount(teamId);
		this.dealException(totalMembers);
		JSONObject res = repairGroupApiFeign.getTeamMemberList(teamId, flockId, keyword, page, limit, sort, order);
		this.dealException(res);
		JSONObject result = res.getJSONObject("result");
		result.put("totalMembers", totalMembers.getString("result"));
		res.put("result", result);
		return res;
	}
	
	/**
	 * 编辑维修班组
	 * @param teamGroup 班组信息
	 * @param opUserId 当前操作人ID
	 */
	@PostMapping("/updateTeamGroup")
	@ResponseBody
	public JSONObject updateTeamGroup(String teamGroupDto) {
		UserClaim userClaim = this.validateAuthorizationToken();
		Long userId = null;
        if (userClaim.getId() != null) {
        	userId = userClaim.getId();
        }
		JSONObject res = repairGroupApiFeign.updateTeamGroup(teamGroupDto, userId);
		this.dealException(res);
		return res;
	}
	
	/**
	 * 新增班组
	 * @param teamGroupDto 班组信息
	 */
	@PostMapping("/saveTeamGroup")
	@ResponseBody
	public JSONObject saveTeamGroup(String teamGroupDto) {
		JSONObject obj = JSONObject.parseObject(teamGroupDto);
		UserClaim userClaim = this.validateAuthorizationToken();
		Long userId = null;
        if (userClaim.getId() != null) {
        	userId = userClaim.getId();
        }
        obj.put("creatUserId", userId);
		JSONObject res = repairGroupApiFeign.saveTeamGroup(obj.toJSONString());
		this.dealException(res);
		return res;
	}
	/**
	 * 新增班组成员
	 * @param teamId 班组id
	 * @param teamMemberDtos 新增成员信息信息
	 * @param opUserId 当前操作人ID
	 */
	@PostMapping("/saveTeamMember")
	@ResponseBody
	public JSONObject saveTeamMember(Long teamId, String teamMemberDtos) {
		UserClaim userClaim = this.validateAuthorizationToken();
		Long userId = null;
        if (userClaim.getId() != null) {
        	userId = userClaim.getId();
        }
		JSONObject res = repairGroupApiFeign.saveTeamMember(teamId, teamMemberDtos, userId);
		this.dealException(res);
		return res;
	}
	/**
	 * 查询管理员信息
	 * @param teamId 班组id
	 */
	@GetMapping("/getManager")
	@ResponseBody
	public JSONObject getManager(Long teamId) {
		JSONObject res = repairGroupApiFeign.getManager(teamId);
		this.dealException(res);
		return res;
	}
	/**
	 * 管理员权限转让
	 * @param teamId 班组id
	 * @param userId 被选中的组员的id，新管理员id
	 * @param opUserId 当前操作人（旧管理员）ID
	 */
	@GetMapping("/transferManager")
	@ResponseBody
	public JSONObject transferManager(Long teamId, Long memberId) {
		UserClaim userClaim = this.validateAuthorizationToken();
		Long userId = null;
        if (userClaim.getId() != null) {
        	userId = userClaim.getId();
        }
		JSONObject res = repairGroupApiFeign.transferManager(teamId, memberId, userId);
		this.dealException(res);
		return res;
	}
	/**
	 * 重新设置组长
	 * @param teamId 班组id
	 * @param userId 被选中的组员的id
	 * @param opUserId 当前操作人ID
	 * 
	 */
	@GetMapping("/resetTeamLeader")
	@ResponseBody
	public JSONObject resetTeamLeader(Long teamId, Long memberId) {
		UserClaim userClaim = this.validateAuthorizationToken();
		Long userId = null;
        if (userClaim.getId() != null) {
        	userId = userClaim.getId();
        }
		JSONObject res = repairGroupApiFeign.resetTeamLeader(teamId, memberId, userId);
		this.dealException(res);
		return res;
	}
	
	/**
	 * 删除维修班组
	 * @param teamId 班组id
	 * @param opUserId 当前操作人ID
	 */
	@GetMapping("/delTeamGroup")
	@ResponseBody
	public JSONObject delTeamGroup(Long teamId) {
		UserClaim userClaim = this.validateAuthorizationToken();
		Long userId = null;
        if (userClaim.getId() != null) {
        	userId = userClaim.getId();
        }
		JSONObject res = repairGroupApiFeign.delTeamGroup(teamId, userId);
		this.dealException(res);
		return res;
	}
	/**
	 * 查询运维班组的角色
	 */
	@GetMapping("/groupFlocks")
	@ResponseBody
	public JSONObject groupFlocks() {
		JSONObject res = repairGroupApiFeign.groupFlocks();
		this.dealException(res);
		return res;
	}
}