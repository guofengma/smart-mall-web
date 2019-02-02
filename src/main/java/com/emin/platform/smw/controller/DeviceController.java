package com.emin.platform.smw.controller;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.util.Collection;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
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

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.emin.platform.smw.annotation.IgnoreIterceptor;
import com.emin.platform.smw.constain.ApplicationConstain;
import com.emin.platform.smw.filter.MenuOperationFilter;
import com.emin.platform.smw.interfaces.DeviceApiFeign;
import com.emin.platform.smw.interfaces.SupplierApiFeign;

import feign.Response;

@Controller
@RequestMapping("/device")
public class DeviceController extends HeaderCommonController {
	private static final Logger LOGGER = Logger.getLogger(UserController.class);
	@Value("${spring.application.code}")
	private String appCode;

	@Autowired
	MenuOperationFilter menuOperationFilter;

	@Autowired
	DeviceApiFeign deviceApiFeign;
	
	@Autowired
	SupplierApiFeign supplierApiFeign;



	@RequestMapping("page")
	@ResponseBody
	public JSONObject page(Long floorId, String systemCode, Integer page, Integer limit, String keyword, Integer physicalState,String sort,String order) {
		JSONObject res = deviceApiFeign.page(floorId, systemCode, page, limit, keyword, physicalState,sort,order);
		this.dealException(res);
		return res;
	}
	@RequestMapping("pageVo")
	@ResponseBody
	public JSONObject pageVo(Long floorId, String systemCode, Integer page, Integer limit, String keyword, Integer physicalState,String sort,String order) {
		JSONObject res = deviceApiFeign.pageVo(floorId, systemCode, page, limit, keyword, physicalState,sort,order);
		this.dealException(res);
		return res;
	}
	@RequestMapping("pageByBusinessState")
	@ResponseBody
	public JSONObject pageByBusinessState(Long floorId, String systemCode, Integer page, Integer limit, String keyword, String businessState) {
		JSONObject res = deviceApiFeign.pageByBusinessState(floorId, systemCode, page, limit, keyword, businessState);
		this.dealException(res);
		return res;
	}
	
	

	@RequestMapping("/remove")
	@ResponseBody
	public JSONObject remove(Long id) {
		JSONObject res = deviceApiFeign.remove(id);
		this.dealException(res);
		return res;
	}
	
	@RequestMapping("/save")
	@ResponseBody
	public JSONObject save(String data) {
		JSONObject res = deviceApiFeign.save(data);
		this.dealException(res);
		return res;
	}
	
	@RequestMapping("/formConfig")
	@ResponseBody
	public JSONObject formConfig(String versionCode) {
		JSONObject res = deviceApiFeign.formConfig(versionCode);
		this.dealException(res);
		return res;
	}
	
	@RequestMapping("/subSystems")
	@ResponseBody
	public JSONObject subSystems(String code) {
		JSONObject res = deviceApiFeign.subSystems(code);
		this.dealException(res);
		return res;
	}
	/**
	 * 查询可以展示设备以及可以添加的子系统
	 * @param systemCode 子系统code
	 * @return
	 */
	@RequestMapping("/queryShowDeviceSubSystem")
	@ResponseBody
	public JSONObject queryShowDeviceSubSystem() {
		JSONObject versions;
		JSONObject res = deviceApiFeign.queryShowDeviceSubSystem();
		this.dealException(res);
		JSONArray subSyss = res.getJSONArray(ApplicationConstain.RESULT_STRING);
		JSONObject subSystem;
		JSONArray vArr = new JSONArray();
		String systemCode;
		for(int i = 0; i < subSyss.size(); i++) {
			subSystem = subSyss.getJSONObject(i);
			systemCode = subSystem.getString("systemCode");
			versions = deviceApiFeign.queryAddDeviceVersion(systemCode);
			subSystem.put("code", systemCode);
			this.dealException(res);
			vArr = versions.getJSONArray(ApplicationConstain.RESULT_STRING);
			if(vArr.isEmpty()) {
				subSystem.put("hasVersion", false);
			} else {
				subSystem.put("hasVersion", true);
			}
		}
		res.put(ApplicationConstain.RESULT_STRING, subSyss);
		return res;
	}
	
	@RequestMapping("/getDevicesByFloorAndVersionCode")
	@ResponseBody
	public JSONObject getDevicesByFloorAndVersionCode(String keyword, Long floorId, String versionCode) {
		JSONObject res = deviceApiFeign.getDevicesByFloorAndVersionCode(1, 10000, keyword, floorId, versionCode);
		this.dealException(res);
		return res;
	}
	
	/**
	 * 根据本号查询设备functions
	 * @param versionCode 版本号
	 * @return
	 */
	@RequestMapping("/getFunctionsByVersion")
	@ResponseBody
	public JSONObject getFunctionsByVersion(String versionCode) {
		JSONObject res = deviceApiFeign.getFunctionsByVersion(versionCode);
		this.dealException(res);
		return res;
	}
	
	/**
	 * 获取批量导入设备的模板
	 * @return
	 */
	@GetMapping("/getUploadDeviceExcelFile")
	@ResponseBody
	@IgnoreIterceptor
	public ResponseEntity getUploadDeviceExcelFile() {
		Response response =  deviceApiFeign.getUploadDeviceExcelFile();
		 
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
	 * @param floorId 楼层id
	 * @param file excel文件
	 * @return
	 */
	@RequestMapping("/uploadDevices")
	@ResponseBody
	public JSONObject uploadDevices(Long floorId, MultipartFile file) {

		JSONObject res = new JSONObject();
		JSONArray uploadDeviceTotal = null;
		try {
			Response response = deviceApiFeign.uploadDevices(file,floorId);
	
			Map<String, Collection<String>> headers = response.headers();
            
			JSONArray[] tempUploaddevicetotal = new JSONArray[1];
			headers.forEach((key, values) -> {
			    if ("content-type".equals(key) ) {
					for (String value : values) {
						if (value.startsWith("application/json")) {
							Response.Body body = response.body();
							String result = "";
							try {
								result = inputStream2String(body.asInputStream());
							} catch (Exception e) {
								LOGGER.info(e.getMessage());
							}
							this.dealException(JSONObject.parseObject(result));							
						}
					}
				}else if ("uploaddevicetotal".equals(key) ){
					String tempStr;
					try {
						tempStr = URLDecoder.decode(values.iterator().next(),"utf-8");
						tempUploaddevicetotal[0] = JSONArray.parseArray(tempStr);
					} catch (Exception e) {
						LOGGER.info(e.getMessage());
					}
					
					
				}
			});			
			
			uploadDeviceTotal = tempUploaddevicetotal[0];
			
			Response.Body body = response.body();
			File temp = File.createTempFile("temp", "xlsx");
			try(InputStream inputStream = body.asInputStream();	
					FileOutputStream outputStream = new FileOutputStream(temp);){
				String tempPath = temp.getAbsolutePath();
				getRequest().getSession().setAttribute("tempPath", tempPath);
				int bytesRead = 0;
	            byte[] buffer = new byte[8192];
	            while ((bytesRead = inputStream.read(buffer, 0, 8192)) != -1) {
	            	outputStream.write(buffer, 0, bytesRead);
	            }
			}
		} catch (IOException e) {
			LOGGER.info(e.getMessage());
		}
		res.put("success", true);
		res.put(ApplicationConstain.RESULT_STRING, uploadDeviceTotal);
		return res;
		
	}
	@RequestMapping("/downloadTempFile")
	public void downloadTempFile() {
		
		if(getRequest().getSession().getAttribute("tempPath")!=null){
			String tempPath = getRequest().getSession().getAttribute("tempPath").toString();
			File file=null;
			InputStream is=null;
			try {
				file = new File(tempPath);
				is = new FileInputStream(file);
				Workbook workbook = new XSSFWorkbook(is);
				getResponse().setContentType("application/vnd.ms-excel");
				getResponse().setHeader("Content-disposition",
				    "attachment;filename=" + URLEncoder.encode(System.currentTimeMillis() + ".xlsx", "UTF-8"));
				
				workbook.write(getResponse().getOutputStream());
				workbook.close();
				getRequest().getSession().removeAttribute("tempPath");
			} catch (FileNotFoundException e) {
				LOGGER.info(e.getMessage());
			} catch (IOException e) {
				LOGGER.info(e.getMessage());
			} finally {
				if(is!=null){
					try {
						is.close();
					} catch (IOException e) {
						LOGGER.info(e.getMessage());
					}
				}	
			} 
		}
	}
	
	/**
	 * 根据id查询设备详情
	 * @param deviceId 设备id
	 * @return
	 */
	@RequestMapping("/detali")
	@ResponseBody
	public JSONObject detail(Long deviceId) {
		JSONObject res = deviceApiFeign.detail(deviceId);
		this.dealException(res);
		return res;
	}
	
	/**
	 * 根据系统版本号、设备版本号查询对应的供应商
	 * @param VCode 设备版本号
	 * @return
	 */
    
    @RequestMapping("/querySuppliersByVCode")
    @ResponseBody
    public JSONObject querySuppliersByVCode(String versionCode) {
        JSONObject res = deviceApiFeign.queryBranchByVersionCode(versionCode);
        this.dealException(res);
        String brandCode = res.getJSONObject(ApplicationConstain.RESULT_STRING).getString("brandCode");
        String subsystemCode = res.getJSONObject(ApplicationConstain.RESULT_STRING).getString("businessSystemCode");
        res = supplierApiFeign.querySuppliersBySystemCodeBrandCode(subsystemCode, brandCode);
        this.dealException(res);
        return res;
    }
    
    /**
	 * 手动同步ap设备
	 * @return
	 */
    
    @RequestMapping("/synchronizeApDevice")
    @ResponseBody
    public JSONObject synchronizeApDevice() {
		JSONObject res = deviceApiFeign.synchronizeApDevice();
        this.dealException(res);
        return res;
    }
    
    /**
	 * 对该版本baseParameters的参数唯一性进行校验
	 * @param baseParameterCheckStr 校验字符串
	 * @return
	 */
    @GetMapping("/baseParameterUniqueCheck")
    @ResponseBody
    public JSONObject baseParameterUniqueCheck(String baseParameterCheckStr) {
    	JSONObject obj = JSON.parseObject(baseParameterCheckStr);
    	JSONArray arr = obj.getJSONArray("data");
        JSONObject res = deviceApiFeign.baseParameterUniqueCheck(arr.toJSONString());
        this.dealException(res);
        return res;
    }
	
	
	public String inputStream2String(InputStream is){
		   BufferedReader in = new BufferedReader(new InputStreamReader(is));
		   StringBuffer buffer = new StringBuffer();
		   String line = "";
		   try {
			while ((line = in.readLine()) != null){
			     buffer.append(line);
			   }
		} catch (IOException e) {
			LOGGER.info(e.getMessage());
		}
		   return buffer.toString();
		}
}