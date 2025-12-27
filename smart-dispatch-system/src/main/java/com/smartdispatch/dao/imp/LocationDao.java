package com.smartdispatch.dao.imp;

import com.smartdispatch.dao.ILocationDao;
import com.smartdispatch.mapper.LocationRowMapper;
import com.smartdispatch.model.VehicleLocation;
import com.smartdispatch.vehiclemanagement.Dto.VehicleLiveLocationDto;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class LocationDao implements ILocationDao {

  private final JdbcTemplate jdbcTemplate;
  private final LocationRowMapper locationRowMapper;

  @Override
  public List<VehicleLiveLocationDto> findAllLiveLocations() {
    String sql = """
            SELECT
                vehicle_id AS vehicleId,
                latitude,
                longitude
            FROM (
                SELECT
                    vehicle_id,
                    latitude,
                    longitude,
                    ROW_NUMBER() OVER (
                        PARTITION BY vehicle_id
                        ORDER BY time_stamp DESC
                    ) AS rn
                FROM vehicle_location
            ) t
            WHERE rn = 1
        """;

    return jdbcTemplate.query(sql, (rs, rowNum) -> VehicleLiveLocationDto.builder()
        .vehicleId(rs.getInt("vehicleId"))
        .latitude(rs.getDouble("latitude"))
        .longitude(rs.getDouble("longitude"))
        .build());
  }

  @Override
  public void saveBatch(List<VehicleLiveLocationDto> locations) {
    String sql = """
            INSERT INTO vehicle_location (vehicle_id, latitude, longitude, time_stamp)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        """;

    if (locations == null) {
      return;
    }

    jdbcTemplate.<VehicleLiveLocationDto>batchUpdate(
        sql,
        locations,
        1000,
        (ps, location) -> {
          ps.setInt(1, location.getVehicleId());
          ps.setDouble(2, location.getLatitude());
          ps.setDouble(3, location.getLongitude());
        });
  }

  @Override
  public VehicleLocation findNewestByVehicleId(Long vehicleId) throws SQLException {
    try {
      String sql = "SELECT * FROM vehicle_location WHERE vehicle_id = ? ORDER BY time_stamp DESC LIMIT 1";
      return jdbcTemplate.queryForObject(sql, locationRowMapper, vehicleId);
    } catch (EmptyResultDataAccessException e) {
      return null;
    } catch (Exception e) {
      throw new SQLException("Error retrieving location for vehicle " + vehicleId, e);
    }
  }

  @Override
  public Optional<VehicleLocation> findLatestByVehicleId(Long vehicleId) {
    try {
      String sql = "SELECT * FROM vehicle_location WHERE vehicle_id = ? ORDER BY time_stamp DESC LIMIT 1";
      return Optional.ofNullable(jdbcTemplate.queryForObject(sql, locationRowMapper, vehicleId));
    } catch (EmptyResultDataAccessException e) {
      return Optional.empty();
    }
  }

  @Override
  public int saveWithCoordinates(Long vehicleId, Double latitude, Double longitude) {
    String sql = "INSERT INTO vehicle_location (vehicle_id, longitude, latitude, time_stamp) VALUES (?, ?, ?, CURRENT_TIMESTAMP)";
    return jdbcTemplate.update(sql, vehicleId, longitude, latitude);
  }

  @Override
  public List<Long> findAllDistinctCarIds() throws SQLException {
    try {
      String sql = "SELECT DISTINCT vehicle_id FROM vehicle_location ORDER BY vehicle_id";
      return jdbcTemplate.queryForList(sql, Long.class);
    } catch (EmptyResultDataAccessException e) {
      return new ArrayList<>();
    } catch (Exception e) {
      throw new SQLException("Error retrieving distinct car IDs", e);
    }
  }
}
