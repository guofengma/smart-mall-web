package com.emin.platform.smw.util;

import org.apache.commons.lang.ArrayUtils;
import org.apache.commons.lang.StringUtils;
import sun.net.www.MimeTable;

import java.util.*;
import java.util.Map.Entry;

/**
 * @auth Anson
 * @name
 * @date 18-8-30
 * @since 1.0.0
 */
public class LinkHelper {
    private static Map<String, String> types;//contentType集合
    private static List<String> extensions = new ArrayList<>();//后缀集合
    public final static Map<String, String> FILE_TYPE_MAP = new HashMap<>();//文件头集合

    static {
        getAllFileType(); // 初始化文件类型信息
        initContentType(); // 初始化ContentType
        initExtentsion(); // 初始化文件后缀
    }

    /**
     * @param url
     * @param disposition
     * @param contentType
     * @param byteArray
     * @return
     * @author gongml
     * @DateTime 2017年9月7日 上午10:05:00
     * @Desc 获取文件后缀
     */
    public static String getFileType(String url, String disposition, String contentType, byte[] byteArray) {
        String ext = null;
        ext = getTypeByExtenssion(url);
        if (ext != null) {
            return ext;
        }
        ext = getTypeByDisposition(disposition);
        if (ext != null) {
            return ext;
        }
        ext = getTypeByContentType(contentType);
        if (ext != null) {
            return ext;
        }

        ext = getTypeByMimeType(contentType);
        if (ext != null) {
            return ext;
        }

        ext = getFileTypeByStream(byteArray);
        if (ext != null) {
            return ext;
        }

        return ".html";
    }


    /**
     * @param b
     * @return
     * @author gongml
     * @DateTime 2017年9月7日 上午10:05:22
     * @Desc 通过文件头  获取文件后缀
     */
    private static String getFileTypeByStream(byte[] b) {
        if (ArrayUtils.isNotEmpty(b)) {
            b = ArrayUtils.subarray(b, 0, 50);
            String filetypeHex = String.valueOf(getFileHexString(b));
            Iterator<Entry<String, String>> entryiterator = FILE_TYPE_MAP.entrySet().iterator();
            while (entryiterator.hasNext()) {
                Entry<String, String> entry = entryiterator.next();
                String fileTypeHexValue = entry.getValue();
                if (filetypeHex.toUpperCase().startsWith(fileTypeHexValue)) {
                    return entry.getKey();
                }
            }
        }
        return null;
    }

    /**
     * @param b
     * @return
     * @author gongml
     * @DateTime 2017年9月7日 上午10:06:10
     * @Desc 将byte[]转换为16进制字符串
     */
    private static String getFileHexString(byte[] b) {
        StringBuilder stringBuilder = new StringBuilder();
        if (b == null || b.length <= 0) {
            return null;
        }
        for (int i = 0; i < b.length; i++) {
            int v = b[i] & 0xFF;
            String hv = Integer.toHexString(v);
            if (hv.length() < 2) {
                stringBuilder.append(0);
            }
            stringBuilder.append(hv);
        }
        return stringBuilder.toString();
    }

    /**
     * @param linkUrl
     * @return
     * @author gongml
     * @DateTime 2017年9月7日 上午10:06:42
     * @Desc 通过链接的后缀名判断文件的类型
     */
    public static String getTypeByExtenssion(String linkUrl) {
        return getTypeByExtenssion(linkUrl, false);
    }

    /**
     * @param linkUrl
     * @param isRemoveDot 是否删除最后的一个.
     * @return
     * @author gongml
     * @DateTime 2017年9月7日 上午10:06:42
     * @Desc 通过链接的后缀名判断文件的类型
     */
    public static String getTypeByExtenssion(String linkUrl, boolean isRemoveDot) {
        if (linkUrl == null) {
            return null;
        }

        linkUrl = linkUrl.toLowerCase();
        for (String ext : extensions) {
            if (linkUrl.endsWith(ext)) {
                if (isRemoveDot && ext.startsWith(".")) {
                    ext = ext.substring(1);
                }
                return ext;
            }
        }
        return null;
    }

    /**
     * @param disposition
     * @return
     * @author gongml
     * @DateTime 2017年9月7日 上午10:06:48
     * @Desc 通过请求头中的Disposition获取文件名与文件后缀
     */
    private static String getTypeByDisposition(String disposition) {
        String ext = null;
        if (!StringUtils.isEmpty(disposition)) {
            disposition = StringUtils.replace(disposition, "\"", "");
            String[] strs = disposition.split(";");
            for (String string : strs) {
                if (string.toLowerCase().indexOf("filename=") >= 0) {
                    ext = StringUtils.substring(string, string.lastIndexOf("."));
                    break;
                }
            }
        }
        return ext;
    }

    /**
     * @param contentType
     * @return
     * @author gongml
     * @DateTime 2017年9月7日 上午10:07:28
     * @Desc 根据ContentType获取文件后缀
     */
    private static String getTypeByContentType(String contentType) {
        if (types.containsKey(contentType)) {
            return types.get(contentType);
        }

        return null;
    }

    /**
     * @param contentType
     * @return
     * @author gongml
     * @DateTime 2017年9月7日 上午10:07:51
     * @Desc 使用MimeType判断contentType对应的文件后缀
     */
    private static String getTypeByMimeType(String contentType) {
        MimeTable mimeTypes = MimeTable.getDefaultTable();
        return mimeTypes.getContentTypeFor(contentType);
    }

    // 通过文件头判断会出现重复的情况
    private static void getAllFileType() {
        FILE_TYPE_MAP.put(".pdf", "255044462D312E"); // Adobe Acrobat (pdf)
        FILE_TYPE_MAP.put(".doc", "D0CF11E0"); // MS Word
        FILE_TYPE_MAP.put(".xls", "D0CF11E0"); // MS Excel 注意：word 和 excel的文件头一样
        FILE_TYPE_MAP.put(".jpg", "FFD8FF"); // JPEG (jpg)
        FILE_TYPE_MAP.put(".png", "89504E47"); // PNG (png)
        FILE_TYPE_MAP.put(".gif", "47494638"); // GIF (gif)
        FILE_TYPE_MAP.put(".tif", "49492A00"); // TIFF (tif)
        FILE_TYPE_MAP.put(".bmp", "424D"); // Windows Bitmap (bmp)
        FILE_TYPE_MAP.put(".dwg", "41433130"); // CAD (dwg)
        FILE_TYPE_MAP.put(".html", "68746D6C3E"); // HTML (html)
        FILE_TYPE_MAP.put(".rtf", "7B5C727466"); // Rich Text Format (rtf)
        FILE_TYPE_MAP.put(".xml", "3C3F786D6C");
        FILE_TYPE_MAP.put(".zip", "504B0304"); // docx的文件头与zip的一样
        FILE_TYPE_MAP.put(".rar", "52617221");
        FILE_TYPE_MAP.put(".psd", "38425053"); // Photoshop (psd)
        FILE_TYPE_MAP.put(".eml", "44656C69766572792D646174653A"); // Email
        FILE_TYPE_MAP.put(".dbx", "CFAD12FEC5FD746F"); // Outlook Express (dbx)
        FILE_TYPE_MAP.put(".pst", "2142444E"); // Outlook (pst)
        FILE_TYPE_MAP.put(".mdb", "5374616E64617264204A"); // MS Access (mdb)
        FILE_TYPE_MAP.put(".wpd", "FF575043"); // WordPerfect (wpd)
        FILE_TYPE_MAP.put(".eps", "252150532D41646F6265");
        FILE_TYPE_MAP.put(".ps", "252150532D41646F6265");
        FILE_TYPE_MAP.put(".qdf", "AC9EBD8F"); // Quicken (qdf)
        FILE_TYPE_MAP.put(".pwl", "E3828596"); // Windows Password (pwl)
        FILE_TYPE_MAP.put(".wav", "57415645"); // Wave (wav)
        FILE_TYPE_MAP.put(".avi", "41564920");
        FILE_TYPE_MAP.put(".ram", "2E7261FD"); // Real Audio (ram)
        FILE_TYPE_MAP.put(".rm", "2E524D46"); // Real Media (rm)
        FILE_TYPE_MAP.put(".mpg", "000001BA"); //
        FILE_TYPE_MAP.put(".mov", "6D6F6F76"); // Quicktime (mov)
        FILE_TYPE_MAP.put(".asf", "3026B2758E66CF11"); // Windows Media (asf)
        FILE_TYPE_MAP.put(".mid", "4D546864"); // MIDI (mid)
    }

    // 对应的http contenttype
    private static void initContentType() {
        types = new HashMap<String, String>();
        types.put("application/pdf", ".pdf");
        types.put("application/msword", ".doc");
        types.put("text/plain", ".txt");
        types.put("application/x-xls", ".xls");
        types.put("application/-excel", ".xls");
        types.put("text/html", ".html");
        types.put("application/x-rtf", ".rtf");
        types.put("message/rfc822", ".mht");
        types.put("application/x-ppt", ".ppt");
        types.put("image/jpeg", ".jpg");
        types.put("application/vnd.openxmlformats-officedocument.wordprocessingml.template", ".docx");
        types.put("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", ".xlsx");
        types.put("application/vnd.openxmlformats-officedocument.presentationml.presentation", ".pptx");
        types.put("message/rfc822", ".eml");
        types.put("application/xml", ".xml");
    }

    //自定义需要匹配链接的文件后缀，不满足的可以自行添加
    private static void initExtentsion() {
        extensions.add(".pdf");
        extensions.add(".doc");
        extensions.add(".txt");
        extensions.add(".xls");
        extensions.add(".html");
        extensions.add(".rtf");
        extensions.add(".mht");
        extensions.add(".rar");
        extensions.add(".ppt");
        extensions.add(".jpg");
        extensions.add(".docx");
        extensions.add(".xlsx");
        extensions.add(".pptx");
        extensions.add(".eml");
        extensions.add(".zip");
        extensions.add(".docm");
        extensions.add(".xlsm");
        extensions.add(".xlsb");
        extensions.add(".dotx");
        extensions.add(".csv");
    }
}