package com.emin.platform.smw.interfaces;

import com.alibaba.fastjson.JSONObject;

import com.emin.platform.smw.constain.ApplicationConstain;

import feign.Response;

import org.springframework.cloud.netflix.feign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

/***
 * 
 * @author Danica
 * @beginDate 2018/05/11 02:30
 */

@FeignClient(value = ApplicationConstain.ZUUL_SERVICE)
public interface DeviceApiFeign {
	/**
	 * 删除设备
	 * @param id 设备编号
	 * @return
	 */
	@RequestMapping(value = "/api-smart-mall-floor/device/delete", method = RequestMethod.DELETE)
	JSONObject remove(@RequestParam(value="id")Long id);
	
	/**
	 * 设备数据分页查询
	 * @param floorId 设备所属楼层id
	 * @param systemCode 设备所属子系统code
	 * @param page 页码
	 * @param limit 页浏览条数
	 * @param keyword 关键字
	 * @param physicalState 设备状态 0：正常，1：异常
	 * @param sort 排序字段
	 * @param order 升序 asc/降序desc
	 * @return
	 */
	@RequestMapping(value = "/api-smart-mall-floor/device/pageVo", method = RequestMethod.GET)
	JSONObject page(@RequestParam(value="floorId")Long floorId,
			@RequestParam(value="systemCode")String systemCode,
			@RequestParam(value="page")Integer page,
			@RequestParam(value="limit")Integer limit,
			@RequestParam(value="keyword")String keyword,
			@RequestParam(value="physicalState")Integer physicalState,
			@RequestParam(value="sort")String sort,
			@RequestParam(value="order")String order);
	
	/**
	 * 加载设备分页简单信息
	 * @param floorId 设备所属楼层id
	 * @param systemCode 设备所属子系统code
	 * @param page 页码
	 * @param limit 页浏览条数
	 * @param keyword 关键字
	 * @param physicalState 设备状态 0：正常，1：异常
	 * @param sort 排序字段
	 * @param order 升序 asc/降序desc
	 * @return
	 */
	@RequestMapping(value = "/api-smart-mall-floor/device/pageVo", method = RequestMethod.GET)
	JSONObject pageVo(@RequestParam(value="floorId")Long floorId,
			@RequestParam(value="systemCode")String systemCode,
			@RequestParam(value="page")Integer page,
			@RequestParam(value="limit")Integer limit,
			@RequestParam(value="keyword")String keyword,
			@RequestParam(value="physicalState")Integer physicalState,
			@RequestParam(value="sort")String sort,
			@RequestParam(value="order")String order);
	
	/**
	 * 根据设备业务状态加载设备分析信息
	 * @param floorId 设备所属楼层id
	 * @param systemCode 设备所属子系统code
	 * @param page 页码
	 * @param limit 页浏览条数
	 * @param keyword 关键字
	 * @param businessState 业务状态编码
	 * @return
	 */
	@RequestMapping(value = "/api-smart-mall-floor/device/pageByBusinessState", method = RequestMethod.GET)
	JSONObject pageByBusinessState(@RequestParam(value="floorId")Long floorId,
			@RequestParam(value="systemCode")String systemCode,
			@RequestParam(value="page")Integer page,
			@RequestParam(value="limit")Integer limit,
			@RequestParam(value="keyword")String keyword,
			@RequestParam(value="businessState")String businessState);
	
	/**
	 * 保存设备
	 * @param device 设备基本数据
	 * @return
	 */
	@RequestMapping(value = "/api-smart-mall-floor/device/createOrUpdate", method = RequestMethod.POST, consumes=MediaType.APPLICATION_JSON_UTF8_VALUE)
	JSONObject save(@RequestBody String device);
	
	/**
	 * 根据版本code查询表单提交参数
	 * @param versionCode
	 * @return
	 */
	@RequestMapping(value = "/api-smart-mall-floor/device/getBaseInfoByVersion", method = RequestMethod.GET)
	JSONObject formConfig(@RequestParam(value="versionCode")String versionCode);
	
	/**
	 * 查询设备可用子系统
	 * @param code
	 * @return
	 */
	@RequestMapping(value = "/api-smart-mall-floor/floor/subsystem/querySystem", method = RequestMethod.POST)
	JSONObject subSystems(@RequestParam(value="code")String code);
	
	/**
	 * 根据子系统、楼层查询设备版本号
	 * @param floorId 楼层id
	 * @param subsystemCode 子系统版本号
	 * @return
	 */
	@RequestMapping(value = "/smart-mall-floor-service/device/getVersionCodeByFloor", method = RequestMethod.GET)
	JSONObject getVersionCodeByFloor(@RequestParam(value="floorId")Long floorId,
			@RequestParam(value="subsystemCode")String subsystemCode);
	
	/**
	 * 根据楼层和版本号查询设备列表
	 * @param page 页码 
	 * @param limit 每页条数 
	 * @param keyword 查询字段
	 * @param floorId 楼层id
	 * @param versionCode 版本号
	 * @return
	 */
	@RequestMapping(value = "/smart-mall-floor-service/device/pageByFloorAndVersion", method = RequestMethod.GET)
	JSONObject getDevicesByFloorAndVersionCode(@RequestParam(value="page") Integer page,
			@RequestParam(value="limit") Integer limit,
			@RequestParam(value="keyword") String keyword,
			@RequestParam(value="floorId") Long floorId,
			@RequestParam(value="versionCode") String versionCode);
	
	

	@RequestMapping(value = "/api-smart-mall-floor/device/detail/{id}", method = RequestMethod.GET)
	JSONObject detail(@PathVariable("id")Long id);
	

	@RequestMapping(value = "/api-smart-mall-floor/device/detailNoStatus/{id}", method = RequestMethod.GET)
	JSONObject detailNoStatus(@PathVariable("id")Long id);
	
	/**
	 * 根据本号查询设备functions
	 * @param versionCode 版本号
	 * @return
	 */
	@RequestMapping(value = "/smart-mall-floor-service/device/getFunctionsByVersion", method = RequestMethod.GET)
	JSONObject getFunctionsByVersion(@RequestParam(value="versionCode") String versionCode);
	
	/**
	 * 获取批量导入设备的模板
	 * @return
	 */
	/*@RequestMapping(value = "/api-smart-mall-floor/device/getUploadDeviceExcelFile", method = RequestMethod.GET)
	JSONObject getUploadDeviceExcelFile();*/
	@RequestMapping(value = "/api-smart-mall-floor/device/getUploadDeviceExcelFile",method = RequestMethod.GET)
	Response getUploadDeviceExcelFile();
	
	/**
	 * 批量导入设备
	 * @param floorId 楼层id
	 * @param file excel文件
	 * @return
	 */
		
	@PostMapping(value = "/api-smart-mall-floor/device/uploadDevice/{floorId}",consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	Response uploadDevices(@RequestPart("file") MultipartFile file,@PathVariable("floorId") Long floorId);
	
	/**
	 * 根据本号查询设备functions
	 * @param subsystemCode 子系统code
	 * @param versionCode 版本号
	 * @return
	 */
	@RequestMapping(value = "/api-smart-mall-floor/device/getCountBySubsystemCode", method = RequestMethod.GET)
	JSONObject getDeviceCount(@RequestParam(value="subsystemCode") String subsystemCode,
			@RequestParam(value="versionCode") String versionCode,
			@RequestParam(value="floorId") Integer floorId);
	
	/**
	 * 查询子系统的设备数量（按照业务状态和工作状态）
	 * @param subsystemCode 子系统code
	 * @param versionCode 版本号
	 * @return
	 */
	@RequestMapping(value = "/api-smart-mall-floor/device/getCountBusinessStateBySubsystemCode", method = RequestMethod.GET)
	JSONObject getCountBusinessStateBySubsystemCode(@RequestParam(value="subsystemCode") String subsystemCode,
			@RequestParam(value="versionCode") String versionCode,
			@RequestParam(value="floorId") Integer floorId);
	
	/**
	 * 根据版本号查询品牌
	 * @param versionCode 版本号
	 * @return
	 */
	@RequestMapping(value = "/api-smart-mall-floor/floor/subsystem/querySystemByVersionCode", method = RequestMethod.GET)
	JSONObject queryBranchByVersionCode(@RequestParam(value="versionCode") String versionCode);

	
	/**
	 * 手动同步安排设备
	 * @return
	 */
	@RequestMapping(value = "/api-smart-mall-floor/apDevice/synchronizeApDevice", method = RequestMethod.POST)
	JSONObject synchronizeApDevice();

	
	/**
	 * 查询异常设备
	 * @param floorId 楼层id
	 * @param subsystemCode 子系统code
	 * @param versionCode 版本号
	 * @return
	 */
	@RequestMapping(value = "/api-smart-mall-floor/device/getCountPhysicalStateBySubsystemCode", method = RequestMethod.GET)
	JSONObject getErrorCount(@RequestParam(value="subsystemCode") String subsystemCode,
			@RequestParam(value="versionCode") String versionCode,
			@RequestParam(value="floorId") Integer floorId);
	
	/**
	 * 对该版本baseParameters的参数唯一性进行校验
	 * @param baseParameterCheckStr 校验字符串
	 * @return
	 */
	@RequestMapping(value = "/api-smart-mall-floor/device/baseParameterUniqueCheck", method = RequestMethod.GET,consumes=MediaType.APPLICATION_JSON_UTF8_VALUE)
	JSONObject baseParameterUniqueCheck(@RequestParam(value="baseParameterCheckStr") String  baseParameterCheckStr);
	
	/**
	 * 查询可以展示数据的子系统信息
	 * @return
	 */
	@RequestMapping(value = "/api-smart-mall-floor/floor/subsystem/queryShowDeviceSubSystem", method = RequestMethod.POST)
	JSONObject queryShowDeviceSubSystem();
	
	/**
	 * 查询可以添加设备子系统及其版本信息
	 * @param systemCode 子系统code
	 * @return
	 */
	@RequestMapping(value = "/api-smart-mall-floor/floor/subsystem/queryAddDeviceVersion", method = RequestMethod.POST)
	JSONObject queryAddDeviceVersion(@RequestParam(value="systemCode") String  systemCode);
}


