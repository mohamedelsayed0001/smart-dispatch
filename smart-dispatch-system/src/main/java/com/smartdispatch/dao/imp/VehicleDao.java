package com.smartdispatch.dao.imp;

import com.smartdispatch.admin.dto.ResponseTimeDTO;
import com.smartdispatch.admin.rowMapper.ResponseTimeMapper;
import com.smartdispatch.admin.rowMapper.TopUnitMapper;
import com.smartdispatch.admin.dto.UnitDto;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class VehicleDao implements IVehicleDao {

  private final JdbcTemplate jdbcTemplate;
  private final VehicleRowMapper vehicleRowMapper;
  private final TopUnitMapper topUnitMapper;
  private final ResponseTimeMapper responseTimeMapper;
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
  @Override
    public List<UnitDto> getTop10 (LocalDateTime startDate,LocalDateTime endDate){
      String sql="SELECT v.id,v.type,u.name," +
              "AVG(TIMESTAMPDIFF(MINUTE, a.time_assigned, a.time_resolved)) AS avg_resolution_time"+
              " FROM Vehicle v" +
              " INNER JOIN User u ON u.id = v.operator_id"+
              " INNER JOIN Assignment a ON a.vehicle_id = v.id"+
              " WHERE a.status = 'COMPLETED' "+
              " AND a.time_resolved IS NOT NULL" +
              " AND a.time_assigned >= ?" +
              " AND a.time_assigned <= ?" +
              "GROUP BY v.id, v.type, u.name"+
              " ORDER BY avg_resolution_time ASC" +
              " LIMIT 10";
      return jdbcTemplate.query(sql,topUnitMapper,startDate,endDate);
  }

    @Override
    public List<ResponseTimeDTO> getResponseTime(LocalDateTime startDate, LocalDateTime endDate) {
        String sql="SELECT v.type as vehicle_type," +
                "AVG(TIMESTAMPDIFF(MINUTE, i.time_reported, a.time_assigned)) AS AVG_RESPONSE_TIME,"+
                "MIN(TIMESTAMPDIFF(MINUTE, i.time_reported, a.time_assigned)) AS MIN_RESPONSE_TIME," +
                "MAX(TIMESTAMPDIFF(MINUTE, i.time_reported, a.time_assigned)) AS MAX_RESPONSE_TIME," +
                "COUNT(*) AS TOTAL_INCIDENTS " +
                "FROM Assignment a " +
                "INNER JOIN Incident i ON i.id = a.incident_id " +
                "INNER JOIN Vehicle v ON v.id = a.vehicle_id " +
                "WHERE a.status = 'COMPLETED'" +
                "   AND i.time_reported IS NOT NULL" +
                "   AND a.time_assigned IS NOT NULL" +
                "   AND i.time_reported >= ? AND i.time_reported <= ?"+
                "   GROUP BY v.type ORDER BY avg_response_time ASC";
        return jdbcTemplate.query(sql,responseTimeMapper,startDate,endDate);
    }
}
/*
CREATE TABLE User (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
password VARCHAR(255) NOT NULL,
email VARCHAR(255) UNIQUE NOT NULL,
role ENUM('OPERATOR', 'CITIZEN', 'DISPATCHER', 'ADMIN') NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
INDEX idx_user_role (role),
INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Assignment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dispatcher_id INT NOT NULL,
    incident_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    time_assigned TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    time_resolved TIMESTAMP NULL,
    status ENUM('PENDING','ACTIVE', 'COMPLETED', 'CANCELED', 'REJECTED') NOT NULL,
    FOREIGN KEY (dispatcher_id) REFERENCES User(id) ON DELETE RESTRICT,
    FOREIGN KEY (incident_id) REFERENCES Incident(id) ON DELETE RESTRICT,
    FOREIGN KEY (vehicle_id) REFERENCES Vehicle(id) ON DELETE RESTRICT,
    CONSTRAINT check_assignment_resolved_time CHECK (time_resolved IS NULL OR time_resolved >= time_assigned),
    INDEX idx_assignment_status (status),
    INDEX idx_assignment_dispatcher (dispatcher_id),
    INDEX idx_assignment_incident (incident_id),
    INDEX idx_assignment_vehicle (vehicle_id),
    INDEX idx_assignment_time_assigned (time_assigned),
    INDEX idx_assignment_incident_status (incident_id, status),
    INDEX idx_assignment_vehicle_status (vehicle_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Vehicle (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('AMBULANCE', 'FIRETRUCK', 'POLICE')  NOT NULL,
    status ENUM('AVAILABLE', 'ONROUTE', 'RESOLVING') NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0),
    operator_id INT NULL,
    FOREIGN KEY (operator_id) REFERENCES User(id) ON DELETE SET NULL,
    INDEX idx_vehicle_status (status),
    INDEX idx_vehicle_operator (operator_id),
    INDEX idx_vehicle_type (type),
    INDEX idx_vehicle_status_type (status, type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

*/
