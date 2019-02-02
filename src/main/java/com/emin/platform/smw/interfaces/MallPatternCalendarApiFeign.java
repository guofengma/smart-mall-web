package com.emin.platform.smw.interfaces;

import org.springframework.cloud.netflix.feign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import com.alibaba.fastjson.JSONObject;
import com.emin.platform.smw.constain.ApplicationConstain;

import feign.Response;

/***
 * 
 * @author Danica
 * @beginDate 2018/06/05 04:34
 */

@FeignClient(value = ApplicationConstain.ZUUL_SERVICE)
public interface MallPatternCalendarApiFeign {
	
	@RequestMapping(value = "/api-smart-mall-floor/mallPatternCalendar/findByMonth", method = RequestMethod.GET)
	JSONObject findByMonth(@RequestParam(value="yyyymm") String yyyymm);
	
	/**
	 * 根据日期查询商场及详情
	 * @param yyyymmdd 日期(年月日)
	 */
	@RequestMapping(value = "/smart-mall-floor-service/mallPatternCalendar/findMallPatternByDay/{yyyymmdd}",method = RequestMethod.GET)
	JSONObject findMallPatternByDay(@PathVariable(value="yyyymmdd") String yyyymmdd);
	
	/**
	 * 指定当日商场模式
	 * @param yyyymmdd 日期(年月日)
	 * @param mallPatternId 模式id
	 */
	@RequestMapping(value = "/smart-mall-floor-service/mallPatternCalendar/updateDayMallPattern",method = RequestMethod.POST)
	JSONObject updateDayMallPattern(@RequestParam(value="yyyymmdd") String yyyymmdd,
			@RequestParam(value="mallPatternId") Long mallPatternId);
	/**
	 * 查询某年的商场节假日是否初始化成功
	 * @param year 日期(年份)
	 */
	@RequestMapping(value = "/api-smart-mall-floor/mallPatternCalendar/findInitResultMallPatternByYear/{year}",method = RequestMethod.GET)
	JSONObject findInitResultMallPatternByYear(@PathVariable(value="year") Long year);

	/**
	 * 获取商场节假日导入模板文件
	 */
	@RequestMapping(value = "/api-smart-mall-floor/mallPatternCalendar/getUploadMallPatternCalendarExcelFile",method = RequestMethod.GET)
	Response getUploadMallPatternCalendarExcelFile();
	
	/**
	 * 批量导入商场节假日
	 * @param year 日期(年)
	 * @param file excel文件
	 * @return
	 */
		
	@PostMapping(value = "/api-smart-mall-floor/mallPatternCalendar/uploadMallPatternCalendar/{year}",consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	JSONObject uploadMallPatternCalendar(@RequestPart("file") MultipartFile file,@PathVariable("year") Integer year);
}


