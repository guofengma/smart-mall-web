package com.emin.platform.smw.controller;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.emin.platform.smw.constain.ApplicationConstain;
import com.emin.platform.smw.interfaces.AreaApiFeign;
import com.emin.platform.smw.interfaces.DeviceApiFeign;
import com.emin.platform.smw.interfaces.DeviceExceptionApiFeign;
import com.emin.platform.smw.interfaces.FloorApiFeign;
import com.emin.platform.smw.interfaces.GroupDeviceApiFeign;
import com.emin.platform.smw.util.DateUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.servlet.ModelAndView;


public abstract class AbnormalCommon extends HeaderCommonController {
	private static final String R = ApplicationConstain.RESULT_STRING;
    @Autowired
	DeviceApiFeign deviceApiFeign;
	
	@Autowired
	DeviceExceptionApiFeign deApiFeign;

	@Autowired
	FloorApiFeign floorApiFeign;
	
	@Autowired
    AreaApiFeign areaApiFeign;

	@Autowired
	GroupDeviceApiFeign groupDeviceApiFeign;
    /**
     * 首页参数传递
     * @return 参数对象
     */
    protected JSONObject indexParams() {
        JSONObject res = new JSONObject();
		// 页码
		res.put("page", getParameterValue("page") == null ? null : Integer.parseInt((String)getParameterValue("page")));
		// 分页条数
		res.put("limit", getParameterValue("limit") == null ? null : Integer.parseInt((String) getParameterValue("limit")));
		// 排序字段
		res.put("sort", getParameterValue("sort") == null ? null : (String) getParameterValue("sort"));
		// 排序方式
		res.put("order",getParameterValue("order") == null ? null : (String) getParameterValue("order"));
		// 关键字
		res.put("keyword",getParameterValue("keyword") == null ? null : (String) getParameterValue("keyword"));
		// 系统码
		res.put("code",getParameterValue("code") == null ? null : (String) getParameterValue("code"));
		// 时间区间类型： today,yesterday,week
		res.put("rangeType",getParameterValue("rangeType") == null ? null : (String) getParameterValue("rangeType"));
		// 开始时间
		res.put("bt",getParameterValue("bt") == null ? null : Long.parseLong((String) getParameterValue("bt")));
		// 结束时间
		res.put("et",getParameterValue("et") == null ? null : Long.parseLong((String) getParameterValue("et")));
        // 类型
		res.put("type", getParameterValue("type") == null ? null : Integer.parseInt((String) getParameterValue("type")));
        // 数据状态
		res.put("hStat",getParameterValue("hStat") == null ? null : (String) getParameterValue("hStat"));
		// 阅读状态
		res.put("rStat",getParameterValue("rStat") == null ? null : Integer.parseInt((String) getParameterValue("rStat")));
        
		/**
		 * 字段之间依赖逻辑处理1： 当rangeType不为null的时候，应该在服务器后端计算开始时间和结束时间 
		 */
		String rangeType = res.getString("rangeType");
		//时间区间拼接字符串
		String timeRange = ""; 
		if (rangeType != null) {
			switch(rangeType) {
				case "today": 
					timeRange = DateUtil.rangeToday();
					break;
				case "yesterday":
					timeRange = DateUtil.rangeYesterday();
					break;
				case "week":
					timeRange = DateUtil.rangeWeek();
					break;
				default:
					break;
			}

			if (!timeRange.equals("") && timeRange.indexOf(",") > 0) {
				res.put("bt", Long.valueOf(timeRange.split(",")[0]));
				res.put("et", Long.valueOf(timeRange.split(",")[1]));
		
			}
        }
        
        /**
         * 操作人
         */
        res.put("user", this.validateAuthorizationToken());
		
		return res;
	}

	public JSONArray getSubSystem() {
		JSONObject res = deviceApiFeign.subSystems(null);
		this.dealException(res);
		return res.getJSONArray(R);
	}

	//** common methods below **//
    /**
	 * 如果已读状态为空或者为0（表示未读）,则设置已读
	 */ 
	public void readException(Long id, Integer rStat) {
		if (rStat == null || rStat == 0) {
			Long[] ids = new Long[]{id};
			JSONObject res = deApiFeign.changeStatus(ids, 200);
			this.dealException(res);
		}
	}

	/**
	 * 界面加载设备关联：设备详情、楼层、区域、平面图等
	 * @param deviceId 设备编号
	 * @param mv 界面
	 * @return 界面
	 */
	public ModelAndView deviceRelates(Long deviceId, ModelAndView mv) {
		Long mallId = this.validateAuthorizationToken().getMallId(); // 商场Id
		JSONObject res = new JSONObject();
		/**
		 * Step01: 根据设备id查询设备详情，并且获得楼层id和设备分组id
		 */
		if (deviceId != null) {
			res = deviceApiFeign.detailNoStatus(deviceId);
			this.dealException(res);
			JSONObject deviceInfo = res.getJSONObject(R);
			mv.addObject("device", deviceInfo);
			Long floorId =  deviceInfo.getLong("floorId"); // 楼层id
			Long deviceGroupId = deviceInfo.getLong("deviceGroupId"); //设备分组id

			/**
			 * Step02 根据设备分组id查询设备分组信息
			 */
			JSONObject group = new JSONObject();
			if(deviceGroupId != null) {
				JSONObject deviceGroup = new JSONObject();
				deviceGroup = groupDeviceApiFeign.detailGroup(deviceGroupId.intValue());
				this.dealException(deviceGroup);
				group.put("devideGroupRemark", deviceGroup.getJSONObject(R).getString("remark"));
			}
			group.put("deviceGroupId", deviceGroupId);
			group.put("deviceGroupName", deviceInfo.getString("deviceGroupName"));
			mv.addObject("group",group);

			/**
			 * Step03 根据楼层id查询楼层详情, 并且获得区域id
			 */
			if (floorId != null) {
				res = floorApiFeign.detailNoStatus(floorId);
				this.dealException(res);
				JSONObject floorInfo = res.getJSONObject(R); 
				mv.addObject("floor", floorInfo);
				Long areaId = floorInfo.getLong("areaId"); // 区域id
				
				/**
				 * Step04 根据商场id，区域id, 楼层id查询平面图信息
				 */
				if (areaId != null) {
					res = areaApiFeign.getVerticalView(mallId, areaId, floorId);
					this.dealException(res);
					JSONObject floorPgInfo = res.getJSONObject(R);
					mv.addObject("floorPg", floorPgInfo);

					/**
					 * Step05
					 * 确认该设备关联的楼层定位信息，所属区域信息完整
					 * 加载商场区域信息
					 */
					//总平面图加载
					res = areaApiFeign.getVerticalView(mallId, null, null);
					this.dealException(res);
					JSONObject vvInfo = res.getJSONObject(R);
					if (vvInfo != null) {
						mv.addObject("vv", vvInfo);
					}

					// 配置区域信息及平面图加载
					res = areaApiFeign.queryConfigedAreas(true);
					this.dealException(res);
					JSONArray configedAreas = res.getJSONArray(R);
					if (configedAreas != null && !configedAreas.isEmpty()) {
						for (int i = 0; i < configedAreas.size(); i++) {
							JSONObject area = configedAreas.getJSONObject(i);
							Long configedAreaId = area.getLong("id");

							res = areaApiFeign.getVerticalView(mallId, configedAreaId, null);
							this.dealException(res);
							area.put("picture", res.getJSONObject(R));

							res = areaApiFeign.getLayoutCoordinateByAreaId(configedAreaId);
							this.dealException(res);
							area.put("layoutConfig", res.getJSONObject(R));
						}
					}
					mv.addObject("configedAreas", configedAreas);
				}
			}
		}
		return mv;
	}

}
