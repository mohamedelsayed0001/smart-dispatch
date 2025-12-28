package com.smartdispatch.dao.imp;

import com.smartdispatch.dao.IAssignmentDao;
import com.smartdispatch.mapper.AssignmentRowMapper;
import com.smartdispatch.model.Assignment;
import com.smartdispatch.model.enums.AssignmentStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;

@Repository
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AssignmentDao implements IAssignmentDao {

  private final JdbcTemplate jdbcTemplate;
  private final AssignmentRowMapper assignmentRowMapper;

  @Override
  public List<Assignment> getAllAssignments() {
    String sql = "SELECT * FROM Assignment";
    return jdbcTemplate.query(sql, assignmentRowMapper);
  }

  @Override
  public Long createAssignment(Assignment assignment) {
    String sql = "INSERT INTO Assignment (dispatcher_id, incident_id, vehicle_id, status, time_assigned) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)";
    KeyHolder keyHolder = new GeneratedKeyHolder();

    jdbcTemplate.update(connection -> {
      PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
      ps.setLong(1, assignment.getDispatcherId());
      ps.setLong(2, assignment.getIncidentId());
      ps.setLong(3, assignment.getVehicleId());
      ps.setString(4, assignment.getStatus().name());
      return ps;
    }, keyHolder);

    Number key = keyHolder.getKey();
    return key != null ? key.longValue() : null;
  }

  @Override
  public boolean updateStatus(Long assignmentId, AssignmentStatus status) {
    String sql = "UPDATE Assignment SET status = ? WHERE id = ?";
    return jdbcTemplate.update(sql, status.name(), assignmentId) > 0;
  }

  @Override
  public int updateStatusWithCurrentTime(Long assignmentId, AssignmentStatus status) {
    String sql = "UPDATE Assignment SET status = ?, time_resolved = CURRENT_TIMESTAMP WHERE id = ?";
    return jdbcTemplate.update(sql, status.name(), assignmentId);
  }

  @Override
  public Assignment findById(Long id) {
    try {
      String sql = "SELECT * FROM Assignment WHERE id = ?";
      return jdbcTemplate.queryForObject(sql, assignmentRowMapper, id);
    } catch (EmptyResultDataAccessException e) {
      return null;
    }
  }

  @Override
  public List<Assignment> findByVehicleIdOrderByTimeAssignedDesc(Long vehicleId) {
    String sql = "SELECT * FROM Assignment WHERE vehicle_id = ? ORDER BY time_assigned DESC";
    return jdbcTemplate.query(sql, assignmentRowMapper, vehicleId);
  }

  @Override
  public boolean updateVehicle(Long assignmentId, Long vehicleId) {
    String sql = "UPDATE Assignment SET vehicle_id = ? WHERE id = ?";
    return jdbcTemplate.update(sql, vehicleId, assignmentId) > 0;
  }
}
