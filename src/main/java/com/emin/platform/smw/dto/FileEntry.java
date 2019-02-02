package com.emin.platform.smw.dto;

/**
 *@auth Anson
 *@name 文件信息
 *@date 18-8-31
 *@since 1.0.0
 *
 */
public class FileEntry {

    private String fileName;

    private String urlPath;

    public FileEntry() {
    }

    public FileEntry(String fileName, String urlPath) {
        this.fileName = fileName;
        this.urlPath = urlPath;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getUrlPath() {
        return urlPath;
    }

    public void setUrlPath(String urlPath) {
        this.urlPath = urlPath;
    }
}
