package com.emin.platform.smw.controller;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.emin.base.exception.EminException;
import com.emin.base.log.BussLog;
import com.emin.platform.smw.annotation.IgnoreIterceptor;
import com.emin.platform.smw.config.FileTypeConfig.FileResourceType;
import com.emin.platform.smw.constain.ApplicationConstain;
import com.emin.platform.smw.dto.FileEntry;
import com.emin.platform.smw.interfaces.DocumentApiFeign;
import com.emin.platform.smw.interfaces.FileApiFeign;
import com.emin.platform.smw.util.AgentVersionMatchSupport;
import com.emin.platform.smw.util.JsonObjectHelper;
import com.emin.platform.smw.util.ResponseBackHelper;
import com.emin.platform.smw.util.UserClaim;
import org.apache.commons.compress.archivers.zip.ZipArchiveEntry;
import org.apache.commons.compress.archivers.zip.ZipArchiveOutputStream;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.ArrayUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.math.NumberUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.*;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import javax.activation.MimetypesFileTypeMap;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import static com.emin.platform.smw.constain.ApplicationConstain.SMART_MALL_WEB_REDIS_PRE;
import static org.springframework.http.MediaType.APPLICATION_OCTET_STREAM_VALUE;

@Controller
@RequestMapping("/file")
public class FileController extends HeaderCommonController {


    /**
     * 日志
     */
    private static final Logger LOGGER = LoggerFactory.getLogger(FileController.class);
    //当前系统默认的最大下载容量 100M
    public static final String DOCUMENT_PACKAGE_MAX_ALIABLE_DEFAULT_SIZE = "100M";
    //当前系统的最大下载容量redis的key
    public static final String DOCUMENT_DOCUMENT_PACKAGE_MAX_ALIABLE_SIZE_KEY = SMART_MALL_WEB_REDIS_PRE + "file:document.max.down.size";

    //同步下载的容量大小 10M
    public static final String DOCUMENT_PACKAGE_SYNC_AVAILABLE_DEFAULT_SIZE = "10M";
    //同步下载的容量大小redis的key
    public static final String DOCUMENT_DOCUMENT_PACKAGE_SYNC_AVAILABLE_SIZE_KEY = SMART_MALL_WEB_REDIS_PRE + "file:document.aync.down.size";


    private static int bufferSize = 1024 * 2;//单位bytes

    @Autowired
    FileApiFeign fileApiFeign;// 主体数据接口实现

    @Autowired
    FileResourceType fileResourceType;

    @Autowired
    private RestTemplate restTemplate;

    /**
     * 文档库api
     */
    @Autowired
    private DocumentApiFeign documentApiFeign;


    @Autowired
    private StringRedisTemplate redisTemplate;

    /**
     * @auth Anson
     * @name 输出流处理
     * @date 18-8-31
     * @since 1.0.0
     */
    public interface CallHandlerInputStream {
        /**
         * 给与一个输出流进行处理
         *
         * @param out
         * @throws IOException
         */
        void handler(OutputStream out) throws IOException;

    }


    /**
     * @return JSONObject
     * @auth Anson
     * @name 同步下载的上限大小, 单位byte
     * @date 18-8-31
     * @since 1.0.0
     */
    @IgnoreIterceptor
    @BussLog(description = "同步下载的上限大小，单位byte")
    @GetMapping("/document/syncDownAviable")
    @ResponseBody
    public JSONObject syncDownAviable() {
        JSONObject back = new JSONObject();
        back.put("success", true);
        back.put("result", this.getConfigSyncPackageAbliable());
        return back;
    }


    /**
     * @param
     * @return long
     * @auth Anson
     * @name 获取同步下载上下大小
     * @date 18-10-12
     * @since 1.0.0
     */
    private long getConfigSyncPackageAbliable() {
        String key = DOCUMENT_DOCUMENT_PACKAGE_SYNC_AVAILABLE_SIZE_KEY;
        return getRedisAvaliableValueOrSetDefault(key, DOCUMENT_PACKAGE_SYNC_AVAILABLE_DEFAULT_SIZE);
    }


    /**
     * @param dirId 当前目录id
     * @return void
     * @auth Anson
     * @name 验证某个文档库中文件夹是否满足了压缩的前置条件
     * @date 18-8-31
     * @since 1.0.0
     */
    @BussLog(description = "文档库打包下载验证")
    @GetMapping("/document/{dirId}/check")
    @ResponseBody
    public JSONObject documentDirPackageCheck(@PathVariable Long dirId) {
        JSONObject back = new JSONObject();
        back.put("success", false);
        back.put("message", "验证不通过");
        if (dirId == null) {
            //blank
            back.put("message", "目录主键未空");
            return back;
        }

        JSONObject curDirInfoResult = documentApiFeign.getDirNodeById(dirId);
        ResponseBackHelper backHelper = new ResponseBackHelper(curDirInfoResult);
        if (!backHelper.isSuccess()) {
            back.put("message", "目录不存在");
            return back;
        }
        JSONObject curDirInfo = backHelper.getResultObj();
        JsonObjectHelper helper = new JsonObjectHelper(curDirInfo);
        long configMaxPackageAbliable = getConfigMaxPackageAbliable();
        Long available = helper.getValue("available", Long.class);
        if (Objects.nonNull(available) && available > configMaxPackageAbliable) {
            //no null
            //超出了上限
            back.put("message", "目录总体大小超出了系统约定的上限");
            return back;
        }
        back.put("success", true);
        back.put("message", "");
        return back;
    }


    /**
     * @param dirId           当前目录id
     * @param packageFileName 压缩包的文件名 例如：anson.zip
     * @return void
     * @auth Anson
     * @name 多个网络文件压缩为一个压缩包
     * @date 18-8-31
     * @since 1.0.0
     */
    @BussLog(description = "文档库打包下载")
    @GetMapping("/document/{dirId}/package")
    public void documentDirPackage(@PathVariable Long dirId, @RequestParam(required = false) String packageFileName) {
        final String contentType = "application/x-zip-compressed";
        if (dirId == null) {
            //blank
            return;
        }
        JSONObject curDirInfoResult = documentApiFeign.getDirNodeById(dirId);
        ResponseBackHelper backHelper = new ResponseBackHelper(curDirInfoResult);
        if (!backHelper.isSuccess()) {
            return;
        }
        JSONObject curDirInfo = backHelper.getResultObj();
        JsonObjectHelper helper = new JsonObjectHelper(curDirInfo);
        String rootName = helper.getValue("name", String.class);

        if (StringUtils.isBlank(packageFileName)) {
            packageFileName = rootName;
        }
        if (!packageFileName.endsWith(".zip")) {
            packageFileName += ".zip";
        }
        long configMaxPackageAbliable = getConfigMaxPackageAbliable();
        Long available = helper.getValue("available", Long.class);
        if (Objects.nonNull(available) && available > configMaxPackageAbliable) {
            //no null
            //超出了上限
            return;
        }
        try {
            final long start = System.currentTimeMillis();
            JSONObject childrenResult = this.documentApiFeign.children(dirId, true, true, "{}");
            final long wast = System.currentTimeMillis() - start;
            LOGGER.info("当前完成查询子节点集合时间{}毫秒", wast);
            ResponseBackHelper childResultHelper = new ResponseBackHelper(childrenResult);
            if (!childResultHelper.isSuccess()) {
                return;
            }

            final JSONArray children = childResultHelper.getResultArray();
            final String path = rootName;
            this.download(sos -> {
                try (ZipArchiveOutputStream zout = new ZipArchiveOutputStream(new BufferedOutputStream(sos, bufferSize));) {
                    this.childrenPackageHandle(zout, children, path);
                }
            }, packageFileName, contentType);
        } catch (Exception e) {
            return;
        }


    }

    /**
     * @param
     * @return long
     * @auth Anson
     * @name 获取配置最大打包下载的上限
     * @date 18-10-12
     * @since 1.0.0
     */
    private long getConfigMaxPackageAbliable() {
        String key = DOCUMENT_DOCUMENT_PACKAGE_MAX_ALIABLE_SIZE_KEY;
        return getRedisAvaliableValueOrSetDefault(key, DOCUMENT_PACKAGE_MAX_ALIABLE_DEFAULT_SIZE);
    }

    /**
     * @param key
     * @param defaultValue
     * @return long
     * @auth Anson
     * @name 获取目标key的容量大小或不存在则设置默认key
     * @date 18-10-15
     * @since 1.0.0
     */
    private long getRedisAvaliableValueOrSetDefault(String key, String defaultValue) {
        if (!redisTemplate.hasKey(key)) {
            redisTemplate.opsForValue().set(key, defaultValue);
        }
        //验证当前是否超出了上限
        String configMaxPackageAbliableStr = redisTemplate.opsForValue().get(key);
        //单位byte
        return convertLongSize(configMaxPackageAbliableStr);
    }

    private void childrenPackageHandle(ZipArchiveOutputStream zout, JSONArray children, String path) throws IOException {
        final int size = children.size();
        JSONObject cur = null;
        JsonObjectHelper curHelper = null;
        String name = null;
        String storePath = null;
        boolean isHasChirldren = false;

        for (int i = 0; i < size; i++) {
            cur = children.getJSONObject(i);
            if (cur == null) {
                continue;
            }
            curHelper = new JsonObjectHelper(cur);
            //当前节点下的子节点
            JSONArray curChildren = curHelper.getValue("children", JSONArray.class);
            isHasChirldren = curChildren != null && !curChildren.isEmpty();
            storePath = curHelper.getValue("storePath", "", String.class);
            name = curHelper.getValue("name", String.class);
            String targetFileName = name;
            String curPath = path + "/" + targetFileName;
            if (isHasChirldren) {
                //如果当前含有子节点的时候
                this.childrenPackageHandle(zout, curChildren, curPath);
                continue;
            } else if (StringUtils.isNotBlank(storePath)) {
                //  如果当前存在文件路径，则表明当前是一个文件
                byte[] bytes = this.downloadBytes(storePath);
                int length = bytes.length;
                if (length == 0) {
                    continue;
                }
                try (InputStream is = new BufferedInputStream(new ByteArrayInputStream(bytes), bufferSize);) {
                    ZipArchiveEntry zipEntry = new ZipArchiveEntry(curPath);
                    zout.putArchiveEntry(zipEntry);
                    zipEntry.setSize(length);
                    IOUtils.copy(is, zout);
                }
                zout.closeArchiveEntry();
            } else {
                continue;
            }

        }
    }

    /**
     * 1B/1b = 1 byte
     * 1k/1K = 1024b/1024B = 1024 byte
     * 1M/1m = 1024K/1024k
     * 默认为16m
     *
     * @param configMaxPackageAbliableStr
     * @return long
     * @auth Anson
     * @name 单位转换
     * @date 18-10-11
     * @since 1.0.0
     */
    private static long convertLongSize(String configMaxPackageAbliableStr) {
        final long b = 1;
        final long k = b << 10;
        final long m = k << 10;
        final long g = m << 10;
        final long defaultSize = m << 4;
        if (StringUtils.isBlank(configMaxPackageAbliableStr)
                || configMaxPackageAbliableStr.matches("/^(d+[b|B|k|K|m|M|g|G])$/")) {
            //规则校验
            return defaultSize;
        }
        configMaxPackageAbliableStr = configMaxPackageAbliableStr.toUpperCase().trim();

        int length = configMaxPackageAbliableStr.trim().length();
        String unit = configMaxPackageAbliableStr.substring(length - 1);
        String numberStr = configMaxPackageAbliableStr.substring(0, length - 1);
        long number = NumberUtils.toLong(numberStr, 0);
        if (number == 0) {
            return defaultSize;
        }
        switch (unit) {
            case "K":
                number = number * k;
                break;
            case "M":
                number = number * m;
                break;
            case "G":
                number = number * g;
                break;
        }
        return number;
    }


    /**
     * @param fileEntriesStr  需要打包的文件集合
     * @param packageFileName 压缩包的文件名 例如：anson.zip
     * @return void
     * @auth Anson
     * @name 多个网络文件压缩为一个压缩包
     * @date 18-8-31
     * @since 1.0.0
     */
    @BussLog(description = "打包文件")
    @GetMapping("/package")
    public void packageUrl(@RequestParam String fileEntriesStr, @RequestParam String packageFileName) {
        final String contentType = "application/x-zip-compressed";
        try {
            if (StringUtils.isBlank(fileEntriesStr) || StringUtils.isBlank(packageFileName)) {
                //blank
                return;
            }
            final List<FileEntry> fileEntries = JSONArray.parseArray(fileEntriesStr, FileEntry.class);
            if (fileEntries.isEmpty()) {
                return;
            }
            this.download((sos) -> {
                try (ZipArchiveOutputStream out = new ZipArchiveOutputStream(new BufferedOutputStream(sos, bufferSize));) {
                    for (FileEntry entry : fileEntries) {
                        String path = entry.getUrlPath();
                        if (StringUtils.isBlank(path)) {
                            //blank
                            continue;
                        }
                        String fileName = entry.getFileName();
                        fileName = StringUtils.isBlank(fileName) ? path.substring(path.lastIndexOf('/') + 1) : fileName;
                        byte[] bytes = this.downloadBytes(path);
                        int length = bytes.length;
                        if (length == 0) {
                            continue;
                        }
                        try (InputStream is = new BufferedInputStream(new ByteArrayInputStream(bytes), bufferSize);) {
                            ZipArchiveEntry zipEntry = new ZipArchiveEntry(fileName);
                            zipEntry.setSize(length);
                            out.putArchiveEntry(zipEntry);
                            IOUtils.copy(is, out);
                        }
                    }
                    out.closeArchiveEntry();
                }
            }, packageFileName, contentType);
        } catch (Exception e) {
            return;
        }


    }

    /**
     * 用于多文件压缩
     */
    public static void doCompressFiles(List<File> srcFiles, File destFile) throws IOException {
        try (ZipArchiveOutputStream out = new ZipArchiveOutputStream(new BufferedOutputStream(new FileOutputStream(destFile), bufferSize));) {
            for (File srcFile : srcFiles) {
                try (InputStream is = new BufferedInputStream(new FileInputStream(srcFile), bufferSize);) {
                    ZipArchiveEntry entry = new ZipArchiveEntry(srcFile.getName());
                    entry.setSize(srcFile.length());
                    out.putArchiveEntry(entry);
                    IOUtils.copy(is, out);
                }

            }
            out.closeArchiveEntry();
        }
    }

    /**
     * 下载错误，会返回一个空的字节流
     *
     * @param fileUrl 文件网络地址
     * @return byte[]
     * @auth Anson
     * @name 下载一个网络文件地址，获取字节流
     * @date 18-8-31
     * @since 1.0.0
     */
    public byte[] downloadBytes(String fileUrl) {
        if (StringUtils.isBlank(fileUrl)) {
            //blank
            return new byte[0];
        }
        URL url = null;
        try {
            url = new URL(fileUrl);
            HttpHeaders headers = new HttpHeaders();
            List list = new ArrayList<>();
            list.add(MediaType.valueOf(APPLICATION_OCTET_STREAM_VALUE));
            headers.setAccept(list);
            ResponseEntity<byte[]> responseEntity = restTemplate.exchange(url.toURI(), HttpMethod.GET,
                    new HttpEntity<byte[]>(headers), byte[].class);
            byte[] result = responseEntity.getBody();
            if (result.length < 1) {
                LOGGER.info("下载大小为空,fileUrl={},length={}", url, result.length);
                return new byte[0];
            }
            return result;
        } catch (IOException | URISyntaxException e) {
            return new byte[0];
        }

    }

    /**
     * @param fileUrl     当前文件的url
     * @param fileName    文件名称
     * @param contentType 内容类别
     * @return void
     * @auth Anson
     * @name 下载文件
     * @date 18-7-10
     * @since 1.0.0
     */
    @BussLog(description = "下载文件")
    @GetMapping("/download")
    @IgnoreIterceptor
    public void download(@RequestParam("url") String fileUrl, @RequestParam(value = "fileName") String fileName,
                         @RequestParam(value = "contentType", required = false) String contentType) {
        String finalContentType = this.getMIMEType(fileName, contentType);
        this.download((sos) -> {
            byte[] result = this.downloadBytes(fileUrl);
            if (ArrayUtils.isNotEmpty(result)) {
                IOUtils.write(result, sos);
            }
        }, fileName, finalContentType);
    }

    /**
     * @param outHandler
     * @param fileName
     * @param contentType
     * @return void
     * @auth Anson
     * @name 下载文件的公共方法
     * @date 18-8-31
     * @since 1.0.0
     */
    private void download(CallHandlerInputStream outHandler, String fileName, String contentType) {
        LOGGER.info("下载文件,目标自定义fileName={},自定义contentType={}", fileName, contentType);
        String targetFileName = AgentVersionMatchSupport.handlerAgentFileCharSet(this.getRequest(), fileName);
        if (StringUtils.isBlank(targetFileName)) {
            return;
        }
        HttpServletResponse response = getResponse();
        response.setContentType(contentType);
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Cache-Control", "no-cache");
        response.setDateHeader("Expires", 0);
        response.setHeader("Content-Disposition",
                "attachment;filename=\"" + targetFileName + "\""); // 此处可以重命名
        try (OutputStream sos = response.getOutputStream()) {
            outHandler.handler(sos);
        } catch (IOException e) {
            LOGGER.error("下载文件异常,fileName={},contentType={}", fileName, contentType, e);
        }
    }

    @RequestMapping("/upload.do")
    @ResponseBody
    @IgnoreIterceptor
    private JSONObject upload(MultipartFile file, String type) {
        JSONObject json = new JSONObject();
        String originalFilename = file.getOriginalFilename();
        String suffix = originalFilename.substring(originalFilename.lastIndexOf(".") + 1);
        boolean isLegal = true;
        // 类型判断
        if (type.equalsIgnoreCase("img")) {
            isLegal = !suffix.equalsIgnoreCase("jpg") && !suffix.equalsIgnoreCase("jpeg")
                    && !suffix.equalsIgnoreCase("png") && !suffix.equalsIgnoreCase("gif");
        } else if (type.equalsIgnoreCase("apk")) {
            isLegal = !suffix.equalsIgnoreCase("apk") && !suffix.equalsIgnoreCase("wgt")
                    && !suffix.equalsIgnoreCase("wgtu");
        } else if (type.equalsIgnoreCase("doc")) {
            isLegal = !suffix.equalsIgnoreCase("doc") && !suffix.equalsIgnoreCase("docx");
        } else if (type.equalsIgnoreCase("excel")) {
            isLegal = !suffix.equalsIgnoreCase("xls") && !suffix.equalsIgnoreCase("xlsx");
        }

        if (isLegal) {// 类型合法的情况下上传文件
            json = uploadFile(file);
            LOGGER.info("上传结果集合={}", json);
        } else {
            json.put("success", false);
            json.put("message", "上传文件类型与实际需求不符");
        }

        return json;
    }

    /**
     * 文件上传（不会对文件进行压缩，不限制文件格式） ecmId 商场id或者主体id
     *
     * @param file 上传的文件
     * @return
     */
    @RequestMapping("/universalUpload.do")
    @ResponseBody
    private JSONObject universalUpload(MultipartFile file) {
        JSONObject json = new JSONObject();
        UserClaim userClaim = this.validateAuthorizationToken();
        try {
            String resStr = fileApiFeign.universalUpload(userClaim.getEcmId().toString(), file);
            json = JSONObject.parseObject(resStr);
            if (!json.getBooleanValue("success")) {
                throw new EminException(json.getString("code"));
            }
            JSONObject result = json.getJSONObject(ApplicationConstain.RESULT_STRING);
            String fileType = result.getOrDefault("originalMimeType", "obj").toString();
            String viewFileType = fileResourceType.get(fileType);
            result.put("viewFileType", viewFileType);
            json.put(ApplicationConstain.RESULT_STRING, result);
        } catch (EminException e) {
            LOGGER.error(e.getLocalizedMessage(), e);
            json.put("message", e.getLocalizedMessage());
            json.put("success", false);
        } catch (Exception e) {
            LOGGER.error(e.getMessage(), e);
            json.put("message", "文件上传失败");
            json.put("success", false);
        }
        return json;
    }

    /***
     * 上传文件核心方法
     *
     * @param file
     *            文件流
     * @return
     */
    private JSONObject uploadFile(MultipartFile file) {
        JSONObject json = new JSONObject();
        try {
            String resStr = fileApiFeign.upload(file);
            json = JSONObject.parseObject(resStr);
            if (!json.getBooleanValue("success")) {
                throw new EminException(json.getString("code"));
            }
        } catch (EminException e) {
            LOGGER.error(e.getLocalizedMessage(), e);
            json.put("message", e.getLocalizedMessage());
            json.put("success", false);
        } catch (Exception e) {
            LOGGER.error(e.getMessage(), e);
            json.put("message", "文件上传失败");
            json.put("success", false);
        }

        return json;
    }

    /**
     * @param fileName    当前文件名称 不为空
     * @param contentType 定义好的内容类型 可以为空,优先级高
     * @return java.lang.String
     * @auth Anson
     * @name 根据文件后缀名获得对应的MIME类型
     * @date 18-7-10
     * @since 1.0.0
     */
    private String getMIMEType(String fileName, String contentType) {
        if (StringUtils.isNotBlank(contentType)) {
            return contentType;
        }
        String type;
        // 获取后缀名前的分隔符"."
        type = new MimetypesFileTypeMap().getContentType(fileName);
        return type;
    }

}
