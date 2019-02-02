package com.emin.platform.smw.util;

import org.apache.commons.codec.digest.DigestUtils;

public class Md5Utils {
	
	public static final String encoderByMd5(String str) {
		String sign = DigestUtils.md5Hex(str);
		return sign;
	}
}
