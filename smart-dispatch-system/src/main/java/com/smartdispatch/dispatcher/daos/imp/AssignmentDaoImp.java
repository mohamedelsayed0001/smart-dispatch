package com.smartdispatch.dispatcher.daos.imp;

import com.smartdispatch.dispatcher.daos.AssignmentDao;
import com.smartdispatch.dispatcher.domains.entities.Assignment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;
import java.util.Objects;

@Repository
public class AssignmentDaoImp implements AssignmentDao {
    private final JdbcTemplate jdbcTemplate;
    private static final RowMapper<Assignment> ASSIGNMENT_ROW_MAPPER = new RowMapperAssignment();

    public AssignmentDaoImp(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<Assignment> getAllAssignments() {
        String sql = "SELECT * FROM Assignment ";
        return jdbcTemplate.query(sql,ASSIGNMENT_ROW_MAPPER);
    }

    public Integer createAssignment(Assignment assignment) {
        String sql = "INSERT INTO Assignment (dispatcher_id, incident_id, vehicle_id, status, time_assigned) " +
                "VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)";

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setInt(1, assignment.getDispatcherId());
            ps.setInt(2, assignment.getIncidentId());
            ps.setInt(3, assignment.getVehicleId());
            ps.setString(4, assignment.getStatus());
            return ps;
        }, keyHolder);

        return Objects.requireNonNull(keyHolder.getKey()).intValue();
    }

    @Override
    public boolean updateStatus(Integer assignmentId, String status) {
        String sql = "UPDATE Assignment SET status = ? WHERE id = ?";
        int rowsAffected = jdbcTemplate.update(sql, status, assignmentId);
        return rowsAffected > 0;
    }

    @Override
    public Assignment findById(Integer id) {
        String sql = "SELECT * FROM Assignment WHERE id = ?";
        List<Assignment> results = jdbcTemplate.query(sql, ASSIGNMENT_ROW_MAPPER, id);
        return results.isEmpty() ? null : results.get(0);
    }

    @Override
    public boolean updateVehicle(Integer assignmentId, Integer vehicleId) {
        String sql = "UPDATE Assignment SET vehicle_id = ?, time_assigned = CURRENT_TIMESTAMP WHERE id = ?";
        int updatedRows = jdbcTemplate.update(sql, vehicleId, assignmentId);
        return updatedRows > 0;
    }


    private static class RowMapperAssignment implements RowMapper<Assignment> {

        @Override
        public Assignment mapRow(ResultSet rs, int rowNum) throws SQLException {
            Assignment assignment = new Assignment();
            assignment.setId(rs.getInt("id"));
            assignment.setDispatcherId(rs.getInt("dispatcher_id"));
            assignment.setIncidentId(rs.getInt("incident_id"));
            assignment.setVehicleId(rs.getInt("vehicle_id"));
            assignment.setTimeAssigned(rs.getTimestamp("time_assigned").toLocalDateTime());
            if (rs.getTimestamp("time_resolved") != null) {
                assignment.setTimeResolved(rs.getTimestamp("time_resolved").toLocalDateTime());
            }
            assignment.setStatus(rs.getString("status"));
            return assignment;

        }
    }
}
