package com.emin.platform.smw.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.emin.platform.smw.constain.ApplicationConstain;
import com.emin.platform.smw.interfaces.CommandTemplateApiFeign;
import com.emin.platform.smw.interfaces.DeviceApiFeign;
import com.emin.platform.smw.interfaces.FloorApiFeign;
import com.emin.platform.smw.interfaces.SubSysPatternApiFeign;

@Controller
@RequestMapping("/run-setting")
public class RunSettingController extends HeaderCommonController {

	@Autowired
	FloorApiFeign floorApiFeign;
	@Autowired
	DeviceApiFeign deviceApiFeign;
	@Autowired
	SubSysPatternApiFeign subSysPatternApiFeign;
	@Autowired
	CommandTemplateApiFeign commandTemplateApiFeign;

	/**
	 * 根据子系统的code查询楼层及版本号 
	 * @param subsystemCode 子系统code
	 * @return
	 */
	@RequestMapping("/getVersionCodeByFloor")
	@ResponseBody
	public JSONObject getfloorAndversion(String subsystemCode) {
		JSONObject res;
		JSONObject versions;
		JSONArray floors;
		JSONArray tempList;
		JSONObject commandTemplates;
		JSONObject floor;
		JSONObject version;
		Long floorId;
		res = floorApiFeign.list();
		this.dealException(res);
		floors = res.getJSONArray(ApplicationConstain.RESULT_STRING);
		for(int i = 0; i < floors.size(); i++) {
			floor = floors.getJSONObject(i);
			floorId = floor.getLong("id");
			versions = deviceApiFeign.getVersionCodeByFloor(floorId, subsystemCode);
			this.dealException(versions);
			tempList = versions.getJSONArray(ApplicationConstain.RESULT_STRING);
			for(int j = 0; j < tempList.size(); j++) {
				version = tempList.getJSONObject(j);
				commandTemplates = commandTemplateApiFeign.findCommandModuleByVersion(version.getString("versionCode"), null, null);
				this.dealException(versions);
				version.put("commandTemplates", commandTemplates.getJSONArray(ApplicationConstain.RESULT_STRING));
			}
			floor.put("versions", tempList);
		}
		res.put(ApplicationConstain.RESULT_STRING, floors);
		return res;
	}
	/**
	 * 查询某个子系统的所有模式
	 * @param subsystemCode 子系统code
	 * @param mallId 商场id
	 */
	@RequestMapping("/querySysPatterns")
	@ResponseBody
	public JSONObject querySysPatterns(String subsystemCode,Long mallId) {
		JSONObject res = subSysPatternApiFeign.querySysPatterns(subsystemCode, mallId);
		this.dealException(res);
		return res;
	}
	
	/**
	 * 保存子系统模式
	 * @param subsystemPatternDetailList 选中模模式数据明细
	 * @param subsystemPatternStr 模式中的其他数据，如名字、id
	 */
	@RequestMapping("/save")
	@ResponseBody
	public JSONObject save(String subsystemPatternStr) {
		JSONArray subsystemPatternDetailList;
		JSONObject obj = JSONObject.parseObject(subsystemPatternStr);
		subsystemPatternDetailList = obj.getJSONArray("list");
		obj.remove("list");
		JSONObject res = subSysPatternApiFeign.saveSubsystempattern(subsystemPatternDetailList.toJSONString(), obj.toJSONString());
		this.dealException(res);
		return res;
	}

	/**
	 * 查询模式详情
	 * @param id 子系统模式id
	 * @return
	 */
	@RequestMapping("/detail")
	@ResponseBody
	public JSONObject detail(Long id) {
		JSONObject res = subSysPatternApiFeign.patternDetail(id);
		this.dealException(res);
		return res;
	}
	
	/**
	 * 删除模式
	 * @param id 子系统模式id
	 * @return
	 */
	@RequestMapping("/remove")
	@ResponseBody
	public JSONObject delete(Long id) {
		JSONObject res = subSysPatternApiFeign.patternDelete(id);
		this.dealException(res);
		return res;
	}

}

