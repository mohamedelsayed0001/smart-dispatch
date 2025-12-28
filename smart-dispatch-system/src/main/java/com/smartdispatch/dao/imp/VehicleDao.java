package com.smartdispatch.dao.imp;

import com.smartdispatch.admin.dto.VehicleTypeCount;
import com.smartdispatch.dao.IVehicleDao;
import com.smartdispatch.mapper.VehicleRowMapper;
import com.smartdispatch.model.Vehicle;
import com.smartdispatch.model.enums.VehicleStatus;
import com.smartdispatch.model.enums.VehicleType;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
@SuppressWarnings("null")
public class VehicleDao implements IVehicleDao {

  private final JdbcTemplate jdbcTemplate;
  private final VehicleRowMapper vehicleRowMapper;

  @Override
  public List<Vehicle> getAllVehicles() {
    String sql = "SELECT * FROM Vehicle";
    return jdbcTemplate.query(sql, vehicleRowMapper);
  }

  @Override
  public List<Vehicle> findAvailableVehicles() {
    String sql = "SELECT * FROM Vehicle WHERE status = 'AVAILABLE'";
    return jdbcTemplate.query(sql, vehicleRowMapper);
  }

  @Override
  public List<Vehicle> findAvailableVehiclesByType(VehicleType type) {
    String sql = "SELECT * FROM Vehicle WHERE status = 'AVAILABLE' AND type = ?";
    return jdbcTemplate.query(sql, vehicleRowMapper, type.name());
  }

  @Override
  public Vehicle findById(Long id) {
    try {
      String sql = "SELECT * FROM Vehicle WHERE id = ?";
      return jdbcTemplate.queryForObject(sql, vehicleRowMapper, id);
    } catch (EmptyResultDataAccessException e) {
      return null;
    }
  }

  @Override
  public Optional<Vehicle> findOptionalById(Long id) {
    return Optional.ofNullable(findById(id));
  }

  @Override
  public Optional<Vehicle> findByOperatorId(Long operatorId) {
    try {
      String sql = "SELECT * FROM Vehicle WHERE operator_id = ?";
      return Optional.ofNullable(jdbcTemplate.queryForObject(sql, vehicleRowMapper, operatorId));
    } catch (EmptyResultDataAccessException e) {
      return Optional.empty();
    }
  }

  @Override
  public boolean updateStatus(Long id, VehicleStatus status) {
    String sql = "UPDATE Vehicle SET status = ? WHERE id = ?";
    return jdbcTemplate.update(sql, status.name(), id) > 0;
  }

  @Override
  public List<VehicleTypeCount> findCountOfVehiclesByType() {
    String sql = "SELECT type, COUNT(*) as count FROM Vehicle GROUP BY type";
    return jdbcTemplate.query(sql, (rs, rowNum) -> new VehicleTypeCount(rs.getString("type"), rs.getInt("count")));
  }

  @Override
  public Vehicle findClosestAvailableVehicle(VehicleType type, double latitude, double longitude) {
    String sql = """
            SELECT v.*, (6371 * acos(cos(radians(?)) * cos(radians(l.latitude)) * cos(radians(l.longitude) - radians(?)) + sin(radians(?)) * sin(radians(l.latitude)))) AS distance
            FROM Vehicle v
            JOIN (
                SELECT vehicle_id, latitude, longitude,
                       ROW_NUMBER() OVER (PARTITION BY vehicle_id ORDER BY time_stamp DESC) as rn
                FROM vehicle_location
            ) l ON v.id = l.vehicle_id
            WHERE v.status = 'AVAILABLE' AND v.type = ? AND l.rn = 1
            ORDER BY distance
            LIMIT 1
        """;
    try {
      return jdbcTemplate.queryForObject(sql, vehicleRowMapper, latitude, longitude, latitude, type.name());
    } catch (EmptyResultDataAccessException e) {
      return null;
    }
  }

  @Override
  public void save(Vehicle vehicle) {
    String sql = "INSERT INTO Vehicle (type, status, capacity, operator_id) VALUES (?, ?, ?, ?)";
    jdbcTemplate.update(sql, vehicle.getType().name(), vehicle.getStatus().name(), vehicle.getCapacity(),
        vehicle.getOperatorId());
  }

  @Override
  public void delete(Long id) {
    String sql = "DELETE FROM Vehicle WHERE id = ?";
    jdbcTemplate.update(sql, id);
  }

  @Override
  public void update(Long id, Vehicle vehicle) {
    String sql = "UPDATE Vehicle SET type = ?, status = ?, capacity = ?, operator_id = ? WHERE id = ?";
    jdbcTemplate.update(sql, vehicle.getType().name(), vehicle.getStatus().name(), vehicle.getCapacity(),
        vehicle.getOperatorId(), id);
  }

  @Override
  public int isVehicleInUse(Long id) {
    String sql = "SELECT COUNT(*) FROM Assignment WHERE vehicle_id = ? AND status = 'ACTIVE'";
    Integer count = jdbcTemplate.queryForObject(sql, Integer.class, id);
    return count != null ? count : 0;
  }

  @Override
  public boolean isOperatorCorrect(Long operatorId) {
    if (operatorId == null)
      return true;
    String sql = "SELECT COUNT(*) FROM User WHERE id = ? AND role = 'OPERATOR'";
    Integer count = jdbcTemplate.queryForObject(sql, Integer.class, operatorId);
    return count != null && count > 0;
  }
}
