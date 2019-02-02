package com.emin.platform.smw.interfaces;

import com.alibaba.fastjson.JSONObject;

import com.emin.platform.smw.constain.ApplicationConstain;
import org.springframework.cloud.netflix.feign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

/***
 * 
 * @author Danica
 * @beginDate 2018/09/06
 */

@FeignClient(value = ApplicationConstain.ZUUL_SERVICE)
public interface SupplierApiFeign {
	/**
	 * 获得供应商类型
	 * @return
	 */
	@RequestMapping(value = "/api-smart-mall-supplier/supplier/getSupplierType", method = RequestMethod.POST, consumes=MediaType.APPLICATION_JSON_UTF8_VALUE)
	JSONObject getTypes();

	/**
	 * 新增保存供应商
	 * @param supplier
	 * @return
	 */
	@RequestMapping(value = "/api-smart-mall-supplier/supplier/addSupplier", method = RequestMethod.POST, consumes=MediaType.APPLICATION_JSON_UTF8_VALUE)
	JSONObject save(@RequestBody String supplier);
	
	/**
	 * 查询供应商详情
	 * @param id
	 * @return
	 */
	@RequestMapping(value = "/api-smart-mall-supplier/supplier/querySupplierDetail", method = RequestMethod.GET)
	JSONObject detail(@RequestParam(value="id") Long id);
	
	/**
	 * 条件查询全部供应商
	 * @param supplierType 供应商类型
	 * @param keyWord 关键字
	 * @return
	 */
	@RequestMapping(value = "/api-smart-mall-supplier/supplier/querySupplierSimple", method = RequestMethod.GET)
	JSONObject queryAll(@RequestParam("supplierType") String supplierType,
			@RequestParam("keyWord") String keyWord);
	

	
	/**
	 * 编辑保存供应商基本信息
	 * @param supplier
	 * @return
	 */
	@RequestMapping(value = "/api-smart-mall-supplier/supplier/updateSupplier", method = RequestMethod.POST, consumes=MediaType.APPLICATION_JSON_UTF8_VALUE)
	JSONObject updateBasic(@RequestBody String supplier);

	/**
	 * 删除供应商
	 * @param id
	 * @return
	 */
	@RequestMapping(value = "/api-smart-mall-supplier/supplier/delSupplierBySystem", method = RequestMethod.GET)
	JSONObject remove(@RequestParam("id") Long id,
			@RequestParam("code") String code);

	/**
	 * 供应商关联品牌配置详情
	 * @param id
	 * @return
	 */
	@RequestMapping(value = "/api-smart-mall-supplier/brand/querySupplierBrands", method = RequestMethod.GET)
	JSONObject detailBrands(@RequestParam("supplierId") Long supplierId);
	

	/**
	 * 创建保存供应商关联品牌配置
	 * @param brand
	 * @param supplierId
	 * @return
	 */
	@RequestMapping(value = "/api-smart-mall-supplier/brand/addBrands", method = RequestMethod.POST, consumes=MediaType.APPLICATION_JSON_UTF8_VALUE)
	JSONObject addBrand(@RequestBody String brand,
			@RequestParam("supplierId") Long supplierId);
	
	/**
	 * 编辑保存供应商关联品牌配置
	 * @param brand
	 * @return
	 */
	@RequestMapping(value = "/api-smart-mall-supplier/brand/updateBrand", method = RequestMethod.POST, consumes=MediaType.APPLICATION_JSON_UTF8_VALUE)
	JSONObject updateBrand(@RequestBody String brand,
			@RequestParam("supplierId") Long supplierId,
			@RequestParam("systemCode") String systemCode);
	
	/**
	 * 删除供应商关联品牌配置
	 * @param id
	 * @return
	 */
	@RequestMapping(value = "/api-smart-mall-supplier/brand/delBrand", method = RequestMethod.GET)
	JSONObject removeBrand(@RequestParam("code") String code,
			@RequestParam("supplierId") Long supplierId);
	
	/**
	 * 供应商关联联系详情
	 * @param id
	 * @return
	 */
	@RequestMapping(value = "/api-smart-mall-supplier/contact/queryContact", method = RequestMethod.GET)
	JSONObject detailLinkman(@RequestParam("id") Long id);
	
	/**
	 * （取消）设置关联联系人为常用联系人
	 * @param id
	 * @param isMajor
	 * @return
	 */
	@RequestMapping(value = "/api-smart-mall-supplier/contact/setMajorContact", method = RequestMethod.GET)
	JSONObject topLinkman(@RequestParam("id") Long id, @RequestParam("isMajor") boolean isMajor);

	/**
	 * 创建保存供应商关联联系人信息
	 * @param contact
	 * @param supplierId
	 * @return
	 */
	@RequestMapping(value = "/api-smart-mall-supplier/contact/addContact", method = RequestMethod.POST, consumes=MediaType.APPLICATION_JSON_UTF8_VALUE)
	JSONObject addLinkman(@RequestBody String contact,
			@RequestParam("supplierId") Long supplierId);
	/**
	 * 编辑保存供应商关联联系人信息
	 * @param contact
	 * @return
	 */
	@RequestMapping(value = "/api-smart-mall-supplier/contact/updateContact", method = RequestMethod.POST, consumes=MediaType.APPLICATION_JSON_UTF8_VALUE)
	JSONObject updateLinkman(@RequestBody String contact);
	
	/**
	 * 删除供应商关联联系人
	 * @param id
	 * @return
	 */
	@RequestMapping(value = "/api-smart-mall-supplier/contact/delContact", method = RequestMethod.GET)
	JSONObject removeLinkman(@RequestParam("id") Long id);
	
	/**
	 * 通过系统code和品牌code查询供应商
	 * @param systemCode 系统code
	 * @param brandCode 品牌code
	 * @return
	 */
	@RequestMapping(value = "/api-smart-mall-supplier/supplier/delBrandByIds", method = RequestMethod.GET)
	JSONObject querySuppliersBySystemCodeBrandCode(@RequestParam("systemCode") String systemCode,
			@RequestParam("brandCode") String brandCode);
	
}


