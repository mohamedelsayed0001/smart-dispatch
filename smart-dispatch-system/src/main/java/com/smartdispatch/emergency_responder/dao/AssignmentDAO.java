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

  private static final String SELECT_BY_VEHICLE_AND_STATUS = "SELECT id, dispatcher_id, incident_id, vehicle_id, time_assigned, "
      +
      "time_resolved, status FROM Assignment WHERE vehicle_id = ? AND status = ?";

  private static final String UPDATE_STATUS = "UPDATE Assignment SET status = ?, time_resolved = ? WHERE id = ?";

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
      Assignment assignment = jdbcTemplate.queryForObject(SELECT_BY_ID, assignmentRowMapper, id);
      return Optional.ofNullable(assignment);
    } catch (Exception e) {
      return Optional.empty();
    }
  }

  public List<Assignment> findByVehicleIdAndStatus(Integer vehicleId, String status) {
    return jdbcTemplate.query(SELECT_BY_VEHICLE_AND_STATUS, assignmentRowMapper, vehicleId, status);
  }

  public List<Assignment> findByVehicleIdOrderByTimeAssignedDesc(Integer vehicleId) {
    String sql = "SELECT * FROM Assignment WHERE vehicle_id = ? " +
        "ORDER BY time_assigned DESC";
    return jdbcTemplate.query(sql, assignmentRowMapper, vehicleId);
  }

  public List<Assignment> findByDispatcherId(Integer dispatcherId) {
    String sql = "SELECT id, dispatcher_id, incident_id, vehicle_id, time_assigned, " +
        "time_resolved, status FROM Assignment WHERE dispatcher_id = ?";
    return jdbcTemplate.query(sql, assignmentRowMapper, dispatcherId);
  }

  public Optional<Assignment> findByIncidentIdAndStatus(Integer incidentId, String status) {
    String sql = "SELECT id, dispatcher_id, incident_id, vehicle_id, time_assigned, " +
        "time_resolved, status FROM Assignment WHERE incident_id = ? AND status = ?";
    try {
      Assignment assignment = jdbcTemplate.queryForObject(sql, assignmentRowMapper, incidentId, status);
      return Optional.ofNullable(assignment);
    } catch (Exception e) {
      return Optional.empty();
    }
  }

  public List<Assignment> findAll() {
    String sql = "SELECT id, dispatcher_id, incident_id, vehicle_id, time_assigned, " +
        "time_resolved, status FROM Assignment";
    return jdbcTemplate.query(sql, assignmentRowMapper);
  }

  public int updateStatus(Integer assignmentId, String status, Timestamp timeResolved) {
    return jdbcTemplate.update(UPDATE_STATUS, status, timeResolved, assignmentId);
  }

  public int save(Assignment assignment) {
    String sql = "INSERT INTO Assignment (dispatcher_id, incident_id, vehicle_id, " +
        "time_assigned, status) VALUES (?, ?, ?, ?, ?)";

    Timestamp timeAssigned = assignment.getTimeAssigned() != null ? Timestamp.valueOf(assignment.getTimeAssigned())
        : new Timestamp(System.currentTimeMillis());

    return jdbcTemplate.update(sql,
        assignment.getDispatcherId(),
        assignment.getIncidentId(),
        assignment.getVehicleId(),
        timeAssigned,
        assignment.getStatus());
  }

  public int update(Assignment assignment) {
    String sql = "UPDATE Assignment SET dispatcher_id = ?, incident_id = ?, vehicle_id = ?, " +
        "time_assigned = ?, time_resolved = ?, status = ? WHERE id = ?";

    Timestamp timeAssigned = Timestamp.valueOf(assignment.getTimeAssigned());
    Timestamp timeResolved = assignment.getTimeResolved() != null ? Timestamp.valueOf(assignment.getTimeResolved())
        : null;

    return jdbcTemplate.update(sql,
        assignment.getDispatcherId(),
        assignment.getIncidentId(),
        assignment.getVehicleId(),
        timeAssigned,
        timeResolved,
        assignment.getStatus(),
        assignment.getId());
  }

  public int deleteById(Integer id) {
    String sql = "DELETE FROM Assignment WHERE id = ?";
    return jdbcTemplate.update(sql, id);
  }
}
