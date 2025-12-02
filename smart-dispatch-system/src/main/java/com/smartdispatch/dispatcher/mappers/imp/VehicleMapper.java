package com.smartdispatch.dispatcher.mappers.imp;

import com.smartdispatch.dispatcher.domains.dtos.VehicleDto;
import com.smartdispatch.dispatcher.domains.entities.Vehicle;
import com.smartdispatch.dispatcher.mappers.Mapper;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
public class VehicleMapper implements Mapper<Vehicle, VehicleDto> {
    private final ModelMapper modelMapper;
    public VehicleMapper(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }

    @Override
    public VehicleDto mapTO(Vehicle vehicle) {
        return this.modelMapper.map(vehicle,VehicleDto.class);
    }

    @Override
    public Vehicle mapFrom(VehicleDto vehicleDto) {
        return this.modelMapper.map(vehicleDto,Vehicle.class);
    }
}
