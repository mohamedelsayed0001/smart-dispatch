package com.smartdispatch.mapper;

import com.smartdispatch.model.Incident;
import com.smartdispatch.model.enums.IncidentLevel;
import com.smartdispatch.model.enums.IncidentStatus;
import com.smartdispatch.model.enums.IncidentType;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;

import java.sql.ResultSet;
import java.sql.SQLException;

@Component
public class IncidentRowMapper implements RowMapper<Incident> {

  @Override
  public Incident mapRow(ResultSet rs, int rowNum) throws SQLException {
    Incident incident = new Incident();
    incident.setId(rs.getLong("id"));
    incident.setType(IncidentType.valueOf(rs.getString("type")));
    incident.setLevel(IncidentLevel.valueOf(rs.getString("level")));
    incident.setDescription(rs.getString("description"));
    incident.setLatitude(rs.getDouble("latitude"));
    incident.setLongitude(rs.getDouble("longitude"));
    incident.setStatus(IncidentStatus.valueOf(rs.getString("status")));
    incident.setTimeReported(rs.getTimestamp("time_reported").toLocalDateTime());
    if (rs.getTimestamp("time_resolved") != null) {
      incident.setTimeResolved(rs.getTimestamp("time_resolved").toLocalDateTime());
    }
    incident.setCitizenId(rs.getLong("citizen_id"));
    return incident;
  }
}
