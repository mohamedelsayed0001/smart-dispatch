package com.smartdispatch.mapper;

import com.smartdispatch.model.Assignment;
import com.smartdispatch.model.enums.AssignmentStatus;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;

import java.sql.ResultSet;
import java.sql.SQLException;

@Component
public class AssignmentRowMapper implements RowMapper<Assignment> {

  @Override
  public Assignment mapRow(ResultSet rs, int rowNum) throws SQLException {
    Assignment assignment = new Assignment();
    assignment.setId(rs.getLong("id"));
    assignment.setDispatcherId(rs.getLong("dispatcher_id"));
    assignment.setIncidentId(rs.getLong("incident_id"));
    assignment.setVehicleId(rs.getLong("vehicle_id"));
    assignment.setTimeAssigned(rs.getTimestamp("time_assigned").toLocalDateTime());
    if (rs.getTimestamp("time_resolved") != null) {
      assignment.setTimeResolved(rs.getTimestamp("time_resolved").toLocalDateTime());
    }
    assignment.setStatus(AssignmentStatus.valueOf(rs.getString("status")));
    return assignment;
  }
}
