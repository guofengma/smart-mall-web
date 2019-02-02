package com.emin.platform.smw.util;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;

public final class DateUtil {
 /**
     * 获取起止日期
     * @param sdf 需要显示的日期格式
     * @param date 需要参照的日期
     * @param n 最近n周
     * @param option 0 开始日期；1 结束日期
     * @param k 0 包含本周 1 不包含本周
     * @return
     */
    public static String getFromToDate(SimpleDateFormat sdf, Date date, int n, int option, int k) {
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(date);
        int dayOfWeek = calendar.get(Calendar.DAY_OF_WEEK) - 1;
        int offset = 0 == option ? 1 - dayOfWeek : 7 - dayOfWeek;
        int amount = 0 == option ? offset - (n - 1  + k) * 7 : offset - k * 7;
        calendar.add(Calendar.DATE, amount);
        return sdf.format(calendar.getTime());
    }
 
    /**
     * 根据当前日期获得最近n周的日期区间（包含本周）
     * @param n
     * @param sdf
     * @return
     */
    public static String getNWeekTimeInterval(int n, SimpleDateFormat sdf) {
        String beginDate = getFromToDate(sdf, new Date(), n, 0, 0);
        String endDate = getFromToDate(sdf, new Date(), n, 1, 0);
        return beginDate + "," + endDate;
    }
 
    /**
     * 根据当前日期获得最近n周的日期区间（不包含本周）
     * @param n
     * @param sdf
     * @return
     */
    public static String getNWeekTimeIntervalTwo(int n, SimpleDateFormat sdf) {
        String beginDate = getFromToDate(sdf, new Date(), n, 0, 1);
        String endDate = getFromToDate(sdf, new Date(), n, 1, 1);
        return beginDate + "," + endDate;
    }
 
    /**
     * 根据当前日期获得本周的日期区间（本周周一和周日日期）
     * @param sdf
     * @return
     */
    public static String getThisWeekTimeInterval(SimpleDateFormat sdf) {
        return getNWeekTimeInterval(1, sdf);
    }
 
    /**
     * 根据当前日期获得上周的日期区间（上周周一和周日日期）
     * @param sdf
     * @return
     */
    public static String getLastWeekTimeInterval(SimpleDateFormat sdf) {
        return getNWeekTimeIntervalTwo(1, sdf);
    }

    /**
     * 本日时间戳区间
     * @return
     */
    public static String rangeToday() {
        Calendar calendar = Calendar.getInstance();
        Date now = new Date();
        calendar.setTime(now);
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        Long beginTime = calendar.getTime().getTime();
        // String beginTime = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(calendar.getTime());
        calendar.set(Calendar.HOUR_OF_DAY, 23);
        calendar.set(Calendar.MINUTE, 59);
        calendar.set(Calendar.SECOND, 59);
        Long endTime = calendar.getTime().getTime();
        // String endTime = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(calendar.getTime());
        return beginTime + "," + endTime;
    }

    /**
     * 昨日时间戳区间
     * @return
     */
    public static String rangeYesterday() {
        Calendar calendar = Calendar.getInstance();
        Date now = new Date();
        calendar.setTime(now);
        calendar.add(Calendar.DATE, -1);
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        Long beginTime = calendar.getTime().getTime();
        // String beginTime = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(calendar.getTime());
        calendar.set(Calendar.HOUR_OF_DAY, 23);
        calendar.set(Calendar.MINUTE, 59);
        calendar.set(Calendar.SECOND, 59);
        Long endTime = calendar.getTime().getTime();
        // String endTime = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(calendar.getTime());
        return beginTime + "," + endTime;
    }
    
    /**
     * 本周时间戳区间
     * @return
     */
    public static String rangeWeek() {
        Calendar calendar = Calendar.getInstance();
        Date now = new Date();
        calendar.setTime(now);
        calendar.set(Calendar.HOUR_OF_DAY, 23);
        calendar.set(Calendar.MINUTE, 59);
        calendar.set(Calendar.SECOND, 59);
        calendar.set(Calendar.MILLISECOND, 0);
        // String endTime = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(calendar.getTime());
        Long endTime = calendar.getTime().getTime();
        Integer dayOfWeek = calendar.get(Calendar.DAY_OF_WEEK);
        calendar.add(Calendar.DATE, 1 - (dayOfWeek - 1));
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        // String beginTime = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(calendar.getTime());
        Long beginTime = calendar.getTime().getTime();
        return beginTime + "," + endTime;
    }

    public static void main(String[] args) {
        System.out.println(rangeWeek());
    }
	
}
