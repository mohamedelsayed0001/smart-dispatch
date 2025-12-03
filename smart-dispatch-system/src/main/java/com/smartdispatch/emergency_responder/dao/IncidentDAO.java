package com.smartdispatch.emergency_responder.dao;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import com.smartdispatch.emergency_responder.model.*;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class IncidentDAO {

    private final JdbcTemplate jdbcTemplate;

    private static final String SELECT_BY_ID = 
        "SELECT id, type, level, description, latitude, longitude, status, " +
        "time_reported, time_resolved, citizen_id FROM Incident WHERE id = ?";
    
    private static final String SELECT_BY_STATUS = 
        "SELECT id, type, level, description, latitude, longitude, status, " +
        "time_reported, time_resolved, citizen_id FROM Incident WHERE status = ?";
    
    private static final String UPDATE_STATUS = 
        "UPDATE Incident SET status = ?, time_resolved = ? WHERE id = ?";

    private final RowMapper<Incident> incidentRowMapper = (rs, rowNum) -> {
        Incident incident = new Incident();
        incident.setId(rs.getInt("id"));
        incident.setType(rs.getString("type"));
        incident.setLevel(rs.getString("level"));
        incident.setDescription(rs.getString("description"));
        incident.setLatitude(rs.getDouble("latitude"));
        incident.setLongitude(rs.getDouble("longitude"));
        incident.setStatus(rs.getString("status"));
        
        Timestamp timeReported = rs.getTimestamp("time_reported");
        if (timeReported != null) {
            incident.setTimeReported(timeReported.toLocalDateTime());
        }
        
        Timestamp timeResolved = rs.getTimestamp("time_resolved");
        if (timeResolved != null) {
            incident.setTimeResolved(timeResolved.toLocalDateTime());
        }
        
        int citizenId = rs.getInt("citizen_id");
        if (!rs.wasNull()) {
            incident.setCitizenId(citizenId);
        }
        
        return incident;
    };

    public Optional<Incident> findById(Integer id) {
        try {
            Incident incident = jdbcTemplate.queryForObject(SELECT_BY_ID, incidentRowMapper, id);
            return Optional.ofNullable(incident);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public List<Incident> findByStatus(String status) {
        return jdbcTemplate.query(SELECT_BY_STATUS, incidentRowMapper, status);
    }

    public List<Incident> findByStatusOrderByTimeReportedAsc(String status) {
        String sql = "SELECT id, type, level, description, latitude, longitude, status, " +
                    "time_reported, time_resolved, citizen_id FROM Incident " +
                    "WHERE status = ? ORDER BY time_reported ASC";
        return jdbcTemplate.query(sql, incidentRowMapper, status);
    }

    public List<Incident> findAll() {
        String sql = "SELECT id, type, level, description, latitude, longitude, status, " +
                    "time_reported, time_resolved, citizen_id FROM Incident";
        return jdbcTemplate.query(sql, incidentRowMapper);
    }

    public int updateStatus(Integer incidentId, String status, Timestamp timeResolved) {
        return jdbcTemplate.update(UPDATE_STATUS, status, timeResolved, incidentId);
    }

    public int save(Incident incident) {
        String sql = "INSERT INTO Incident (type, level, description, latitude, longitude, " +
                    "status, time_reported, citizen_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        return jdbcTemplate.update(sql, 
            incident.getType(),
            incident.getLevel(),
            incident.getDescription(),
            incident.getLatitude(),
            incident.getLongitude(),
            incident.getStatus(),
            Timestamp.valueOf(incident.getTimeReported()),
            incident.getCitizenId()
        );
    }

    public int update(Incident incident) {
        String sql = "UPDATE Incident SET type = ?, level = ?, description = ?, " +
                    "latitude = ?, longitude = ?, status = ?, time_resolved = ?, citizen_id = ? " +
                    "WHERE id = ?";
        
        Timestamp timeResolved = incident.getTimeResolved() != null ? 
            Timestamp.valueOf(incident.getTimeResolved()) : null;
        
        return jdbcTemplate.update(sql, 
            incident.getType(),
            incident.getLevel(),
            incident.getDescription(),
            incident.getLatitude(),
            incident.getLongitude(),
            incident.getStatus(),
            timeResolved,
            incident.getCitizenId(),
            incident.getId()
        );
    }

    public int deleteById(Integer id) {
        String sql = "DELETE FROM Incident WHERE id = ?";
        return jdbcTemplate.update(sql, id);
    }
}
