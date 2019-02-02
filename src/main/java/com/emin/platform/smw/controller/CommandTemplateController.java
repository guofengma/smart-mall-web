package com.emin.platform.smw.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.emin.platform.smw.constain.ApplicationConstain;
import com.emin.platform.smw.interfaces.CentralConApiFeign;
import com.emin.platform.smw.interfaces.CommandTemplateApiFeign;
@Controller
@RequestMapping("/commandTemplate")
public class CommandTemplateController extends HeaderCommonController {

	@Autowired
	CommandTemplateApiFeign commandTemplateApiFeign;
	@Autowired
	CentralConApiFeign centralConApiFeign;

	/**
	 * 查询版本号下的命令模板
	 * @param versionCode 版本号code
	 * @param mallId 商场id
	 */
	@RequestMapping("/findCommandModuleByVersion")
	@ResponseBody
	public JSONObject findCommandModuleByVersion(String versionCode,Long mallId, String keyword) {
		JSONObject res = commandTemplateApiFeign.findCommandModuleByVersion(versionCode, mallId, keyword);
		this.dealException(res);
		return res;
	}
	
	/**
	 * 保存命令模板
	 * @param commandModuleDetailList 命令模板参数明细
	 * @param commandModuleStr 命令模板JSON字符串
	 */
	@RequestMapping("/save")
	@ResponseBody
	public JSONObject save(String commandModuleStr) {
		JSONObject res;
		JSONArray commandModuleDetailList;
		JSONObject obj = JSONObject.parseObject(commandModuleStr);
		commandModuleDetailList = obj.getJSONArray("list");
		obj.remove("list");
		res = commandTemplateApiFeign.save(commandModuleDetailList.toJSONString(), obj.toJSONString());
		this.dealException(res);
		return res;
	}
	
	/**
	 * 根据id查询命令模板
	 * @param id 命令模板id
	 */
	@RequestMapping("/detail")
	@ResponseBody
	public JSONObject detail(Long id) {
		JSONObject res = commandTemplateApiFeign.detail(id);
		this.dealException(res);
		return res;
	}
	
	/**
	 * 根据id删除命令模板
	 * @param id 命令模板id
	 */
	@RequestMapping("/remove")
	@ResponseBody
	public JSONObject delete(Long id) {
		JSONObject res = commandTemplateApiFeign.delete(id);
		this.dealException(res);
		return res;
	}
	
	/**
	 * 根据子系统查询命令模板
	 * @param subsystemCode 子系统code
	 */
	@RequestMapping("/findCommandModuleBySystemCode")
	@ResponseBody
	public JSONObject findCommandModuleBySystemCode(String subsystemCode, Long mallId, String keyword) {
		JSONObject res;
		JSONArray brands;
		JSONArray childSystems;
		JSONArray versions;
		JSONObject version;
		JSONObject commandTemplate;
		
		res = centralConApiFeign.queryAllSystem(subsystemCode);
		this.dealException(res);
		res = res.getJSONArray(ApplicationConstain.RESULT_STRING).getJSONObject(0);
		brands = res.getJSONArray("brands");
		for(int i = 0; i < brands.size(); i++) {
			childSystems = brands.getJSONObject(i).getJSONArray("childSystems");
			for(int j = 0; j < childSystems.size(); j++) {
				versions = childSystems.getJSONObject(j).getJSONArray("versions");
				for(int k = 0; k < versions.size(); k++) {
					version = versions.getJSONObject(k);
					commandTemplate = commandTemplateApiFeign.findCommandModuleByVersion(version.getString("vCode"), mallId, keyword);
					this.dealException(commandTemplate);
					version.put("commandTemplate", commandTemplate.getJSONArray(ApplicationConstain.RESULT_STRING));
				}
			}
		}
		res.put("success", true);
		return res;
	}
	
}
