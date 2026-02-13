package com.smartdispatch.report.dao;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import com.smartdispatch.report.dto.ReportedIncidentDto;
import com.smartdispatch.report.dto.AdminIncidentReportDto;

@Repository
public class ReportedIncidentDao {

    private final JdbcTemplate jdbcTemplate;

    public ReportedIncidentDao(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Inserts a new incident and returns the generated id.
     */
    public Long addIncident(ReportedIncidentDto dto, int userId) {
        final String sql = "INSERT INTO Incident (type, level, description, latitude, longitude, status, time_reported, citizen_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();
        Timestamp now = Timestamp.valueOf(java.time.LocalDateTime.now());

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, dto.getType());
            ps.setString(2, dto.getLevel());
            ps.setString(3, dto.getDescription());
            ps.setDouble(4, dto.getLatitude());
            ps.setDouble(5, dto.getLongitude());
            ps.setString(6, "PENDING");
            ps.setTimestamp(7, now);
            ps.setInt(8, userId);
            return ps;
        }, keyHolder);

        Number key = keyHolder.getKey();
        return key != null ? key.longValue() : -1;
    }

    @SuppressWarnings("deprecation")
    public AdminIncidentReportDto getIncidentById(int id) {
        final String sql = "SELECT i.id, i.type, i.level, i.description, i.latitude, i.longitude, i.status, i.time_reported, i.time_resolved, u.name AS reporter_name "
                + "FROM Incident i LEFT JOIN `User` u ON i.citizen_id = u.id WHERE i.id = ?";

        return jdbcTemplate.queryForObject(sql, new Object[] { id }, (rs, rowNum) -> {
            AdminIncidentReportDto dto = new AdminIncidentReportDto();
            dto.setId(rs.getLong("id"));
            dto.setType(rs.getString("type"));
            dto.setLevel(rs.getString("level"));
            dto.setDescription(rs.getString("description"));
            dto.setLatitude(rs.getDouble("latitude"));
            dto.setLongitude(rs.getDouble("longitude"));
            dto.setStatus(rs.getString("status"));
            Timestamp tReported = rs.getTimestamp("time_reported");
            if (tReported != null) dto.setTimeReported(tReported.toLocalDateTime());
            Timestamp tResolved = rs.getTimestamp("time_resolved");
            if (tResolved != null) dto.setTimeResolved(tResolved.toLocalDateTime());
            dto.setReporterName(rs.getString("reporter_name"));
            return dto;
        });
    }

    public List<AdminIncidentReportDto> getAllIncidents() {
        final String sql = "SELECT i.id, i.type, i.level, i.description, i.latitude, i.longitude, i.status, i.time_reported, i.time_resolved, u.name AS reporter_name "
                + "FROM Incident i LEFT JOIN `User` u ON i.citizen_id = u.id ORDER BY i.time_reported DESC";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            AdminIncidentReportDto dto = new AdminIncidentReportDto();
            dto.setId(rs.getLong("id"));
            dto.setType(rs.getString("type"));
            dto.setLevel(rs.getString("level"));
            dto.setDescription(rs.getString("description"));
            dto.setLatitude(rs.getDouble("latitude"));
            dto.setLongitude(rs.getDouble("longitude"));
            dto.setStatus(rs.getString("status"));
            Timestamp tReported = rs.getTimestamp("time_reported");
            if (tReported != null) dto.setTimeReported(tReported.toLocalDateTime());
            Timestamp tResolved = rs.getTimestamp("time_resolved");
            if (tResolved != null) dto.setTimeResolved(tResolved.toLocalDateTime());
            dto.setReporterName(rs.getString("reporter_name"));
            return dto;
        });
    }

    @SuppressWarnings({ "deprecation", "null" })
    public List<AdminIncidentReportDto> getAllIncidents(Integer id, String status, String type, String level, String text) {
        StringBuilder sql = new StringBuilder(
            "SELECT i.id, i.type, i.level, i.description, i.latitude, i.longitude, i.status, i.time_reported, i.time_resolved, u.name AS reporter_name "
            + "FROM Incident i LEFT JOIN `User` u ON i.citizen_id = u.id WHERE 1=1"
        );
        
        List<Object> params = new ArrayList<>();
        
        if (id != null) {
            sql.append(" AND i.id = ?");
            params.add(id);
        }
        
        if (status != null && !status.isEmpty()) {
            sql.append(" AND i.status = ?");
            params.add(status);
        }
        
        if (type != null && !type.isEmpty()) {
            sql.append(" AND i.type = ?");
            params.add(type);
        }
        
        if (level != null && !level.isEmpty()) {
            sql.append(" AND i.level = ?");
            params.add(level);
        }
        
        if (text != null && !text.isEmpty()) {
            sql.append(" AND (i.description LIKE ? OR u.name LIKE ?)");
            String searchPattern = "%" + text + "%";
            params.add(searchPattern);
            params.add(searchPattern);
        }
        
        sql.append(" ORDER BY i.time_reported DESC");
        
        return jdbcTemplate.query(sql.toString(), params.toArray(), (rs, rowNum) -> {
            AdminIncidentReportDto dto = new AdminIncidentReportDto();
            dto.setId(rs.getLong("id"));
            dto.setType(rs.getString("type"));
            dto.setLevel(rs.getString("level"));
            dto.setDescription(rs.getString("description"));
            dto.setLatitude(rs.getDouble("latitude"));
            dto.setLongitude(rs.getDouble("longitude"));
            dto.setStatus(rs.getString("status"));
            Timestamp tReported = rs.getTimestamp("time_reported");
            if (tReported != null) dto.setTimeReported(tReported.toLocalDateTime());
            Timestamp tResolved = rs.getTimestamp("time_resolved");
            if (tResolved != null) dto.setTimeResolved(tResolved.toLocalDateTime());
            dto.setReporterName(rs.getString("reporter_name"));
            return dto;
        });
    }

}
