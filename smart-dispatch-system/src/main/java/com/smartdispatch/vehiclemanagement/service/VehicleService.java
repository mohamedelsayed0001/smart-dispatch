package com.smartdispatch.vehiclemanagement.service;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import com.smartdispatch.vehiclemanagement.Dao.VehicleDaoImpl;
import com.smartdispatch.vehiclemanagement.Dto.VehicleDto;
import com.smartdispatch.vehiclemanagement.model.VehicleEntity;
import com.smartdispatch.vehiclemanagement.rowmapper.DtoMapper;
import com.smartdispatch.vehiclemanagement.rowmapper.VehicleMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;



import javax.management.ServiceNotFoundException;

@Service
public class VehicleService {

    private final DtoMapper dtoMapper;
    private final VehicleDaoImpl vehicleDao;

    public VehicleService(DtoMapper dtoMapper, VehicleDaoImpl vehicleDao) {
        this.dtoMapper = dtoMapper;
        this.vehicleDao = vehicleDao;
    }

    public void createService(VehicleDto vehicleDto) throws Exception {
       if(!vehicleDao.isopertorCorrect(vehicleDto.getOperatorId())){
           throw new Exception("There is no Operator having that id");
       }
        VehicleEntity vehicle = dtoMapper.mapFromDto(vehicleDto);
        vehicleDao.save(vehicle);
    }

    public void editService(long id, VehicleDto vehicleDto) throws SQLException {
        VehicleEntity vehicle = dtoMapper.mapFromDto(vehicleDto);
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
        List<VehicleEntity> entities = vehicleDao.getAll();
        List<VehicleDto> dtos = new ArrayList<>(entities.size());
        for (VehicleEntity e : entities)
            dtos.add(dtoMapper.mapToDto(e));
        return dtos;
    }

    public VehicleDto getDetails(long id) throws SQLException {
        VehicleEntity vehicle = vehicleDao.get(id);
        return dtoMapper.mapToDto(vehicle);
    }
}
