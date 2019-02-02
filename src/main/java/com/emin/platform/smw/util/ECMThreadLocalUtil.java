package com.emin.platform.smw.util;
import com.emin.base.util.ThreadLocalUtil;


public class ECMThreadLocalUtil extends ThreadLocalUtil{
	
    private static final ThreadLocal<Long> ecmIdLocal = new ThreadLocal<Long>();
    private static final ThreadLocal<String> ecmNameLocal = new ThreadLocal<String>();

    public static Long getEcmId(){
        return ecmIdLocal.get();
    }
    public static void setEcmId(Long ecmId){
    	ecmIdLocal.set(ecmId);
    }
    
    public static String getEcmName(){
        return ecmNameLocal.get();
    }
    public static void setEcmName(String ecmName){
    	ecmNameLocal.set(ecmName);
    }
}
