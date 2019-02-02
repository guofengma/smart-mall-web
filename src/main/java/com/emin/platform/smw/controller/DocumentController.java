package com.emin.platform.smw.controller;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.emin.base.exception.EminException;
import com.emin.platform.smw.config.FileTypeConfig.FileResourceType;
import com.emin.platform.smw.constain.ApplicationConstain;
import com.emin.platform.smw.filter.MenuOperationFilter;

import com.emin.platform.smw.interfaces.DocumentApiFeign;
import com.emin.platform.smw.interfaces.TagApiFeign;
import com.emin.platform.smw.util.UserClaim;


@Controller
@RequestMapping("/document")
public class DocumentController extends HeaderCommonController {
	private static final Logger LOGGER = Logger.getLogger(UserController.class);
	@Value("${spring.application.code}")
	private String appCode;

	@Autowired
	MenuOperationFilter menuOperationFilter;
	
	@Autowired
	FileResourceType fileResourceType;

	@Autowired
	DocumentApiFeign documentApiFeign;
	@Autowired
	TagApiFeign tagApiFeign;

	@RequestMapping("/index")
	public ModelAndView index() {
		ModelAndView mv = new ModelAndView("modules/document/manage");
		JSONObject res = new JSONObject();
		UserClaim userClaim = this.validateAuthorizationToken();
		try {
			res = documentApiFeign.root();
		} catch (Exception e) {
			LOGGER.error("加载用户管理主页时报错！错误信息->" + e.getMessage());
		}

		if (!res.isEmpty()) {
			if (!res.getBooleanValue("success")) {
				throw new EminException(res.getString("code"));
			}
			mv.addObject("root", res.getJSONObject(ApplicationConstain.RESULT_STRING));
		}
		try {
			JSONObject params = new JSONObject();
			params.putIfAbsent("userId", userClaim.getId());
			String operationCodes = menuOperationFilter.menuOperations("document", params);
			mv.addObject("operationCodes", operationCodes);
		} catch (Exception e) {
			LOGGER.error("文档库管理界面跳转，加载权限出现异常->" + e.getMessage());
		}

		return mv;
	}

	/**
	 * 文件列表查询
	 * @param paramsStr 查询参数,json格式的字符串
	 * @param sort 按照某个属性进行排序,多个属性按照’,’英文逗号隔开,同理与order属性一起
	 * @param order 按照什么类型排序,可选值:asc(默认,升序),desc(降序),多个属性按照’,’英文逗号隔开,同理与sort属性一起,多个属性则有多个排序值
	 * @param flockId 角色id
	 */
	@RequestMapping("/getPage")
	@ResponseBody
	public JSONObject getPage(String name, String order, Long pid, Boolean isContainSelf,Long nodeType, Integer nodeDomain) {
		JSONObject res;
		JSONObject paramsStr = new JSONObject();
		String order_o = order;
		Integer page = getPageRequestData().getCurrentPage();
		Integer limit = getPageRequestData().getLimit();
		if(order == null){
			order = "desc";
		}
		order = "asc," + order;
		paramsStr.put("name", name);
		if(pid!=null){
			paramsStr.put("pid", pid);
		}
		if(nodeType!=null){
			paramsStr.put("nodeType", nodeType);
		}
		paramsStr.put("nodeDomain", nodeDomain);
		res = documentApiFeign.querypage(paramsStr.toJSONString(), "nodeType,lastModifyTime", order, page, limit);
		if (!res.getBooleanValue("success")) {
			throw new EminException(res.getString("code"));
		}
		JSONObject result = res.getJSONObject(ApplicationConstain.RESULT_STRING);
		
		if(result!=null){
			JSONArray array = result.getJSONArray("resultList");
			int size = array.size();
			for (int i = 0; i < size; i++) {
				JSONObject entity = array.getJSONObject(i);
				if(!entity.containsKey("fileType")){
					continue;
				}
				String fileType = entity.getOrDefault("fileType","obj").toString();
				String viewFileType = fileResourceType.get(fileType);
				entity.put("viewFileType",viewFileType );
				array.set(i, entity);
			}
			result.put("resultList", array);
			res.put(ApplicationConstain.RESULT_STRING, result);
		}
		if(isContainSelf == null) {
			isContainSelf = true;
		}
		if(pid==null){
			JSONObject root = documentApiFeign.root();
			if (!root.getBooleanValue("success")) {
				throw new EminException(root.getString("code"));
			}
			root = root.getJSONObject(ApplicationConstain.RESULT_STRING);
			pid=root.getLong("id");
		}
		JSONObject path = documentApiFeign.path(pid.intValue(), isContainSelf);
		if (!res.getBooleanValue("success")) {
			throw new EminException(res.getString("code"));
		}
		res.put("path", path.getJSONArray(ApplicationConstain.RESULT_STRING));
		res.put("name", name);
		res.put("order",order_o);
		return res;
	}
	

	/**
	 * 新建或者编辑文件夹
	 * @param id 文件夹的id
	 * @param name 文件夹的名称
	 * @param pid 父节点id
	 * @patam createUserId 创建人的id
	 * @patam createUserName 创建人的名称
	 * @patam businessStatus 业务状态,默认0
	 * @patam jurisdiction 前节点权限(公开:0,授权:1,私有:2)
	 * @patam viewStatus 视图状态,默认0
	 * @patam index 用于排序
	 */
	@RequestMapping("/folderCreateOrUpdate")
	@ResponseBody
	public JSONObject folderCreateOrUpdate(Long id,String name,Long pid,Long businessStatus,Long jurisdiction,Long viewStatus,Long index) {
		JSONObject res;
		JSONObject dirDto = new JSONObject();
		UserClaim userClaim = this.validateAuthorizationToken();
		if(id == null){
			dirDto.put("operationUserId", userClaim.getId());
			dirDto.put("operationUserName", userClaim.getRealName());
		}
		dirDto.put("id", id);
		dirDto.put("name", name);
		dirDto.put("pid", pid);
		dirDto.put("businessStatus", businessStatus);
		dirDto.put("jurisdiction", jurisdiction);
		dirDto.put("viewStatus", viewStatus);
		dirDto.put("index", index);
		res = documentApiFeign.folderCreateOrUpdate(dirDto.toJSONString());
		if (!res.getBooleanValue("success")) {
			throw new EminException(res.getString("code"));
		}
			
		return res;
	}


	/**
	 * 新建或者编辑文件夹
	 * @param id 文件夹的id
	 * @param name 文件夹的名称
	 * @param pid 父节点id
	 * @patam createUserId 创建人的id
	 * @patam createUserName 创建人的名称
	 * @patam businessStatus 业务状态,默认0
	 * @patam jurisdiction 前节点权限(公开:0,授权:1,私有:2)
	 * @patam viewStatus 视图状态,默认0
	 * @patam index 用于排序
	 * @patam fileId 文件存储id
	 * @patam fileStorageUrl 文件存储路径
	 * @patam destinationStorageHost 服务器ip
	 * @patam contentType
	 * @patam fileType 文件类型
	 */
	/*@RequestMapping("/fileCreateOrUpdate")
	@ResponseBody
	public JSONObject fileCreateOrUpdate(Long id, 
			String name,
			Long pid,
			Long businessStatus,
			Long jurisdiction,
			Long viewStatus,
			Long index, 
			String fileId,
			String fileStorageUrl,
			String destinationStorageHost,
			String contentType,
			String fileType,
			Long available) {
		JSONObject res;
		JSONObject fileDto = new JSONObject();
		UserClaim userClaim = this.validateAuthorizationToken();
		if(id == null) {
			fileDto.put("operationUserId", userClaim.getId());
			fileDto.put("operationUserName", userClaim.getRealName());
		}
		fileDto.put("id", id);
		fileDto.put("name", name);
		fileDto.put("pid", pid);
		fileDto.put("businessStatus", businessStatus);
		fileDto.put("jurisdiction", jurisdiction);
		fileDto.put("viewStatus", viewStatus);
		fileDto.put("index", index);
		fileDto.put("fileStoreId", fileId);
		fileDto.put("storePath", fileStorageUrl);
		fileDto.put("storeHost", destinationStorageHost);
		fileDto.put("contentType", contentType);
		fileDto.put("available", available);
		fileDto.put("fileType", fileType);
		res = documentApiFeign.fileCreateOrUpdate(fileDto.toJSONString());
		if (res == null || !res.getBooleanValue("success")) {
			throw new EminException(res == null? null : res.getString("code"));
		}
		return res;
	}*/
	@RequestMapping("/fileCreateOrUpdate")
	@ResponseBody
	public JSONObject fileCreateOrUpdate(String fileDto,String tagParams, String tagLibParams) {
		JSONObject res;
		JSONObject fileDtoObj = JSON.parseObject(fileDto);
		UserClaim userClaim = this.validateAuthorizationToken();
		if(fileDtoObj.getLong("id") == null) {
			fileDtoObj.put("operationUserId", userClaim.getId());
			fileDtoObj.put("operationUserName", userClaim.getRealName());
		}
		res = documentApiFeign.fileCreateOrUpdate(fileDtoObj.toJSONString());
		this.dealException(res);
		
		if(tagParams != null) {
			Long id = res.getJSONObject(ApplicationConstain.RESULT_STRING).getLong("id");
			JSONArray tagParamsObj = JSON.parseArray(tagParams);
			for(int i=0; i < tagParamsObj.size(); i++) {
				JSONObject item = tagParamsObj.getJSONObject(i);
				item.put("resourceId", id);
			}
			JSONObject tagRes = documentApiFeign.fileAddTag(tagParamsObj.toJSONString());
			this.dealException(tagRes);
		}
		if( tagLibParams != null) {
			JSONObject tagLibRes = tagApiFeign.tagLibAddTags(tagLibParams);
			this.dealException(tagLibRes);
		}
		
		return res;
	}
	
	/**
	 * 根据id查询路径
	 * @param id 文件或者文件夹的id
	 * @param isContainSelf 当前路径是否包含自己节点：false:不包含， true：包含
	 */
	@RequestMapping("/path")
	@ResponseBody
	public JSONObject path(Integer id, Boolean isContainSelf) {
		if(isContainSelf == null) {
			isContainSelf = true;
		}
		JSONObject res = documentApiFeign.path(id, isContainSelf);
		this.dealException(res);
		return res;
	}
	
	/**
	 * 移动文件或者文件夹
	 * @param id 文件或者文件夹的id
	 * @param mvPid 新的父节点id
	 */
	@RequestMapping("/move")
	@ResponseBody
	public JSONObject move(Integer[] ids, Integer mvPid) {
		JSONObject res =  new JSONObject();
		if(ids == null) {
			res.put("success", false);
			res.put("message", "参数不完整");
		} else {
			for(int i = 0; i < ids.length; i++) {
				res = documentApiFeign.move(ids[i], mvPid);
				this.dealException(res);
			}
		}
		return res;
	}
	
	@RequestMapping("/remove")
	@ResponseBody
	public JSONObject remove(Integer[] ids) {
		JSONObject res = documentApiFeign.delete(ids);
		this.dealException(res);
		return res;
	}
	
	/**
	 * 根据id查询文件夹的详情
	 * @param id 文件夹id
	 */
	@RequestMapping("/folderDetail")
	@ResponseBody
	public JSONObject folderDetail(Long id) {
		JSONObject res = documentApiFeign.folderDetail(id);
		this.dealException(res);
		return res;
	}
	/**
	 * 验证某个文件下是否含有某些节点名,存在相同名返回true
	 * @param targetDirId 目标目录的id
	 * @param nodeNames
	 */
	@RequestMapping("/existNodeFirLvlName")
	@ResponseBody
	public JSONObject existNodeFirLvlName(Long targetDirId, String[] nodeNames) {
		JSONObject res = documentApiFeign.existNodeFirLvlName(targetDirId, nodeNames);
		this.dealException(res);
		return res;
	}
}
