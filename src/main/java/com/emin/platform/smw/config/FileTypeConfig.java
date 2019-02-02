package com.emin.platform.smw.config;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;
import java.util.Set;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FileTypeConfig {
	public static final String FILE_TYPE_PATH="/file.type.properties";
	
	@Bean
	FileResourceType fileResoureTypeBean() throws IOException {
		InputStream io = FileTypeConfig.class.getResourceAsStream(FILE_TYPE_PATH);
		Properties properties = new Properties();
		properties.load(io);
		final FileResourceType type = new FileResourceType(properties.size());
		Set<Map.Entry<Object, Object>> set = properties.entrySet();
		for (Map.Entry<Object, Object> entity : set) {
			type.put(entity.getKey().toString(), entity.getValue().toString());
		}
		return type;
	}
	
	
	
	
	public static class FileResourceType extends HashMap<String, String>{

		public FileResourceType() {
			super();
		}

		public FileResourceType(int initialCapacity, float loadFactor) {
			super(initialCapacity, loadFactor);
		}

		public FileResourceType(int initialCapacity) {
			super(initialCapacity);
		}

		public FileResourceType(Map<? extends String, ? extends String> m) {
			super(m);
		}
		
		
		
	}
}
