package com.emin.platform.smw.util;

import org.apache.log4j.Logger;

import com.emin.base.util.ThreadLocalUtil;


public class TokenThreadLocalUtil extends ThreadLocalUtil {

    private static final Logger LOGGER = Logger.getLogger(TokenThreadLocalUtil.class);

    private static final ThreadLocal<UserClaim> claimLocal = new ThreadLocal<UserClaim>();

    private static final ThreadLocal<String> jwtLocal = new ThreadLocal<String>();

    private static final ThreadLocal<Boolean> isNoAuthorization = new ThreadLocal<>();

    public static UserClaim getUserClaim() {
        return claimLocal.get();
    }

    public static void setUserClaim(UserClaim claim) {
        claimLocal.set(claim);
    }

    public static String getToken() {
        return jwtLocal.get();
    }

    public static void setToken(String token) {
        jwtLocal.set(token);
    }

    public static Boolean isNoAuthorization() {
        Boolean isNoAuth = isNoAuthorization.get();
        boolean isNoAuthConfirm = isNoAuth == null || isNoAuth;
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("是否不需要鉴权的服务,isNoAuth=" + isNoAuth + ",isNoAuthConfirm=" + isNoAuthConfirm);
        }
        return isNoAuthConfirm;
    }

    public static void setIsNoAuthorization(boolean isNoAuthor) {
        isNoAuthorization.set(isNoAuthor);
    }

}
