package com.emin.platform.smw.util;

public final class ArrayUitl {

	public static final Long[] toLongArr(String str) {
		if (null == str || str.isEmpty()) {
			return new Long[0];
		}
		String[] strs = str.split(",");
		Long[] longs = new Long[strs.length];
		try {
			for (int i = 0; i < longs.length; i++) {
				longs[i] = Long.valueOf(strs[i]);
			}
			return longs;
		} catch (NumberFormatException e) {
			return new Long[0];
		}

	}
	
	public static final Integer[] toIntegerArr(String str) {
		if (null == str || str.isEmpty()) {
			return new Integer[0];
		}
		String[] strs = str.split(",");
		Integer[] longs = new Integer[strs.length];
		try {
			for (int i = 0; i < longs.length; i++) {
				longs[i] = Integer.valueOf(strs[i]);
			}
			return longs;
		} catch (NumberFormatException e) {
			return new Integer[0];
		}

	}
}
