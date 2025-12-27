package com.smartdispatch.vehiclemanagement.service;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import com.smartdispatch.dao.IVehicleDao;
import com.smartdispatch.model.Vehicle;
import com.smartdispatch.model.enums.VehicleStatus;
import com.smartdispatch.model.enums.VehicleType;
import com.smartdispatch.vehiclemanagement.Dto.VehicleDto;
import org.springframework.stereotype.Service;

import javax.management.ServiceNotFoundException;

@Service
public class VehicleService {

    private final IVehicleDao vehicleDao;

    public VehicleService(IVehicleDao vehicleDao) {
        this.vehicleDao = vehicleDao;
    }

    public void createService(VehicleDto vehicleDto) throws Exception {
        if (!vehicleDao.isOperatorCorrect(vehicleDto.getOperatorId())) {
            throw new Exception("Invalid operator ID: No operator found with ID " + vehicleDto.getOperatorId());
        }
        Vehicle vehicle = mapToEntity(vehicleDto);
        vehicleDao.save(vehicle);
    }

    public void editService(long id, VehicleDto vehicleDto) throws Exception {
        if (!vehicleDao.isOperatorCorrect(vehicleDto.getOperatorId())) {
            throw new Exception("Invalid operator ID: No operator found with ID " + vehicleDto.getOperatorId());
        }

        if (vehicleDao.findById(id) == null) {
            throw new Exception("Vehicle with ID " + id + " not found");
        }

        Vehicle vehicle = mapToEntity(vehicleDto);
        vehicleDao.update(id, vehicle);
    }

    public void deleteService(long id) throws Exception {
        if (vehicleDao.findById(id) == null)
            throw new ServiceNotFoundException("Vehicle with ID " + id + " not found");

        int inUseCount = vehicleDao.isVehicleInUse(id);
        if (inUseCount > 0)
            throw new RuntimeException("Cannot delete vehicle, it has active assignment");

        vehicleDao.delete(id);
    }

    public List<VehicleDto> getAllService() throws SQLException {
        List<Vehicle> entities = vehicleDao.getAllVehicles();
        List<VehicleDto> dtos = new ArrayList<>(entities.size());
        for (Vehicle e : entities)
            dtos.add(mapToDto(e));
        return dtos;
    }

    public VehicleDto getDetails(long id) throws SQLException {
        Vehicle vehicle = vehicleDao.findById(id);
        return vehicle != null ? mapToDto(vehicle) : null;
    }

    private Vehicle mapToEntity(VehicleDto dto) {
        Vehicle vehicle = new Vehicle();
        vehicle.setId(dto.getId());
        vehicle.setType(VehicleType.valueOf(dto.getType().name()));
        vehicle.setStatus(VehicleStatus.valueOf(dto.getStatus().name()));
        vehicle.setCapacity(dto.getCapacity());
        vehicle.setOperatorId(dto.getOperatorId());
        return vehicle;
    }

    private VehicleDto mapToDto(Vehicle entity) {
        VehicleDto dto = new VehicleDto();
        dto.setId(entity.getId());
        dto.setType(VehicleType.valueOf(entity.getType().name()));
        dto.setStatus(VehicleStatus.valueOf(entity.getStatus().name()));
        dto.setCapacity(entity.getCapacity());
        dto.setOperatorId(entity.getOperatorId());
        return dto;
    }
}
