package com.smartdispatch.emergency_responder.dao;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import com.smartdispatch.emergency_responder.model.*;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class VehicleDAO {

  private final JdbcTemplate jdbcTemplate;

  private static final String SELECT_BY_ID = "SELECT id, type, status, capacity, operator_id FROM Vehicle WHERE id = ?";

  private static final String SELECT_BY_OPERATOR = "SELECT id, type, status, capacity, operator_id FROM Vehicle WHERE operator_id = ?";

  private static final String SELECT_BY_STATUS = "SELECT id, type, status, capacity, operator_id FROM Vehicle WHERE status = ?";

  private static final String UPDATE_STATUS = "UPDATE Vehicle SET status = ? WHERE id = ?";

  private final RowMapper<Vehicle> vehicleRowMapper = (rs, rowNum) -> {
    Vehicle vehicle = new Vehicle();
    vehicle.setId(rs.getInt("id"));
    vehicle.setType(rs.getString("type"));
    vehicle.setStatus(rs.getString("status"));
    vehicle.setCapacity(rs.getInt("capacity"));

    int operatorId = rs.getInt("operator_id");
    if (!rs.wasNull()) {
      vehicle.setOperatorId(operatorId);
    }

    return vehicle;
  };

  public Optional<Vehicle> findById(Integer id) {
    try {
      Vehicle vehicle = jdbcTemplate.queryForObject(SELECT_BY_ID, vehicleRowMapper, id);
      return Optional.ofNullable(vehicle);
    } catch (Exception e) {
      return Optional.empty();
    }
  }

  public Optional<Vehicle> findByOperatorId(Integer operatorId) {
    try {
      Vehicle vehicle = jdbcTemplate.queryForObject(SELECT_BY_OPERATOR, vehicleRowMapper, operatorId);
      return Optional.ofNullable(vehicle);
    } catch (Exception e) {
      return Optional.empty();
    }
  }

  public List<Vehicle> findByStatus(String status) {
    return jdbcTemplate.query(SELECT_BY_STATUS, vehicleRowMapper, status);
  }

  public List<Vehicle> findAll() {
    String sql = "SELECT id, type, status, capacity, operator_id FROM Vehicle";
    return jdbcTemplate.query(sql, vehicleRowMapper);
  }

  public int updateStatus(Integer vehicleId, String status) {
    return jdbcTemplate.update(UPDATE_STATUS, status, vehicleId);
  }

  public int save(Vehicle vehicle) {
    String sql = "INSERT INTO Vehicle (type, status, capacity, operator_id) VALUES (?, ?, ?, ?)";
    return jdbcTemplate.update(sql,
        vehicle.getType(),
        vehicle.getStatus(),
        vehicle.getCapacity(),
        vehicle.getOperatorId());
  }

  public int update(Vehicle vehicle) {
    String sql = "UPDATE Vehicle SET type = ?, status = ?, capacity = ?, operator_id = ? WHERE id = ?";
    return jdbcTemplate.update(sql,
        vehicle.getType(),
        vehicle.getStatus(),
        vehicle.getCapacity(),
        vehicle.getOperatorId(),
        vehicle.getId());
  }

  public int deleteById(Integer id) {
    String sql = "DELETE FROM Vehicle WHERE id = ?";
    return jdbcTemplate.update(sql, id);
  }
}