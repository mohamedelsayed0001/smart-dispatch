package com.smartdispatch.emergency_responder.dao;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import com.smartdispatch.emergency_responder.model.*;

import java.sql.Timestamp;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class IncidentDAO {

    private final JdbcTemplate jdbcTemplate;

    private static final String SELECT_BY_ID = "SELECT id, type, level, description, latitude, longitude, status, " +
            "time_reported, time_resolved, citizen_id FROM Incident WHERE id = ?";

    private static final String UPDATE_STATUS = "UPDATE Incident SET status = ?, time_resolved = ? WHERE id = ?";

    private static final String UPDATE_STATUS_WITH_CURRENT_TIME = "UPDATE Incident SET status = ?, time_resolved = CURRENT_TIMESTAMP WHERE id = ?";

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

    @SuppressWarnings("null")
    public Optional<Incident> findById(Integer id) {
        try {
            Incident incident = jdbcTemplate.queryForObject(SELECT_BY_ID, incidentRowMapper, id);
            return Optional.ofNullable(incident);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public int updateStatus(Integer incidentId, String status, Timestamp timeResolved) {
        return jdbcTemplate.update(UPDATE_STATUS, status, timeResolved, incidentId);
    }

    public int updateTimeResolved(Integer incidentId, String status) {
        return jdbcTemplate.update(UPDATE_STATUS_WITH_CURRENT_TIME, status, incidentId);
    }
}
