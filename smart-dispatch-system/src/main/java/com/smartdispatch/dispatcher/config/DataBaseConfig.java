package com.smartdispatch.dispatcher.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;

@Configuration
public class DataBaseConfig {
    @Bean
    public JdbcTemplate jdbcTemplate(final DataSource dataSource){
        return new JdbcTemplate(dataSource);
    }
}
