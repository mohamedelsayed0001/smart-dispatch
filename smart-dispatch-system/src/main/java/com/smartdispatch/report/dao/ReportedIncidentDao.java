package com.smartdispatch.report.dao;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.smartdispatch.report.dto.ReportedIncidentDto;

@Repository
public class ReportedIncidentDao {

    JdbcTemplate jdbctTemplate;

    ReportedIncidentDao(JdbcTemplate jdbcTemplate) {
        this.jdbctTemplate = jdbcTemplate;
    }
    
    public void addIncident(ReportedIncidentDto dto, int userId) {
        String sql = "INSERT INTO incident (type, level, description, latitude, longitude, status, citizen_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
        jdbctTemplate.update(
            sql,
            dto.getType(),
            dto.getLevel(),
            dto.getDescription(),
            dto.getLatitude(),
            dto.getLongitude(),
            "PENDING",
            userId
        );
    }

}
