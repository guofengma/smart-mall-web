package com.emin.platform.smw.interfaces;

import com.alibaba.fastjson.JSONObject;
import com.emin.platform.smw.constain.ApplicationConstain;
import org.springframework.cloud.netflix.feign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;


@FeignClient(value = ApplicationConstain.ZUUL_SERVICE)
public interface RepairGroupApiFeign {
	/**
	 * 查询运维班组的角色
	 */
	@RequestMapping(value = "/api-smart-mall-abnormal/teamGroup/flock",method = RequestMethod.GET)
	JSONObject groupFlocks();
	
	/**
	 * 查询班组列表
	 * @param teamName 运维班组名称
	 * @param keyMapParam 其余查询条件，数据类型为字符串，类似于{"systemCode":"door"}形式
	 * @param sort 排序字段
	 * @param order 排序
	 */
	@RequestMapping(value = "/api-smart-mall-abnormal/teamGroup/getTeamList",method = RequestMethod.GET)
	JSONObject getTeamList(
			@RequestParam(value="teamName") String teamName,
			@RequestParam(value="keyMapParam") String keyMapParam,
			@RequestParam(value="page") Integer page,
			@RequestParam(value="limit") Integer limit,
			@RequestParam(value="sort") String sort,
			@RequestParam(value="order") String order);
	
	/**
	 * 取消班组组长
	 * @param teamId 班组id
	 */
	@RequestMapping(value = "/api-smart-mall-abnormal/teamGroup/cancelTeamHeader",method = RequestMethod.GET)
	JSONObject cancelTeamLeader(
			@RequestParam(value="teamId") Long teamId);
	
	/**
	 * 班组的待选用户
	 * @param teamId 班组id
	 * @param name 查询字段
	 * @param flock 权限对应的id
	 */
	@RequestMapping(value = "/api-smart-mall-abnormal/teamGroup/choiceTeamMember",method = RequestMethod.GET)
	JSONObject choiceTeamMember(
			@RequestParam(value="teamId") Long teamId,
			@RequestParam(value="name") String name,
			@RequestParam(value="flock") String flock);
	
	/**
	 * 批量移除班组成员
	 * @param teamId 班组id
	 * @param opUserId 当前操作人的id
	 * @param userIds 被移除的成员的id
	 * @param dissolve 是否解散，true解散，false不解散
	 */
	@RequestMapping(value = "/api-smart-mall-abnormal/teamGroup/delTeamMember",method = RequestMethod.GET)
	JSONObject delTeamMembers(
			@RequestParam(value="teamId") Long teamId,
			@RequestParam(value="opUserId") Long opUserId,
			@RequestParam(value="userIds") Long[] memberIds,
			@RequestParam(value="dissolve") Boolean dissolve);
	
	/**
	 * 禁用和启用运维班组
	 * @param teamIds 班组id
	 * @param opUserId 当前操作人的id
	 * @param forbidden 是否禁用，true禁用，false不禁用
	 */
	@RequestMapping(value = "/api-smart-mall-abnormal/teamGroup/forbidden",method = RequestMethod.GET)
	JSONObject forbiddenGroup(
			@RequestParam(value="teamIds") Long[] teamIds,
			@RequestParam(value="opUserId") Long opUserId,
			@RequestParam(value="forbidden") Boolean forbidden);
	
	/**
	 * 查询某个维修组人数
	 * @param teamId 班组id
	 */
	@RequestMapping(value = "/api-smart-mall-abnormal/teamGroup/getTeamMemberCount",method = RequestMethod.GET)
	JSONObject getTeamMemberCount(
			@RequestParam(value="teamId") Long teamId);
	
	/**
	 * 查询班组成员列表
	 * @param teamId 班组id
	 * @param flockId 权限编码
	 * @param keyWord 其余模糊查询条件，用户名或者电话
	 * @param sort 排序字段
	 * @param order 排序
	 */
	@RequestMapping(value = "/api-smart-mall-abnormal/teamGroup/getTeamMemberList",method = RequestMethod.GET)
	JSONObject getTeamMemberList(
			@RequestParam(value="teamId") Long teamId,
			@RequestParam(value="flockId") String flockId,
			@RequestParam(value="keyWord") String keyword,
			@RequestParam(value="page") Integer page,
			@RequestParam(value="limit") Integer limit,
			@RequestParam(value="sort") String sort,
			@RequestParam(value="order") String order);
	
	/**
	 * 编辑维修班组
	 * @param teamGroupDto  班组信息
	 * @param opUserId 当前操作人ID
	 */
	@RequestMapping(value = "/api-smart-mall-abnormal/teamGroup/updateTeamGroup",method = RequestMethod.POST,consumes = MediaType.APPLICATION_JSON_UTF8_VALUE)
	JSONObject updateTeamGroup(
			@RequestBody String teamGroupDto,
			@RequestParam(value="opUserId") Long opUserId);
	
	/**
	 * 重新设置组长
	 * @param teamId 班组id
	 * @param userId 被选中的组员的id
	 * @param opUserId 当前操作人ID
	 * 
	 */
	@RequestMapping(value = "/api-smart-mall-abnormal/teamGroup/resetTeamHeader",method = RequestMethod.GET)
	JSONObject resetTeamLeader(
			@RequestParam(value="teamId") Long teamId,
			@RequestParam(value="userId") Long memberId,
			@RequestParam(value="opUserId") Long opUserId);
	
	/**
	 * 新增班组
	 * @param teamGroupDto 班组信息
	 */
	@RequestMapping(value = "/api-smart-mall-abnormal/teamGroup/saveTeamGroup",method = RequestMethod.POST,consumes = MediaType.APPLICATION_JSON_UTF8_VALUE)
	JSONObject saveTeamGroup(
			@RequestBody String teamGroupDto);
	
	/**
	 * 新增班组成员
	 * @param teamId 班组id
	 * @param teamMemberDtos 新增成员信息信息
	 * @param opUserId 当前操作人ID
	 */
	@RequestMapping(value = "/api-smart-mall-abnormal/teamGroup/saveTeamMember",method = RequestMethod.POST,consumes = MediaType.APPLICATION_JSON_UTF8_VALUE)
	JSONObject saveTeamMember(
			@RequestParam(value="teamId") Long teamId, 
			@RequestBody String teamMemberDtos,
			@RequestParam(value="opUserId") Long opUserId);
	
	/**
	 * 查询组长信息
	 * @param teamId 班组id
	 */
	@RequestMapping(value = "/api-smart-mall-abnormal/teamGroup/getHeader",method = RequestMethod.GET)
	JSONObject getLeader(
			@RequestParam(value="teamId") Long teamId);
	/**
	 * 查询管理员信息
	 * @param teamId 班组id
	 */
	@RequestMapping(value = "/api-smart-mall-abnormal/teamGroup/getManage",method = RequestMethod.GET)
	JSONObject getManager(
			@RequestParam(value="teamId") Long teamId);
	/**
	 * 管理员权限转让
	 * @param teamId 班组id
	 * @param userId 被选中的组员的id，新管理员id
	 * @param opUserId 当前操作人（旧管理员）ID
	 */
	@RequestMapping(value = "/api-smart-mall-abnormal/teamGroup/transfer",method = RequestMethod.GET)
	JSONObject transferManager(
			@RequestParam(value="teamId") Long teamId,
			@RequestParam(value="userId") Long memberId,
			@RequestParam(value="opUserId") Long opUserId);
	
	/**
	 * 删除维修班组
	 * @param teamId 班组id
	 * @param opUserId 当前操作人ID
	 */
	@RequestMapping(value = "/api-smart-mall-abnormal/teamGroup/delTeamGroup",method = RequestMethod.GET)
	JSONObject delTeamGroup(
			@RequestParam(value="teamId") Long teamId,
			@RequestParam(value="opUserId") Long opUserId);
	
	/**
	 * 查询用户是不是维修班组的管理员或者组长，如果是返回维修班组的信息
	 * @param userId 用户id
	 */
	@RequestMapping(value = "/api-smart-mall-abnormal/teamGroup/access",method = RequestMethod.GET)
	JSONObject access(
			@RequestParam(value="userId") Long userId);


	
	@RequestMapping(value = "/api-smart-mall-abnormal/teamGroup/getUserMate",method = RequestMethod.GET)
	JSONObject serviceList(@RequestParam(value="userId") Long userId,
			@RequestParam(value="systemCode") String systemCode,
			@RequestParam(value="keyWord") String keyWord,
			@RequestParam(value="flockId") String flockId);
}
