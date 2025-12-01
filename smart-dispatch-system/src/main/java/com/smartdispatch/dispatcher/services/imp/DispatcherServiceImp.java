package com.smartdispatch.dispatcher.services.imp;

import com.smartdispatch.dispatcher.daos.AssignmentDao;
import com.smartdispatch.dispatcher.daos.IncidentDao;
import com.smartdispatch.dispatcher.daos.VehicleDao;
import com.smartdispatch.dispatcher.domains.dtos.AssignmentDto;
import com.smartdispatch.dispatcher.domains.dtos.AssignmentRequest;
import com.smartdispatch.dispatcher.domains.dtos.IncidentDto;
import com.smartdispatch.dispatcher.domains.dtos.VehicleDto;
import com.smartdispatch.dispatcher.domains.entities.Assignment;
import com.smartdispatch.dispatcher.domains.entities.Incident;
import com.smartdispatch.dispatcher.domains.entities.Vehicle;
import com.smartdispatch.dispatcher.mappers.imp.AssignmentMapper;
import com.smartdispatch.dispatcher.mappers.imp.IncidentMapper;
import com.smartdispatch.dispatcher.mappers.imp.VehicleMapper;
import com.smartdispatch.dispatcher.services.DispatcherService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
@Service
public class DispatcherServiceImp implements DispatcherService {
    private IncidentDao incidentDao;
    private VehicleDao vehicleDao;
    private AssignmentDao assignmentDao;
    private IncidentMapper incidentMapper;
    private AssignmentMapper assignmentMapper;
    private VehicleMapper vehicleMapper;

    public DispatcherServiceImp(VehicleDao vehicleDao, IncidentDao incidentDao, AssignmentDao assignmentDao, IncidentMapper incidentMapper, AssignmentMapper assignmentMapper, VehicleMapper vehicleMapper) {
        this.vehicleDao = vehicleDao;
        this.incidentDao = incidentDao;
        this.assignmentDao = assignmentDao;
        this.incidentMapper = incidentMapper;
        this.assignmentMapper = assignmentMapper;
        this.vehicleMapper = vehicleMapper;
    }

    @Override
    public List<IncidentDto> getPendingIncidents() {
      List<Incident>incidents=  incidentDao.getAllPendingIncidents();
        List<IncidentDto> incidentDtos = incidents.stream()
                .map(incidentMapper::mapTO)
                .toList();
        return incidentDtos;
    }

    @Override
    public List<VehicleDto> getAvailableVehicles() {
        List<Vehicle>vehicles=  vehicleDao.findAvailableVehicles();
        List<VehicleDto> vehicleDtos = vehicles.stream()
                .map(vehicleMapper::mapTO)
                .toList();
        return vehicleDtos;
    }

    @Override
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public AssignmentDto assignVehicleToIncident(AssignmentRequest assignmentRequest) {
        Incident incident = incidentDao.findById(assignmentRequest.getIncidentId());
        if (incident == null) {
            throw new IllegalArgumentException("Incident not found");
        }
        if(!incident.getStatus().equals("pending")){
            throw new IllegalStateException("Incident is not in pending status");
        }

       Vehicle vehicle =vehicleDao.findById(assignmentRequest.getVehicleId());
        if (vehicle == null) {
            throw new IllegalArgumentException("Vehicle not found");
        }
        if(!vehicle.getStatus().equals("AVAILABLE")){
            throw new IllegalStateException("Vehicle is not available");
        }

        Assignment assignment =Assignment.builder()
                .dispatcherId(assignmentRequest.getDispatcherId())
                .vehicleId(assignmentRequest.getVehicleId())
                .incidentId(assignmentRequest.getIncidentId())
                .status("active")
                .build();
        Integer assignmentId=assignmentDao.createAssignment(assignment);
        assignment.setId(assignmentId);
        incidentDao.updateStatus(assignmentRequest.getIncidentId(),"assigned");
        vehicleDao.updateStatus(assignmentRequest.getVehicleId(),"ON_ROUTE");
        return  assignmentMapper.mapTO(assignment);

    }
}
