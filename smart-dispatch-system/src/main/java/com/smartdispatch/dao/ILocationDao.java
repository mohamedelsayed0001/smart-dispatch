package com.smartdispatch.dao;

import com.smartdispatch.model.VehicleLocation;
import com.smartdispatch.vehiclemanagement.Dto.VehicleLiveLocationDto;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

public interface ILocationDao {
  List<VehicleLiveLocationDto> findAllLiveLocations();

  void saveBatch(List<VehicleLiveLocationDto> locations);

  VehicleLocation findNewestByVehicleId(Long vehicleId) throws SQLException;

  Optional<VehicleLocation> findLatestByVehicleId(Long vehicleId);

  int saveWithCoordinates(Long vehicleId, Double latitude, Double longitude);

  List<Long> findAllDistinctCarIds() throws SQLException;
}
