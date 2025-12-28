package com.smartdispatch.dao.imp;

import com.smartdispatch.admin.dto.AvgTimeResolved;
import com.smartdispatch.admin.dto.IncidentStatsDto;
import com.smartdispatch.dao.IIncidentDao;
import com.smartdispatch.mapper.IncidentRowMapper;
import com.smartdispatch.model.Incident;
import com.smartdispatch.model.enums.IncidentStatus;
import com.smartdispatch.model.enums.IncidentType;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
@SuppressWarnings("null")
public class IncidentDao implements IIncidentDao {

  private final JdbcTemplate jdbcTemplate;
  private final IncidentRowMapper incidentRowMapper;

  @Override
  public List<Incident> getAllIncidents() {
    String sql = "SELECT * FROM Incident";
    return jdbcTemplate.query(sql, incidentRowMapper);
  }

  @Override
  public List<Incident> getAllPendingIncidents() {
    String sql = "SELECT * FROM Incident WHERE status = 'PENDING'";
    return jdbcTemplate.query(sql, incidentRowMapper);
  }

  @Override
  public List<Incident> getAllPendingIncidentsOfType(IncidentType type) {
    String sql = "SELECT * FROM Incident WHERE status = 'PENDING' AND type = ?";
    return jdbcTemplate.query(sql, incidentRowMapper, type.name());
  }

  @Override
  public Long createIncident(Incident incident) {
    String sql = "INSERT INTO Incident (type, level, description, latitude, longitude, status, time_reported, citizen_id) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)";
    KeyHolder keyHolder = new GeneratedKeyHolder();

    jdbcTemplate.update(connection -> {
      PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
      ps.setString(1, incident.getType().name());
      ps.setString(2, incident.getLevel().name());
      ps.setString(3, incident.getDescription());
      ps.setDouble(4, incident.getLatitude());
      ps.setDouble(5, incident.getLongitude());
      ps.setString(6, incident.getStatus().name());
      if (incident.getCitizenId() != null) {
        ps.setLong(7, incident.getCitizenId());
      } else {
        ps.setNull(7, java.sql.Types.BIGINT);
      }
      return ps;
    }, keyHolder);

    Number key = keyHolder.getKey();
    return key != null ? key.longValue() : null;
  }

  @Override
  public Incident findById(Long id) {
    try {
      String sql = "SELECT * FROM Incident WHERE id = ?";
      return jdbcTemplate.queryForObject(sql, incidentRowMapper, id);
    } catch (EmptyResultDataAccessException e) {
      return null;
    }
  }

  @Override
  public Optional<Incident> findOptionalById(Long id) {
    return Optional.ofNullable(findById(id));
  }

  @Override
  public boolean updateStatus(Long id, IncidentStatus status) {
    String sql = "UPDATE Incident SET status = ? WHERE id = ?";
    return jdbcTemplate.update(sql, status.name(), id) > 0;
  }

  @Override
  public int updateTimeResolved(Long incidentId, IncidentStatus status) {
    String sql = "UPDATE Incident SET status = ?, time_resolved = CURRENT_TIMESTAMP WHERE id = ?";
    return jdbcTemplate.update(sql, status.name(), incidentId);
  }

  @Override
  public List<AvgTimeResolved> getAvgTimeResolvedByType() {
    String sql = """
            SELECT type, AVG(TIMESTAMPDIFF(MINUTE, time_reported, time_resolved)) as avgTime
            FROM Incident
            WHERE time_resolved IS NOT NULL
            GROUP BY type
        """;
    return jdbcTemplate.query(sql, (rs, rowNum) -> new AvgTimeResolved(rs.getLong("avgTime"), rs.getString("type")));
  }

  @Override
  public List<IncidentStatsDto> getIncidentCountPerMonthByType(int limit) {
    String sql = """
            SELECT type, DATE_FORMAT(time_reported, '%Y-%m') as month, COUNT(*) as count
            FROM Incident
            GROUP BY type, month
            ORDER BY month DESC
            LIMIT ?
        """;
    return jdbcTemplate.query(sql,
        (rs, rowNum) -> new IncidentStatsDto(rs.getString("month"), rs.getString("type"), rs.getLong("count")), limit);
  }

  @Override
  public Incident findClosestPendingIncident(IncidentType type, double latitude, double longitude) {
    String sql = """
            SELECT *, (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance
            FROM Incident
            WHERE status = 'PENDING' AND type = ?
            ORDER BY distance
            LIMIT 1
        """;
    try {
      return jdbcTemplate.queryForObject(sql, incidentRowMapper, latitude, longitude, latitude, type.name());
    } catch (EmptyResultDataAccessException e) {
      return null;
    }
  }

  @Override
  public List<Incident> findTopIncidents(int limit) {
    String sql = "SELECT * FROM Incident ORDER BY time_reported DESC LIMIT ?";
    return jdbcTemplate.query(sql, incidentRowMapper, limit);
  }

  @Override
  public List<Incident> findRecentIncidents(int limit) {
    return findTopIncidents(limit);
  }
}
