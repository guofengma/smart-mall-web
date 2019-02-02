/**
 * 
 */
package com.emin.platform.smw.interfaces;

import com.alibaba.fastjson.JSONObject;
import com.emin.base.exception.EminException;

/**
 * @author jim.lee
 *
 */
public class ResultCheckUtil {

	public static void check(JSONObject result) {
		if(result==null || result.isEmpty()) {
			throw new EminException("PERM_WEB_0.0.1");
		}
		if(!result.containsKey("success")) {
			throw new EminException("PERM_WEB_0.0.1");
		}
		if(!result.getBooleanValue("success")) {
			throw new EminException(result.getString("code"));
		}
	}
}
