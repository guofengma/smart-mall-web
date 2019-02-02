package com.emin.platform.smw.filter;

import java.lang.reflect.Method;
import java.util.Objects;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import com.emin.base.exception.EminException;
import com.emin.platform.smw.annotation.IgnoreIterceptor;
import com.emin.platform.smw.interfaces.UserApiFeign;
import com.emin.platform.smw.util.ECMThreadLocalUtil;
import com.emin.platform.smw.util.HttpSessionHelper;

public class UserFilter implements HandlerInterceptor {
	private Logger logger = LoggerFactory.getLogger(UserFilter.class);

	public final UserApiFeign userApiFeign;

	public UserFilter(UserApiFeign userApiFeign) {
		this.userApiFeign = userApiFeign;
	}

	@Override
	public void afterCompletion(HttpServletRequest arg0, HttpServletResponse arg1, Object arg2, Exception arg3)
			throws Exception {

	}

	@Override
	public void postHandle(HttpServletRequest arg0, HttpServletResponse arg1, Object arg2, ModelAndView arg3)
			throws Exception {

	}

	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
//		try {
//			// String token = "";
//			// if (request.getHeader("token") != null) {
//			// token = request.getHeader("token").toString();
//			// }
//			// if (request.getParameter("token") != null) {
//			// token = request.getParameter("token").toString();
//			// }
//			// if (token!=null && token.length() > 0) {
//			// res = personApiFeign.userValidate(token);
//			// Boolean isSuccess = res.getBoolean("success");
//			// if (!isSuccess) {
//			// response.sendRedirect("/login");
//			// return false;
//			// }
//			// }
//			HttpSessionHelper sessionHelper = HttpSessionHelper.create(request, response);
//			Long userId = sessionHelper.sessionUserId();
//			Long ecmId = sessionHelper.sessionEcmId();
//			String ecmName = sessionHelper.sessionEcmName();
//			boolean isFilterPath = this.filterPath(request, arg2);
//			String ecmIdStr = request.getHeader("ecmId");
//			if (Objects.isNull(ecmId)) {
//				// 当前对象为空的时候
//				if (StringUtils.isNotBlank(ecmIdStr)) {
//					try {
//						ecmId = Long.valueOf(ecmIdStr);
//					} catch (NumberFormatException e) {
//
//					}
//				}
//			}
//			if (StringUtils.isBlank(ecmName)) {
//				ecmName = request.getHeader("ecmName");
//			}
//			if (!isFilterPath) {
//				return true;
//			}
//			boolean validation = true;
//			if (Objects.isNull(userId)) {
//				validation = false;
//			} else if (!sessionHelper.isSuperman() && Objects.isNull(ecmId)) {
//				validation = true;
//			} else {
//				ECMThreadLocalUtil.setEcmId(ecmId);
//				ECMThreadLocalUtil.setEcmName(ecmName);
//			}
//			if (!validation) {
//				response.sendRedirect("/login");
//			}
//			return validation;
//		} catch (EminException e) {
//			logger.error(e.getLocalizedMessage(), e);
//		} catch (Exception e) {
//			logger.error(e.getMessage(), e);
//		}
		
		try {
	        HttpSessionHelper sessionHelper = HttpSessionHelper.create(request, response);
	
	        Long userId = sessionHelper.sessionUserId();
	        Long ecmId = sessionHelper.sessionEcmId();
	        String ecmName = sessionHelper.sessionEcmName();
	        boolean isFilterPath = this.filterPath(request, handler);
	        String ecmIdStr = request.getHeader("ecmId");
	        if (Objects.isNull(ecmId)) {
	            //当前对象为空的时候
	            if (StringUtils.isNotBlank(ecmIdStr)) {
	                try {
	                    ecmId = Long.valueOf(ecmIdStr);
	                } catch (NumberFormatException e) {
	
	                }
	            }
	        }
	
	        logger.info(" 当前session的关心的数据sessionId={},userId={},ecmId={},ecmName={}",sessionHelper.getSession().getId(),
	                userId,ecmId,ecmName);
	
	        if (StringUtils.isBlank(ecmName)) {
	            ecmName = request.getHeader("ecmName");
	        }
	        if (!isFilterPath) {
	            return true;
	        }
	        boolean validation = true;
	
	        if (Objects.isNull(userId)) {
	            logger.info("session的userId={}为空,则验证不通过",userId);
	            validation = false;
	        } else if (!sessionHelper.isSuperman() && Objects.isNull(ecmId)) {
	            logger.info("当前不是超级管理员，但ecmId为空");
	            validation = true;
	        } else {
	            ECMThreadLocalUtil.setEcmId(ecmId);
	            ECMThreadLocalUtil.setEcmName(ecmName);
	        }
	        if (!validation) {
	            logger.info("验证不通过，则当前跳转到登录界面");
	            response.sendRedirect("/login");
	        }
	        return validation;
	    }catch (NullPointerException e){
	        logger.info("未找到相关session信息，则当前跳转到登录界面");
	        response.sendRedirect("/login");
	    }catch (EminException e) {
	        logger.error(e.getLocalizedMessage(), e);
	    } catch (Exception e) {
	        logger.error(e.getMessage(), e);
	    }


		return false;
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

}
