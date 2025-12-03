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
public class VehicleLocationDAO {

  private final JdbcTemplate jdbcTemplate;

  private static final String SELECT_LATEST_BY_VEHICLE = "SELECT id, vehicle_id, longitude, latitude, time_stamp " +
      "FROM vehicle_location WHERE vehicle_id = ? " +
      "ORDER BY time_stamp DESC LIMIT 1";

  private static final String INSERT_LOCATION = "INSERT INTO vehicle_location (vehicle_id, longitude, latitude, time_stamp) "
      +
      "VALUES (?, ?, ?, ?)";

  private final RowMapper<VehicleLocation> locationRowMapper = (rs, rowNum) -> {
    VehicleLocation location = new VehicleLocation();
    location.setId(rs.getInt("id"));
    location.setVehicleId(rs.getInt("vehicle_id"));
    location.setLongitude(rs.getDouble("longitude"));
    location.setLatitude(rs.getDouble("latitude"));

    Timestamp timestamp = rs.getTimestamp("time_stamp");
    if (timestamp != null) {
      location.setTimeStamp(timestamp.toLocalDateTime());
    }

    return location;
  };

  public Optional<VehicleLocation> findTopByVehicleIdOrderByTimeStampDesc(Integer vehicleId) {
    try {
      VehicleLocation location = jdbcTemplate.queryForObject(
          SELECT_LATEST_BY_VEHICLE,
          locationRowMapper,
          vehicleId);
      return Optional.ofNullable(location);
    } catch (Exception e) {
      return Optional.empty();
    }
  }

  public int saveWithCoordinates(Integer vehicleId, Double latitude, Double longitude) {
    return jdbcTemplate.update(
        INSERT_LOCATION,
        vehicleId,
        longitude,
        latitude,
        new Timestamp(System.currentTimeMillis()));
  }
}
