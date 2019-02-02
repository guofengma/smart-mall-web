/**
 *
 */
package com.emin.platform.smw.filter;

import com.emin.base.util.CookieUtil;
import com.emin.platform.smw.annotation.IgnoreIterceptor;
import com.emin.platform.smw.constain.ApplicationConstain;
import com.emin.platform.smw.util.TokenThreadLocalUtil;
import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;
import org.springframework.http.HttpStatus;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.lang.reflect.Method;

/**
 * @author jim.lee
 */
public class PermissionInterceptor extends HandlerInterceptorAdapter {

    private static final Logger LOGGER = Logger.getLogger(PermissionInterceptor.class);

    public static boolean isRequestFromAJAX(HttpServletRequest request) {
        String requestType = request.getHeader("X-Requested-With");
        if ("XMLHttpRequest".equals(requestType)) {
            return true;
        } else {
            return false;
        }
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        if (!this.filterPath(request, handler)) {
            TokenThreadLocalUtil.setIsNoAuthorization(true);
            return true;
        }
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("--------->intercept:" + request.getRequestURI());
        }
        String authorization = CookieUtil.getValue(request, ApplicationConstain.AUTHORIZATION_KEY);
        TokenThreadLocalUtil.setIsNoAuthorization(false);
        boolean validation = true;
        if (StringUtils.isBlank(authorization)) {
            validation = false;
        } else {
            //jwt中的数据按需请求token服务器，并获得解释内容
            TokenThreadLocalUtil.setToken(authorization);
        }
        if (!validation) {
            if (isRequestFromAJAX(request)) {
                response.setStatus(HttpStatus.UNAUTHORIZED.value());
            } else {
                response.sendRedirect("/login");
            }
            return false;
        }
        return true;


    }

    /**
     * 当前返回结果集为true：表示需要去处理拦截，返回false表示不需要拦截
     *
     * @param request
     * @param arg2
     * @return
     */
    private boolean filterPath(HttpServletRequest request, Object arg2) {
        if (HandlerMethod.class.isAssignableFrom(arg2.getClass())) {
            HandlerMethod handlerMethod = (HandlerMethod) arg2;
            Method method = handlerMethod.getMethod();
            IgnoreIterceptor ignoreIterceptor = method.getAnnotation(IgnoreIterceptor.class);
            if (ignoreIterceptor != null) {
                //标志位true的时候，表示当前路径不需要拦截，则返回false
                return !ignoreIterceptor.value();
            } else {
                return true;
            }
        }
        return true;
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler,
                           ModelAndView modelAndView) throws Exception {

    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex)
            throws Exception {
    }

    @Override
    public void afterConcurrentHandlingStarted(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
    }

}
