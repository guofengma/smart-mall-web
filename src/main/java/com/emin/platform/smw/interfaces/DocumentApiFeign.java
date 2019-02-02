package com.emin.platform.smw.interfaces;

import com.alibaba.fastjson.JSONObject;
import com.emin.platform.smw.constain.ApplicationConstain;
import org.springframework.cloud.netflix.feign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;


@FeignClient(value = ApplicationConstain.ZUUL_SERVICE)
public interface DocumentApiFeign {

    /**
     * 文件列表查询
     *
     * @param paramsStr 查询参数,json格式的字符串
     * @param sort      按照某个属性进行排序,多个属性按照’,’英文逗号隔开,同理与order属性一起
     * @param order     按照什么类型排序,可选值:asc(默认,升序),desc(降序),多个属性按照’,’英文逗号隔开,同理与sort属性一起,多个属性则有多个排序值
     */
    @RequestMapping(value = "/api-smart-mall-doc/node/page", method = RequestMethod.GET)
    JSONObject querypage(
            @RequestParam(value = "paramsStr") String paramsStr,
            @RequestParam(value = "sort") String sort,
            @RequestParam(value = "order") String order,
            @RequestParam(value = "page") Integer page,
            @RequestParam(value = "limit") Integer limit);

    /**
     * 按照当前查询获取当前文档库某一节点信息,若存在多个,则返回错误码
     *
     * @param paramsStr 查询参数,json格式的字符串
     */
    @RequestMapping(value = "/api-smart-mall-doc/node/getUniqueByParams", method = RequestMethod.GET)
    JSONObject nodeDetail(
            @RequestParam(value = "paramsStr") String paramsStr);

    /**
     * 获取文档库的根节点
     */
    @RequestMapping(value = "/api-smart-mall-doc/node/root", method = RequestMethod.GET)
    JSONObject root();


    /**
     * 新建或者编辑文件夹
     *
     * @param dirDto 文件夹信息
     */
    @RequestMapping(value = "/api-smart-mall-doc/node/createOrUpdateDir", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_UTF8_VALUE)
    JSONObject folderCreateOrUpdate(@RequestBody String dirDto);

    /**
     * 新建或者编辑文件
     *
     * @param fileDto 文件信息
     */
    @RequestMapping(value = "/api-smart-mall-doc/node/createOrUpdateFile", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_UTF8_VALUE)
    JSONObject fileCreateOrUpdate(@RequestBody String fileDto);

    /**
     * 移动文件或者文件夹
     *
     * @param id    文件或者文件夹的id
     * @param mvPid 新的父节点id
     */
    @RequestMapping(value = "/api-smart-mall-doc/node/mv/{id}/to/{mvPid}", method = RequestMethod.POST)
    JSONObject move(
            @PathVariable(value = "id") Integer id,
            @PathVariable(value = "mvPid") Integer mvPid);

    /**
     * 根据id查询路径
     *
     * @param id            文件或者文件夹的id
     * @param isContainSelf 当前路径是否包含自己节点：false:不包含， true：包含
     */
    @RequestMapping(value = "/api-smart-mall-doc/node/path/{id}", method = RequestMethod.GET)
    JSONObject path(
            @PathVariable(value = "id") Integer id,
            @RequestParam(value = "isContainSelf") Boolean isContainSelf);

    /**
     * 根据id删除文件或者文件夹
     *
     * @param ids id集合
     */
    @RequestMapping(value = "/api-smart-mall-doc/node/rms", method = RequestMethod.POST)
    JSONObject delete(
            @RequestParam(value = "ids") Integer[] ids);

    /**
     * 根据id查询文件夹的详情
     *
     * @param id 文件夹id
     */
    @RequestMapping(value = "/api-smart-mall-doc/node/dir/{id}", method = RequestMethod.GET)
    JSONObject folderDetail(
            @PathVariable(value = "id") Long id);

    /**
     * 保存领域节点信息
     *
     * @param rootModifyDto 领域节点信息
     */
    @RequestMapping(value = "/api-smart-mall-doc/node/createDomainRoot", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_UTF8_VALUE)
    JSONObject createDomainRoot(
            @RequestBody String rootModifyDto);

    /**
     * 查询领域根节点
     *
     * @param params 查询信息
     */
    @RequestMapping(value = "/api-smart-mall-doc/node/root/query", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_UTF8_VALUE)
    JSONObject queryRoots(
            @RequestBody String params);

    /**
     * tag列表查询
     *
     * @param params 查询参数,json格式的字符串
     * @param sort   按照某个属性进行排序,多个属性按照’,’英文逗号隔开,同理与order属性一起
     * @param order  按照什么类型排序,可选值:asc(默认,升序),desc(降序),多个属性按照’,’英文逗号隔开,同理与sort属性一起,多个属性则有多个排序值
     */
    @RequestMapping(value = "/api-smart-mall-doc/tag/page", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_UTF8_VALUE)
    JSONObject filetags(@RequestBody String params,
                        @RequestParam(value = "sort") String sort,
                        @RequestParam(value = "order") String order,
                        @RequestParam(value = "page") Integer page,
                        @RequestParam(value = "limit") Integer limit);

    /**
     * 给文件添加一个标签
     *
     * @param dto 标签信息
     */
    @RequestMapping(value = "/api-smart-mall-doc/tag/addTags", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_UTF8_VALUE)
    JSONObject fileAddTag(@RequestBody String dto);

    /**
     * 删除某个资源码下面的某些资源绑定的标签
     *
     * @param resourceCode 资源码
     * @param resourceIds  资源Id集合 每一条文件记录的id
     */
    @RequestMapping(value = "/api-smart-mall-doc/tag/clear/{resourceCode}", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_UTF8_VALUE)
    JSONObject resourceCodeRemoveTagsById(
            @PathVariable(value = "resourceCode") String resourceCode,
            @RequestBody Long[] resourceIds);

    /**
     * 删除文件上标签
     *
     * @param ids 文件记录中的标签id集合
     */
    @RequestMapping(value = "/api-smart-mall-doc/tag/rm/batch", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_UTF8_VALUE)
    JSONObject fileRemoveTags(
            @RequestBody Long[] ids);

    /**
     * 验证某个文件下是否含有某些节点名,存在相同名返回true
     *
     * @param targetDirId 目标目录的id
     * @param nodeNames
     */
    @RequestMapping(value = "/api-smart-mall-doc/node/existNodeFirLvlName", method = RequestMethod.GET)
    JSONObject existNodeFirLvlName(
            @RequestParam(value = "targetDirId") Long targetDirId,
            @RequestParam(value = "nodeNames") String[] nodeNames);

    /**
     * @param dirId 目录id
     * @return com.alibaba.fastjson.JSONObject
     * @auth Anson
     * @name 获取当前文档库的文件夹节点
     * @date 18-10-11
     * @since 1.0.0
     */
    @GetMapping("/api-smart-mall-doc/node/dir/{id}")
    JSONObject getDirNodeById(@PathVariable("id") long dirId);

    /**
     * @param pid         需要查询的节点id
     * @param isDeepQuery 是否采用深度查询,默认采用第一级节点,深度查询，消耗时间可能过大
     * @param isSimple    是否采用简单属性版本
     * @param paramsStr   查询参数,json格式的字符串
     * @return com.alibaba.fastjson.JSONObject
     * @auth Anson
     * @name 查询子节点
     * @date 18-10-11
     * @since 1.0.0
     */
    @GetMapping(value = "/api-smart-mall-doc/node/{pid}/children")
    JSONObject children(
            @PathVariable("pid") Long pid,
            @RequestParam(value = "isDeepQuery",required = false, defaultValue = "false") Boolean isDeepQuery,
            @RequestParam(value = "isSimple",required = false, defaultValue = "true") Boolean isSimple,
            @RequestParam(value = "paramsStr",required = false, defaultValue = "{}") String paramsStr);
}
