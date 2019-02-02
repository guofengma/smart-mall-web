package com.emin.platform.smw.interfaces;

import com.emin.platform.smw.constain.ApplicationConstain;
import org.springframework.cloud.netflix.feign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import com.emin.platform.smw.config.FeignMultipartSupportConfig;


/***
 * 文件上传
 * @author kakadanica
 */
@FeignClient(value = ApplicationConstain.ZUUL_SERVICE,configuration = FeignMultipartSupportConfig.class)
public interface FileApiFeign {
	
	/**
	 * 图片文件上传（会对图片进行压缩）
	 * @param file 上传的图片文件
	 * @return
	 */
	@RequestMapping(value = "/api-storage/storage/upload/img",method = RequestMethod.POST,consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	String upload(@RequestPart(value="file") MultipartFile file);
	
	
	/**
	 * 文件上传（不会对文件进行压缩，不限制文件格式）
	 * @param ecmId 商场id或者主体id
	 * @param file 上传的文件
	 * @return
	 */
	@RequestMapping(value = "/api-storage/storage/{ecmId}/upload/uploadFile",method = RequestMethod.POST,consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	String universalUpload(@PathVariable (value="ecmId") String ecmId,
			@RequestPart(value="file") MultipartFile file);
	
}
