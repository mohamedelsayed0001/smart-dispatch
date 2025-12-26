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
public class AssignmentDAO {

  private final JdbcTemplate jdbcTemplate;

  private static final String SELECT_BY_ID = "SELECT id, dispatcher_id, incident_id, vehicle_id, time_assigned, " +
      "time_resolved, status FROM Assignment WHERE id = ?";

  private static final String UPDATE_STATUS = "UPDATE Assignment SET status = ?, time_resolved = ? WHERE id = ?";

  private static final String UPDATE_STATUS_WITH_CURRENT_TIME = "UPDATE Assignment SET status = ?, time_resolved = CURRENT_TIMESTAMP WHERE id = ?";

  private final RowMapper<Assignment> assignmentRowMapper = (rs, rowNum) -> {
    Assignment assignment = new Assignment();
    assignment.setId(rs.getInt("id"));
    assignment.setDispatcherId(rs.getInt("dispatcher_id"));
    assignment.setIncidentId(rs.getInt("incident_id"));
    assignment.setVehicleId(rs.getInt("vehicle_id"));
    assignment.setStatus(rs.getString("status"));

    Timestamp timeAssigned = rs.getTimestamp("time_assigned");
    if (timeAssigned != null) {
      assignment.setTimeAssigned(timeAssigned.toLocalDateTime());
    }

    Timestamp timeResolved = rs.getTimestamp("time_resolved");
    if (timeResolved != null) {
      assignment.setTimeResolved(timeResolved.toLocalDateTime());
    }

    return assignment;
  };

  public Optional<Assignment> findById(Integer id) {
    try {
      @SuppressWarnings("null")
      Assignment assignment = jdbcTemplate.queryForObject(SELECT_BY_ID, assignmentRowMapper, id);
      return Optional.ofNullable(assignment);
    } catch (Exception e) {
      return Optional.empty();
    }
  }

  @SuppressWarnings("null")
  public List<Assignment> findByVehicleIdOrderByTimeAssignedDesc(Integer vehicleId) {
    String sql = "SELECT * FROM Assignment WHERE vehicle_id = ? " +
        "ORDER BY time_assigned DESC";
    return jdbcTemplate.query(sql, assignmentRowMapper, vehicleId);
  }

  public int updateStatus(Integer assignmentId, String status, Timestamp timeResolved) {
    return jdbcTemplate.update(UPDATE_STATUS, status, timeResolved, assignmentId);
  }

  public int updateStatusWithCurrentTime(Integer assignmentId, String status) {
    return jdbcTemplate.update(UPDATE_STATUS_WITH_CURRENT_TIME, status, assignmentId);
  }
}
