'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var DateUtil = function () {

	var getTime = function getTime(p) {
		// 获取对象集合的数据编号集合
		var dstr, time;

		p = p ? p : {};

		if (p.year && p.month && p.date) {
			dstr = p.year + '/' + p.month + '/' + p.date;
			if (p.hours && p.minutes && p.seconds) {
				dstr += ' ' + p.hours + ':' + p.minutes + ':' + p.seconds;
			}
		}
		time = dstr ? new Date(dstr).getTime() : new Date().getTime();

		return time;
	},
	    millisToTimePeriod = function millisToTimePeriod(millis) {
		var miao = Math.ceil(parseInt(millis) / 1000),
		    fen = miao > 60 ? Math.floor(miao / 60) : 0,
		    shi = fen > 60 ? Math.floor(fen / 60) : 0,
		    tian = shi > 24 ? Math.floor(shi / 24) : 0,
		    yue = tian > 30 ? Math.floor(tian / 30) : 0;

		miao = fen > 0 ? miao - fen * 60 : miao;
		fen = shi > 0 ? fen - shi * 60 : fen;
		shi = tian > 0 ? shi - tian * 24 : shi;
		tian = yue > 0 ? tian - yue * 30 : tian;

		yue = yue > 0 ? yue + ' 月 ' : '';
		tian = tian > 0 ? tian + ' 天 ' : '';
		shi = shi > 0 ? shi + ' 小时 ' : '';
		fen = fen > 0 ? fen + ' 分 ' : '';
		miao = miao > 0 ? miao + ' 秒 ' : '';

		if (yue.length > 0) {
			return yue + tian;
		} else if (tian.length > 0) {
			return tian + shi;
		} else if (shi.length > 0) {
			return shi + fen;
		} else if (fen.length > 0) {
			return fen + miao;
		}
	},
	    formatDate = function formatDate(date, format) {
		var v = "";
		date = new Date(date);
		if (typeof date == "string" || (typeof date === 'undefined' ? 'undefined' : _typeof(date)) != "object") {
			return;
		}

		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		var day = date.getDate();
		var hour = date.getHours();
		var minute = date.getMinutes();
		var second = date.getSeconds();
		var weekDay = date.getDay();
		var ms = date.getMilliseconds();
		var weekDayString = "";
		if (weekDay == 1) {
			weekDayString = "星期一";
		} else if (weekDay == 2) {
			weekDayString = "星期二";
		} else if (weekDay == 3) {
			weekDayString = "星期三";
		} else if (weekDay == 4) {
			weekDayString = "星期四";
		} else if (weekDay == 5) {
			weekDayString = "星期五";
		} else if (weekDay == 6) {
			weekDayString = "星期六";
		} else if (weekDay == 7) {
			weekDayString = "星期日";
		}

		v = format;
		//Year 
		v = v.replace(/yyyy/g, year);
		v = v.replace(/YYYY/g, year);
		v = v.replace(/yy/g, (year + "").substring(2, 4));
		v = v.replace(/YY/g, (year + "").substring(2, 4));

		//Month 
		var monthStr = "0" + month;
		v = v.replace(/MM/g, monthStr.substring(monthStr.length - 2));

		//Day 
		var dayStr = "0" + day;
		v = v.replace(/dd/g, dayStr.substring(dayStr.length - 2));

		//hour 
		var hourStr = "0" + hour;
		v = v.replace(/HH/g, hourStr.substring(hourStr.length - 2));
		v = v.replace(/hh/g, hourStr.substring(hourStr.length - 2));

		//minute 
		var minuteStr = "0" + minute;
		v = v.replace(/mm/g, minuteStr.substring(minuteStr.length - 2));

		//Millisecond 
		v = v.replace(/sss/g, ms);
		v = v.replace(/SSS/g, ms);

		//second 
		var secondStr = "0" + second;
		v = v.replace(/ss/g, secondStr.substring(secondStr.length - 2));
		v = v.replace(/SS/g, secondStr.substring(secondStr.length - 2));

		//weekDay 
		v = v.replace(/E/g, weekDayString);

		return v;
	};

	return {
		getTime: getTime,
		millisToTimePeriod: millisToTimePeriod,
		formatDate: formatDate
	};
}();