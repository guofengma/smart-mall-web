package com.emin.platform.smw.interfaces;

import com.alibaba.fastjson.JSONObject;
import com.emin.platform.smw.constain.ApplicationConstain;

import org.springframework.cloud.netflix.feign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;


@FeignClient(value = ApplicationConstain.ZUUL_SERVICE)
public interface TagApiFeign {

	/**
	 * 向标签库中添加标签
	 * @param dto 标签信息
	 */
	@RequestMapping(value = "/api-smart-mall-doc/tag-lib/addTag",method = RequestMethod.POST,consumes = MediaType.APPLICATION_JSON_UTF8_VALUE)
	JSONObject tagLibAddTag(@RequestBody String dto);
	/**
	 * 向标签库中添加n个标签
	 * @param dto 标签信息
	 */
	@RequestMapping(value = "/api-smart-mall-doc/tag-lib/batch/addTags",method = RequestMethod.POST,consumes = MediaType.APPLICATION_JSON_UTF8_VALUE)
	JSONObject tagLibAddTags(@RequestBody String dto);
	
	/**
	 * 标签库中的tag列表查询
	 * @param params 查询参数,json格式的字符串
	 * @param sort 按照某个属性进行排序,多个属性按照’,’英文逗号隔开,同理与order属性一起
	 * @param order 按照什么类型排序,可选值:asc(默认,升序),desc(降序),多个属性按照’,’英文逗号隔开,同理与sort属性一起,多个属性则有多个排序值
	 */
	@RequestMapping(value = "/api-smart-mall-doc/tag-lib/page",method = RequestMethod.POST,consumes = MediaType.APPLICATION_JSON_UTF8_VALUE)
	JSONObject tagLibPage(@RequestBody String params,
			@RequestParam(value="sort") String sort,
			@RequestParam(value="order") String order,
			@RequestParam(value="page") Integer page,
			@RequestParam(value="limit") Integer limit);
	
	/**
	 * 删除文档库中的标签
	 * @param ids 标签id集合
	 */
	@RequestMapping(value = "/api-smart-mall-doc/tag-lib/rm",method = RequestMethod.POST,consumes = MediaType.APPLICATION_JSON_UTF8_VALUE)
	JSONObject tagLibRemoveTags(
			@RequestBody Long[] ids);
	
}
