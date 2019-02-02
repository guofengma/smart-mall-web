package com.emin.platform.smw.util;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.lang3.ObjectUtils;

import com.emin.base.controller.BaseController;

public final class HttpSessionHelper {

    public static final String SESSION_USER_ID_KEY = "userId";
    public static final String SESSION_USER_TYPE_KEY = "userType";
    public static final String SESSION_ECM_ID_KEY = "ecmId";
    public static final String SESSION_ECM_NAME_KEY = "ecmName";

    private final HttpServletRequest request;

    private final HttpServletResponse response;

    public HttpSessionHelper(HttpServletRequest request, HttpServletResponse response) {
        this.request = request;
        this.response = response;
    }

    public static HttpSessionHelper create(HttpServletRequest request, HttpServletResponse response) {
        return new HttpSessionHelper(request, response);
    }

    public static HttpSessionHelper create(BaseController controller) {
        return new HttpSessionHelper(controller.getRequest(), controller.getResponse());
    }

    public boolean isSuperman() {
        return this.sessionUserType() == 1;
    }

    public void clearAllSessionAttr() {
        this.getSession().invalidate();
    }

    public void putSessionUserId(Long userId) {
        this.getSession().setAttribute(SESSION_USER_ID_KEY, userId);
    }

    public void putSessionEcmId(Long ecmId) {
        this.getSession().setAttribute(SESSION_ECM_ID_KEY, ecmId);
    }

    public void putSessionEcmName(String ecmName) {
        this.getSession().setAttribute(SESSION_ECM_NAME_KEY, ecmName);
    }

    public Long sessionUserId() {
        return this.getSessionValue(SESSION_USER_ID_KEY, Long.class);
    }

    public Long sessionEcmId() {
        return this.getSessionValue(SESSION_ECM_ID_KEY, Long.class);
    }

    public String sessionEcmName() {
        return this.getSessionValue(SESSION_ECM_NAME_KEY, String.class);
    }

    public Integer sessionUserType() {
        Integer userType = this.getSessionValue(SESSION_USER_TYPE_KEY, Integer.class);
        return ObjectUtils.defaultIfNull(userType, -1);
    }

    public void putUserType(Integer userType) {
        this.getSession().setAttribute(SESSION_USER_TYPE_KEY, userType);
    }


    public <T> T getSessionValue(String key, Class<T> clazz) {
        return (T) this.getSession().getAttribute(key);
    }

    public void putSessionValue(String key, Object value) {
        this.getSession().setAttribute(key, value);
    }

    public HttpSession getSession() {
        return this.getRequest().getSession();
    }


    public HttpServletRequest getRequest() {
        return request;
    }

    public HttpServletResponse getResponse() {
        return response;
    }

}
