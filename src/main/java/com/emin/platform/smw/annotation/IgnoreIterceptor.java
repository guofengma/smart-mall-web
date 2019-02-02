package com.emin.platform.smw.annotation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 是否确定全局忽略当前拦截方法
 * @author Administrator
 *
 */
@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface IgnoreIterceptor {

	/**
	 * true 表示不拦截，false标识拦截
	 * @return
	 */
	boolean value() default true;
}
