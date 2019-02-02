package com.emin.platform.smw.controller;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.emin.platform.smw.constain.ApplicationConstain;
import com.emin.platform.smw.filter.MenuOperationFilter;
import com.emin.platform.smw.interfaces.CentralConApiFeign;
import com.emin.platform.smw.interfaces.DocumentApiFeign;
import com.emin.platform.smw.interfaces.TagApiFeign;
import com.emin.platform.smw.util.UserClaim;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;
@Controller
@RequestMapping("/operation-info")
public class OperationInfoController extends HeaderCommonController {
    private static final Logger LOGGER = Logger.getLogger(StoreController.class);
    @Value("${spring.application.code}")
    private String appCode;
    @Autowired
    CentralConApiFeign centralConApiFeign;
    @Autowired
    MenuOperationFilter menuOperationFilter;
    @Autowired
    DocumentApiFeign documentApiFeign;
    @Autowired
    TagApiFeign tagApiFeign;
    @RequestMapping("/index")
    public ModelAndView index() {
        ModelAndView mv = new ModelAndView("modules/operation-info/manage");
        UserClaim userClaim = this.validateAuthorizationToken();
        JSONObject params = new JSONObject();
        try {
            params.putIfAbsent("userId", userClaim.getId());
            String operationCodes = menuOperationFilter.menuOperations("operation-info", params);
            mv.addObject("operationCodes", operationCodes);
        } catch (Exception e) {
            LOGGER.error("运维资料管理界面跳转，加载权限出现异常->" + e.getMessage());
        }
        try {
            int[] noInNodeDomains = {1};
            params = new JSONObject();
            params.put("noInNodeDomains", noInNodeDomains);//排除1
            params.put("pid", -1);//查询全部
            params.put("nodeDomain", -1);//查询全部
            JSONObject res = documentApiFeign.queryRoots(params.toJSONString());
            mv.addObject("cates", res.getJSONArray(ApplicationConstain.RESULT_STRING));
        } catch (Exception e) {
            LOGGER.error("运维资料管理界面跳转，加载分类出现异常->" + e.getMessage());
        }
        return mv;
    }
    /**
     * 查询领域根节点
     *
     * @param
     */
    @RequestMapping("/queryRoots")
    @ResponseBody
    public JSONObject queryRoots() {
        JSONObject params = new JSONObject();
        int[] noInNodeDomains = {1};
        params = new JSONObject();
        params.put("noInNodeDomains", noInNodeDomains);//排除1
        params.put("pid", -1);//查询全部
        params.put("nodeDomain", -1);//查询全部
        params.put("sort", "createTime");
        params.put("order", "asc");
        JSONObject res = documentApiFeign.queryRoots(params.toJSONString());
        this.dealException(res);
        return res;
    }
    /**
     * 保存领域节点信息
     *
     * @param rootModifyDto 领域节点信息
     */
    @RequestMapping("/createDomainRoot")
    @ResponseBody
    public JSONObject createDomainRoot(String rootModifyDto, Integer[] ids) {
        UserClaim userClaim = this.validateAuthorizationToken();
        JSONObject rootModifyDtoObj = JSONObject.parseObject(rootModifyDto);
        JSONArray folders = rootModifyDtoObj.getJSONArray("folders");
        JSONObject cateDetail;
        if (rootModifyDtoObj.getLong("id") == null) {
            rootModifyDtoObj.put("operationUserId", userClaim.getId());
            rootModifyDtoObj.put("operationUserName", userClaim.getRealName());
            rootModifyDtoObj.remove("folders");
        } else {
            cateDetail = documentApiFeign.folderDetail(rootModifyDtoObj.getLong("id"));
            this.dealException(cateDetail);
            cateDetail = cateDetail.getJSONObject(ApplicationConstain.RESULT_STRING);
            cateDetail.put("name", rootModifyDtoObj.getString("name"));
            rootModifyDtoObj = cateDetail;
            rootModifyDtoObj.remove("nodeType");
        }
        rootModifyDtoObj.put("isRoot", true);
        JSONObject res = documentApiFeign.createDomainRoot(rootModifyDtoObj.toJSONString());
        this.dealException(res);
        Long pid = res.getJSONObject(ApplicationConstain.RESULT_STRING).getLong("id");
        if (!folders.isEmpty()) {
            for (int i = 0; i < folders.size(); i++) {
                JSONObject folder = folders.getJSONObject(i);
                if (folder.getLong("id") == null) {
                    folder.put("operationUserId", userClaim.getId());
                    folder.put("operationUserName", userClaim.getRealName());
                }
                folder.put("pid", pid);
                JSONObject folderRes = documentApiFeign.folderCreateOrUpdate(folder.toJSONString());
                this.dealException(folderRes);
            }
        }
        if (ids.length > 0) {
            JSONObject removeRes = documentApiFeign.delete(ids);
            this.dealException(removeRes);
        }
        return res;
    }
    @RequestMapping("/getFileTags")
    @ResponseBody
    public JSONObject getFileTags(String params) {
        JSONObject res = documentApiFeign.filetags(params, null, null, 1, 10);
        this.dealException(res);
        return res;
    }
    @RequestMapping("/addTags")
    @ResponseBody
    public JSONObject addTags(String tagParams, String tagLibParams, Long[] ids) {
        JSONObject tagRes = documentApiFeign.fileAddTag(tagParams);
        this.dealException(tagRes);
        if (ids.length > 0) {
            tagRes = documentApiFeign.fileRemoveTags(ids);
            this.dealException(tagRes);
        }
        if (tagLibParams != null) {
            JSONObject tagLibRes = tagApiFeign.tagLibAddTags(tagLibParams);
            this.dealException(tagLibRes);
        }
        return tagRes;
    }
    /**
	 * 根据目录查询下面的文件
	 * @param folders 目录
	 * @param name 查询字段 name
	 * @return
	 */
    @RequestMapping("/getFilesByfolderIds")
    @ResponseBody
    public JSONObject getFilesByfolderIds(String folders, String name) {
        JSONArray foldersObj = JSON.parseArray(folders);
        JSONArray filesList = new JSONArray();
        JSONObject res = new JSONObject();
        JSONObject temp;
        JSONObject result;
        JSONArray files;
        JSONObject file;
        JSONObject item;
        res.put("success", true);
        for (int i = 0; i < foldersObj.size(); i++) {
            temp = foldersObj.getJSONObject(i);
            temp.put("name", name);
            res = documentApiFeign.querypage(temp.toJSONString(), null, null, 1, 100000);
            this.dealException(res);
            result = res.getJSONObject(ApplicationConstain.RESULT_STRING);
            if (result.getLong("totalCount") > 0) {
                files = result.getJSONArray("resultList");
                for (int j = 0; j < files.size(); j++) {
                	item = new JSONObject();
                    file = files.getJSONObject(j);
                    item.put("pid", file.getLong("pid"));
                    item.put("id", file.getLong("id"));
                    item.put("name", file.getString("name"));
                    filesList.add(item);
                }
            }
        }
        res.put(ApplicationConstain.RESULT_STRING, filesList);
        return res;
    }
}