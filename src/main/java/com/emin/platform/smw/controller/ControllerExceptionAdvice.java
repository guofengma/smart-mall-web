package com.emin.platform.smw.controller;

import com.alibaba.fastjson.JSONObject;
import com.emin.base.controller.BaseController;
import com.emin.base.exception.EminException;
import com.emin.platform.smw.exception.UnauthorizedException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.IOException;

@ControllerAdvice
public class ControllerExceptionAdvice extends BaseController {

    private static final Logger LOGGER = LoggerFactory.getLogger(ControllerExceptionAdvice.class);

    @ExceptionHandler({EminException.class})
    @ResponseBody
    public JSONObject eminExceptionHandler(EminException e) {
        LOGGER.error("业务异常", e);
        JSONObject json = new JSONObject();
        json.put("success", false);
        json.put("message", e.getLocalizedMessage());
        return json;
    }

    @ExceptionHandler({Exception.class})
    @ResponseBody
    public JSONObject exceptionHandler(Exception e) {
        LOGGER.error("系统异常", e);
        JSONObject json = new JSONObject();
        json.put("success", false);
        json.put("message", "接口异常");
        return json;
    }

    @ExceptionHandler({UnauthorizedException.class})
    public void exceptionHandler(UnauthorizedException e) throws IOException {
        LOGGER.error("未授权异常", e);
        JSONObject json = new JSONObject();
        json.put("success", false);
        json.put("code", 401);
        json.put("message", "未授权异常");
        this.getResponse().setStatus(401);
    }

}
