package com.smartdispatch.dispatcher.daos.imp;

import com.smartdispatch.dispatcher.daos.IncidentDao;
import com.smartdispatch.dispatcher.domains.entities.Incident;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
@Repository
public class IncidentDaoImp implements IncidentDao {
    private final JdbcTemplate jdbcTemplate;
    private static final RowMapper<Incident> INCIDENT_ROW_MAPPER= new RowMapperIncident();
    public IncidentDaoImp(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @SuppressWarnings("null")
    @Override
    public List<Incident> getAllPendingIncidents() {
        String sql = "SELECT * FROM Incident WHERE status ='PENDING'";
        return jdbcTemplate.query(sql,INCIDENT_ROW_MAPPER);
    }

    @SuppressWarnings("null")
    @Override
    public List<Incident> getAllIncidents() {
        String sql = "SELECT * FROM Incident";
        return jdbcTemplate.query(sql,INCIDENT_ROW_MAPPER);
    }

    @Override
    public boolean updateStatus(Integer incidentId, String status) {
        String sql = "UPDATE Incident SET status = ? WHERE id = ?";
        int rowsAffected = jdbcTemplate.update(sql, status, incidentId);
        return rowsAffected > 0;
    }

    @SuppressWarnings("null")
    @Override
    public Incident findById(Integer id) {
        String sql = "SELECT * FROM Incident WHERE id = ?";
        List<Incident> results = jdbcTemplate.query(sql, INCIDENT_ROW_MAPPER, id);
        return results.isEmpty() ? null : results.get(0);
    }

    @Override
    public Incident findClosestPendingIncident(String type, double latitude, double longitude) {
        String sql = "SELECT * FROM Incident " +
                     "WHERE status = 'PENDING' AND type = ? " +
                     "ORDER BY (" +
                     "   (CASE level WHEN 'HIGH' THEN 0 WHEN 'MEDIUM' THEN 50 ELSE 100 END) " +
                     "   + 10 * ((latitude - ?) * (latitude - ?) + (longitude - ?) * (longitude - ?)) " +
                     "   - 2 * TIMESTAMPDIFF(MINUTE, time_reported, NOW()) " +
                     ") ASC " +
                     "LIMIT 1";

        List<Incident> results = jdbcTemplate.query(sql, INCIDENT_ROW_MAPPER, type, latitude, latitude, longitude, longitude);
        return results.isEmpty() ? null : results.get(0);
    }

    private static class RowMapperIncident implements RowMapper<Incident> {

        @Override
        public Incident mapRow(ResultSet rs, int rowNum) throws SQLException {
            Incident incident = new Incident();
            incident.setId(rs.getInt("id"));
            incident.setType(rs.getString("type"));
            incident.setLevel(rs.getString("level"));
            incident.setDescription(rs.getString("description"));
            incident.setLatitude(rs.getDouble("latitude"));
            incident.setLongitude(rs.getDouble("longitude"));
            incident.setStatus(rs.getString("status"));
            incident.setTimeReported(rs.getTimestamp("time_reported").toLocalDateTime());
            if (rs.getTimestamp("time_resolved") != null) {
                incident.setTimeResolved(rs.getTimestamp("time_resolved").toLocalDateTime());
            }
            incident.setCitizenId(rs.getInt("citizen_id"));
            return incident;

        }
    }
}
