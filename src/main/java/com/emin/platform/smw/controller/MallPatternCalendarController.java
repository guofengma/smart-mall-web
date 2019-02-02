package com.emin.platform.smw.controller;

import java.io.IOException;
import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.util.Collection;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.ModelAndView;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.emin.base.exception.EminException;
import com.emin.platform.smw.annotation.IgnoreIterceptor;
import com.emin.platform.smw.constain.ApplicationConstain;
import com.emin.platform.smw.filter.MenuOperationFilter;
import com.emin.platform.smw.interfaces.MallPatternApiFeign;
import com.emin.platform.smw.interfaces.MallPatternCalendarApiFeign;

import feign.Response;


@Controller
@RequestMapping("/mall-pattern-calendar")
public class MallPatternCalendarController extends HeaderCommonController {
	@Value("${spring.application.code}")
	private String appCode;

	@Autowired
	MenuOperationFilter menuOperationFilter;

	@Autowired
	MallPatternCalendarApiFeign mallPatternCalendarApiFeign;
	
	@Autowired
	MallPatternApiFeign mallPatternApiFeign;

	@RequestMapping("/index")
	public ModelAndView index(String yyyymm) {
		return new ModelAndView("modules/mall-pattern-calendar/manage");
	}

	@RequestMapping("/findByMonth")
	@ResponseBody
	public JSONObject findByMonth(String yyyymm) {
		JSONObject res;
		if (yyyymm == null) {
			SimpleDateFormat sdf = new SimpleDateFormat("yyyyMM");
			yyyymm = sdf.format(new Date());
		}
		res = mallPatternCalendarApiFeign.findByMonth(yyyymm);
		this.dealException(res);
		JSONArray result = res.getJSONArray(ApplicationConstain.RESULT_STRING);
		this.handlerView(result);
		res.put(ApplicationConstain.RESULT_STRING, result);
		return res;
	}

	private JSONArray handlerView(JSONArray result) {
		if (result == null || result.isEmpty()) {
			return result;
		}
		String key = "pattenViewEnable";
		int size = result.size();
		for (int i = 0; i < size; i++) {
			JSONObject day = result.getJSONObject(i);
			if (day == null) {
				continue;
			}
			JSONObject mallPattern = day.getJSONObject("mallPattern");
			if (mallPattern == null) {
				continue;
			}
			JSONArray mallPatternTime = mallPattern.getJSONArray("mallPatternTime");
			if (mallPatternTime == null) {
				mallPattern.put(key, false);
				continue;
			}
			boolean isEnable = this.handlerPatternEnable(mallPatternTime);
			mallPattern.put(key, isEnable);
			result.set(i, day);
			
		}
		return result;
	}

	private boolean handlerPatternEnable(JSONArray mallPatternTimeArr) {
		if (mallPatternTimeArr == null || mallPatternTimeArr.isEmpty()) {
			return false;
		}
		int size = mallPatternTimeArr.size();
		for (int i = 0; i < size; i++) {
			JSONObject time = mallPatternTimeArr.getJSONObject(i);
			if (time == null) {
				return false;
			}
			String subsystemPatternSetId = time.getString("subsystemPatternSetId");
			if (StringUtils.isBlank(subsystemPatternSetId)) {
				return false;
			}
		}
		return true;
	}

	/**
	 * 根据日期查询商场及详情
	 * @param yyyymmdd 日期(年月日)
	 */
	@RequestMapping("/findMallPatternByDay")
	@ResponseBody
	public JSONObject findMallPatternByDay(String yyyymmdd) {
		JSONObject res = mallPatternCalendarApiFeign.findMallPatternByDay(yyyymmdd);
		if (!res.getBooleanValue("success")) {
			throw new EminException(res.getString("code"));
		}
		return res;
	}
	
	/**
	 * 查询所有商场模式及其详情
	 */
	@RequestMapping("/queryAllMallPatternDetail")
	@ResponseBody
	public JSONObject queryAllMallPatternDetail() {
		JSONObject res;
		String key = "pattenViewEnable";
		res = mallPatternApiFeign.queryAllMallPatternDetail();
		if (!res.getBooleanValue("success")) {
			throw new EminException(res.getString("code"));
		}
		JSONArray result  = res.getJSONArray(ApplicationConstain.RESULT_STRING);
		int size = result.size();
		for (int i = 0; i < size; i++) {
			JSONObject mallPattern = result.getJSONObject(i);
			if (mallPattern == null) {
				continue;
			}
			JSONArray mallPatternTime = mallPattern.getJSONArray("mallPatternTime");
			if (mallPatternTime == null) {
				mallPattern.put(key, false);
				continue;
			}
			boolean isEnable = this.handlerPatternEnable(mallPatternTime);
			mallPattern.put(key, isEnable);
			result.set(i,mallPattern);
		}
		res.put(ApplicationConstain.RESULT_STRING, result);
		return res;
	}
	
	/**
	 * 指定当日商场模式
	 * @param yyyymmdd 日期(年月日)
	 * @param mallPatternId 模式id
	 */
	@RequestMapping("/updateDayMallPattern")
	@ResponseBody
	public JSONObject updateDayMallPattern(String yyyymmdd, Long mallPatternId) {
		JSONObject res = mallPatternCalendarApiFeign.updateDayMallPattern(yyyymmdd,mallPatternId);
		if (!res.getBooleanValue("success")) {
			throw new EminException(res.getString("code"));
		}
		return res;
	}
	/**
	 * 查询某年的商场节假日是否初始化成功
	 * @param year 日期(年份)
	 */
	@GetMapping("/findInitResultMallPatternByYear")
	@ResponseBody
	public JSONObject findInitResultMallPatternByYear(Long year) {
		JSONObject res;
		if (year == null) {
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy");
			year = Long.parseLong(sdf.format(new Date()));
		}
		String msg = "当前(" + year + ")日历还未初始化";
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-mm-dd");
		String nowDate = sdf.format(new Date());
		String[] list = nowDate.split("-");
		if(list[1].equals("12") && Long.parseLong(list[2]) > 10) {
			year += 1;
			msg = "已经年末了，检测到明年(" + year + ")的日历还未初始化";
		}
		res = mallPatternCalendarApiFeign.findInitResultMallPatternByYear(year);
		this.dealException(res);
		res.put("message", msg);
		res.put("year", year);
		return res;
	}
	/**
	 * 获取批量导入商场模式日历日期类型的模板
	 * @return
	 */
	@GetMapping("/getUploadMallPatternCalendarExcelFile")
	@ResponseBody
	@IgnoreIterceptor
	public ResponseEntity getUploadMallPatternCalendarExcelFile() {
		Response response =  mallPatternCalendarApiFeign.getUploadMallPatternCalendarExcelFile();
		 
		 Map<String, Collection<String>> headers = response.headers();
		 HttpHeaders httpHeaders = new HttpHeaders();

		 headers.forEach((key, values) -> {
		     List<String> headerValues = new LinkedList<>();
		     headerValues.addAll(values);
		     httpHeaders.put(key, headerValues);
		 });

		 Response.Body body = response.body();
		 try {
		     InputStream inputStream = body.asInputStream();//HttpURLInputStream
		     InputStreamResource resource = new InputStreamResource(inputStream);
		     return ResponseEntity
		         .ok()
		         .contentType(MediaType.APPLICATION_OCTET_STREAM)
		         .headers(httpHeaders)
		         .body(resource);
		 } catch (IOException e) {

			 return null;
		 }
	}
	
	/**
	 * 批量导入设备
	 * @param year 
	 * @param file excel文件
	 * @return
	 */
	@RequestMapping("/uploadMallPatternCalendar")
	@ResponseBody
	public JSONObject uploadMallPatternCalendar(Integer year, MultipartFile file) {
		JSONObject res = mallPatternCalendarApiFeign.uploadMallPatternCalendar(file,year);
		if (!res.getBooleanValue("success")) {
			throw new EminException(res.getString("code"));
		}
		return res;
		
	}
}