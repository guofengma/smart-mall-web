package com.emin.platform.smw.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.emin.platform.smw.constain.ApplicationConstain;
import com.emin.platform.smw.filter.MenuOperationFilter;
import com.emin.platform.smw.interfaces.AreaApiFeign;
import com.emin.platform.smw.interfaces.FloorApiFeign;
import com.emin.platform.smw.util.UserClaim;

@Controller
@RequestMapping("/floor")
public class FloorController extends HeaderCommonController {
	
	@Value("${spring.application.code}")
	private String appCode;

	@Autowired
	MenuOperationFilter menuOperationFilter;

	@Autowired
	FloorApiFeign floorApiFeign;

	@Autowired
	AreaApiFeign areaApiFeign;


	@RequestMapping("/list")
	@ResponseBody
	public JSONObject list() {
		JSONObject res = areaApiFeign.list(null);
		this.dealException(res);
		JSONArray areas = res.getJSONArray(ApplicationConstain.RESULT_STRING);
		if (areas != null && !areas.isEmpty()) {
			for (int i = 0; i < areas.size(); i++) {
				JSONObject area = areas.getJSONObject(i);
				res = areaApiFeign.getFloors(area.getLong("id"));
				this.dealException(res);
				area.put("floors", res.getJSONArray(ApplicationConstain.RESULT_STRING));
			}
		}
		res.put(ApplicationConstain.RESULT_STRING, areas);
		return res;
	}
	
	@RequestMapping("/save")
	@ResponseBody
	public JSONObject save(String data) {
		JSONObject res = areaApiFeign.saveFloor(data);

		this.dealException(res);
		return res;
	}
	
	@RequestMapping("/detail")
	@ResponseBody
	public JSONObject detail(Long id) {
		JSONObject res = floorApiFeign.detail(id);
		this.dealException(res);
		return res;
	}

	@RequestMapping("/remove")
	@ResponseBody
	public JSONObject remove(Long id) {
		JSONObject res = floorApiFeign.remove(id);
		this.dealException(res);
		return res;
	}
	
	@RequestMapping("/getPlanGraph")
	@ResponseBody
	public JSONObject getPlanGraph(Long floorId, Long areaId) {
        UserClaim userClaim = this.validateAuthorizationToken();
		Long mallId = userClaim.getMallId();
		JSONObject res = areaApiFeign.getVerticalView(mallId, areaId, floorId);
		this.dealException(res);
		return res;
	}
	
	@RequestMapping("/savePlanGraph")
	@ResponseBody
	public JSONObject savePlanGraph(String data) {
		JSONObject res = areaApiFeign.saveVerticalView(data);
		this.dealException(res);
		return res;
	}
	

}