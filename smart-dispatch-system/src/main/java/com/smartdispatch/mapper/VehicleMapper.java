package com.smartdispatch.mapper;

import com.smartdispatch.dispatcher.dtos.VehicleDto;
import com.smartdispatch.model.Vehicle;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
public class VehicleMapper implements Mapper<Vehicle, VehicleDto> {
  private final ModelMapper modelMapper;

  public VehicleMapper(ModelMapper modelMapper) {
    this.modelMapper = modelMapper;
  }

  @Override
  public VehicleDto mapTo(Vehicle vehicle) {
    return this.modelMapper.map(vehicle, VehicleDto.class);
  }

  @Override
  public Vehicle mapFrom(VehicleDto vehicleDto) {
    return this.modelMapper.map(vehicleDto, Vehicle.class);
  }
}
