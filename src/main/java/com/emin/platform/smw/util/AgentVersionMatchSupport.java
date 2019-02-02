package com.emin.platform.smw.util;

import com.alibaba.fastjson.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.http.HttpServletRequest;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;

public final class AgentVersionMatchSupport {

    /**
     * slf
     */
    private static final Logger LOGGER = LoggerFactory.getLogger(AgentVersionMatchSupport.class);

    public static final String[] IE = new String[]{"IE.*"};

    /**
     * @param request
     * @param fileName
     * @return java.lang.String
     * @auth Anson
     * @name 根据不同的请求客户端转换不同的编码
     * @date 18-10-11
     * @since 1.0.0
     */
    public static String handlerAgentFileCharSet(HttpServletRequest request, String fileName) {
        boolean isIE = AgentVersionMatchSupport.isIE(request);
        return handlerAgentFileCharSet(fileName, isIE);
    }


    /**
     * @param fileName
     * @return java.lang.String
     * @auth Anson
     * @name 根据不同的请求客户端转换不同的编码
     * @date 18-10-11
     * @since 1.0.0
     */
    public static String handlerAgentFileCharSet(String fileName, boolean isIE) {
        String charset = "UTF-8";
        String targetCharset = isIE ? charset : "ISO8859-1";
        String targetFileName = "";
        try {
            if (isIE) {
                targetFileName = URLEncoder.encode(fileName, "UTF-8");
            } else {
                targetFileName = new String(fileName.getBytes(charset), targetCharset);
            }
        } catch (UnsupportedEncodingException e) {
            LOGGER.error("文件编码不支持,fileName={},charset={}", fileName, targetCharset, e);

        }
        return targetFileName;
    }


    /**
     * @param request
     * @return java.lang.Boolean
     * @auth Anson
     * @name 请求端是否是ie客户端
     * @date 18-10-11
     * @since 1.0.0
     */
    public static final Boolean isIE(HttpServletRequest request) {
        JSONObject agent = AgentVersionMatchSupport.getOsAndBrowserInfo(request);
        String browser = agent.getString("browser");
        boolean isIE = false;
        for (int i = 0; i < IE.length; i++) {
            if ((isIE = browser.matches(IE[i]))) {
                break;
            }
        }
        return isIE;
    }


    /**
     * 获取操作系统,浏览器及浏览器版本信息
     *
     * @param request
     * @return
     */
    public static JSONObject getOsAndBrowserInfo(HttpServletRequest request) {
        String browserDetails = request.getHeader("User-Agent");
        String userAgent = browserDetails;
        String user = userAgent.toLowerCase();

        String os = "";
        String browser = "";

        //=================OS Info=======================
        if (userAgent.toLowerCase().indexOf("windows") >= 0) {
            os = "Windows";
        } else if (userAgent.toLowerCase().indexOf("mac") >= 0) {
            os = "Mac";
        } else if (userAgent.toLowerCase().indexOf("x11") >= 0) {
            os = "Unix";
        } else if (userAgent.toLowerCase().indexOf("android") >= 0) {
            os = "Android";
        } else if (userAgent.toLowerCase().indexOf("iphone") >= 0) {
            os = "IPhone";
        } else {
            os = "UnKnown, More-Info: " + userAgent;
        }
        //===============Browser===========================
        if (user.contains("edge")) {
            browser = (userAgent.substring(userAgent.indexOf("Edge")).split(" ")[0]).replace("/", "-");
        } else if (user.contains("msie")) {
            String substring = userAgent.substring(userAgent.indexOf("MSIE")).split(";")[0];
            browser = substring.split(" ")[0].replace("MSIE", "IE") + "-" + substring.split(" ")[1];
        } else if (user.contains("safari") && user.contains("version")) {
            browser = (userAgent.substring(userAgent.indexOf("Safari")).split(" ")[0]).split("/")[0]
                    + "-" + (userAgent.substring(userAgent.indexOf("Version")).split(" ")[0]).split("/")[1];
        } else if (user.contains("opr") || user.contains("opera")) {
            if (user.contains("opera")) {
                browser = (userAgent.substring(userAgent.indexOf("Opera")).split(" ")[0]).split("/")[0]
                        + "-" + (userAgent.substring(userAgent.indexOf("Version")).split(" ")[0]).split("/")[1];
            } else if (user.contains("opr")) {
                browser = ((userAgent.substring(userAgent.indexOf("OPR")).split(" ")[0]).replace("/", "-"))
                        .replace("OPR", "Opera");
            }

        } else if (user.contains("chrome")) {
            browser = (userAgent.substring(userAgent.indexOf("Chrome")).split(" ")[0]).replace("/", "-");
        } else if ((user.indexOf("mozilla/7.0") > -1) || (user.indexOf("netscape6") != -1) ||
                (user.indexOf("mozilla/4.7") != -1) || (user.indexOf("mozilla/4.78") != -1) ||
                (user.indexOf("mozilla/4.08") != -1) || (user.indexOf("mozilla/3") != -1)) {
            browser = "Netscape-?";

        } else if (user.contains("firefox")) {
            browser = (userAgent.substring(userAgent.indexOf("Firefox")).split(" ")[0]).replace("/", "-");
        } else if (user.contains("rv")) {
            String IEVersion = (userAgent.substring(userAgent.indexOf("rv")).split(" ")[0]).replace("rv:", "-");
            browser = "IE" + IEVersion.substring(0, IEVersion.length() - 1);
        } else {
            browser = "UnKnown, More-Info: " + userAgent;
        }

        JSONObject jsonObject = new JSONObject();
        jsonObject.put("os", os);
        jsonObject.put("browser", browser);

        return jsonObject;
    }


}
