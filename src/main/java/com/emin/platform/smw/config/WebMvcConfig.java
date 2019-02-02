package com.emin.platform.smw.config;


import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Configurable;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.ContentNegotiationConfigurer;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;
import org.springframework.web.servlet.view.freemarker.FreeMarkerViewResolver;

import com.emin.platform.smw.constain.ApplicationConstain;
import com.emin.platform.smw.filter.PermissionInterceptor;
import com.emin.platform.smw.interfaces.UserApiFeign;
import com.emin.platform.smw.util.TokenThreadLocalUtil;

import feign.Feign;
import freemarker.template.TemplateExceptionHandler;

@Configurable
@EnableWebMvc
public class WebMvcConfig extends WebMvcConfigurerAdapter{

	@Autowired
	UserApiFeign userApiFeign;
	
	@Override
	public void configureContentNegotiation(ContentNegotiationConfigurer configurer) {
		
        configurer.favorPathExtension(false);
    }
	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
	    registry.addResourceHandler("/js/**")
	            .addResourceLocations("classpath:/static/js/");
	    registry.addResourceHandler("/css/**")
	    		.addResourceLocations("classpath:/static/css/");
	    registry.addResourceHandler("/img/**")
				.addResourceLocations("classpath:/static/img/");
	    registry.addResourceHandler("/fonts/**")
				.addResourceLocations("classpath:/static/fonts/");
	    registry.addResourceHandler("/plugins/**")
				.addResourceLocations("classpath:/static/plugins/");
	    
	    
	}
	
	@Override
    public void addInterceptors(InterceptorRegistry registry) {
		registry.addInterceptor(new PermissionInterceptor()).addPathPatterns("/**")
		.excludePathPatterns("/login","/getValidImg","/loginIn","/error");
	}
	@Bean
	public Object2JSONTag object2JSONTag() {
		return new Object2JSONTag();
	}
	
	@Bean
    public OperationValidationTag operationValidationTag() {
        return new OperationValidationTag();
    }
	
	@Bean
	public CommandLineRunner customFreemarker(FreeMarkerViewResolver resolver) {
		return new CommandLineRunner() {
			@Autowired
			private freemarker.template.Configuration configuration;

			@Override
			public void run(String... strings) throws Exception {
				configuration.setLogTemplateExceptions(false);
				configuration.setTemplateExceptionHandler(TemplateExceptionHandler.IGNORE_HANDLER);
				configuration.setNumberFormat("#");
				configuration.setSharedVariable("obj2json", object2JSONTag());
				configuration.setSharedVariable("codeValidation", operationValidationTag());
				resolver.setViewClass(CustomFreeMarkerView.class);
			}
		};
	}
	
	@Bean
    public Feign.Builder feignBuilder() {
        return Feign.builder().requestInterceptor(template -> {
        	if(TokenThreadLocalUtil.isNoAuthorization()){
        		 template.header("noAuthorization", "true");
        	}
        	
            String token = TokenThreadLocalUtil.getToken();
            if (!StringUtils.isBlank(token)) {
                template.header(ApplicationConstain.AUTHORIZATION_KEY, token);
            }
        });
    }
	
}
