package com.smartdispatch.dispatcher.services.imp;

import com.smartdispatch.dispatcher.daos.AssignmentDao;
import com.smartdispatch.dispatcher.daos.IncidentDao;
import com.smartdispatch.dispatcher.daos.VehicleDao;
import com.smartdispatch.dispatcher.domains.dtos.*;
import com.smartdispatch.dispatcher.domains.entities.Assignment;
import com.smartdispatch.dispatcher.domains.entities.Incident;
import com.smartdispatch.dispatcher.domains.entities.Vehicle;
import com.smartdispatch.dispatcher.mappers.imp.AssignmentMapper;
import com.smartdispatch.dispatcher.mappers.imp.IncidentMapper;
import com.smartdispatch.dispatcher.mappers.imp.VehicleMapper;
import com.smartdispatch.dispatcher.services.DispatcherService;
import com.smartdispatch.dispatcher.services.imp.WebSocketNotificationServiceImp;
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
    private WebSocketNotificationServiceImp notificationService;

    public DispatcherServiceImp(VehicleDao vehicleDao, IncidentDao incidentDao, AssignmentDao assignmentDao, IncidentMapper incidentMapper, AssignmentMapper assignmentMapper, VehicleMapper vehicleMapper, WebSocketNotificationServiceImp notificationService) {
        this.vehicleDao = vehicleDao;
        this.incidentDao = incidentDao;
        this.assignmentDao = assignmentDao;
        this.incidentMapper = incidentMapper;
        this.assignmentMapper = assignmentMapper;
        this.vehicleMapper = vehicleMapper;
        this.notificationService = notificationService;
    }

    @Override
    public List<IncidentDto> getPendingIncidents() {
      List<Incident>incidents=  incidentDao.getAllPendingIncidents();
        return incidents.stream()
                .map(incidentMapper::mapTO)
                .toList();
    }
    @Override
    public List<IncidentDto> getAllIncidents() {
      List<Incident>incidents=  incidentDao.getAllPendingIncidents();
        return incidents.stream()
                .map(incidentMapper::mapTO)
                .toList();
    }

    @Override
    public List<AssignmentDto> getAllAssignments() {
        List<Assignment>assignments=  assignmentDao.getAllAssignments();
        return assignments.stream()
                .map(assignmentMapper::mapTO)
                .toList();
    }

    @Override
    public List<VehicleDto> getAvailableVehicles() {
        List<Vehicle>vehicles=  vehicleDao.findAvailableVehicles();
        return vehicles.stream()
                .map(vehicleMapper::mapTO)
                .toList();
    }

    @Override
    public List<VehicleDto> getAllVehicles() {
        List<Vehicle>vehicles=  vehicleDao.findAllVehicles();
        return vehicles.stream()
                .map(vehicleMapper::mapTO)
                .toList();
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

        incident.setStatus("assigned");
        vehicle.setStatus("ON_ROUTE");

        IncidentDto updatedIncident = incidentMapper.mapTO(incident);
        VehicleDto updatedVehicle = vehicleMapper.mapTO(vehicle);
        AssignmentDto assignmentDto = assignmentMapper.mapTO(assignment);
        notificationService.notifyVehicleUpdate(updatedVehicle);
        notificationService.notifyIncidentUpdate(updatedIncident);
        notificationService.notifyAssignmentUpdate(assignmentDto);
        notificationService.broadcastNotification(
                "SUCCESS",
                "Assignment created: Vehicle " + vehicle.getId() + " → Incident " + incident.getId()
        );

        return assignmentMapper.mapTO(assignment);

    }

    @Override
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public AssignmentDto reassignAssignment(ReassignRequest request) {
        // find existing assignment
        Assignment existing = assignmentDao.findById(request.getAssignmentId());
        if (existing == null) throw new IllegalArgumentException("Assignment not found");

        // find vehicles
        Vehicle oldVehicle = vehicleDao.findById(existing.getVehicleId());
        Vehicle newVehicle = vehicleDao.findById(request.getNewVehicleId());
        if (newVehicle == null) throw new IllegalArgumentException("New vehicle not found");
        if (!"AVAILABLE".equalsIgnoreCase(newVehicle.getStatus())) {
            throw new IllegalStateException("New vehicle is not available");
        }


        boolean ok = assignmentDao.updateVehicle(request.getAssignmentId(), request.getNewVehicleId());
        if (!ok) throw new IllegalStateException("Failed to update assignment");

        if (oldVehicle != null) {
            vehicleDao.updateStatus(oldVehicle.getId(), "AVAILABLE");
            oldVehicle.setStatus("AVAILABLE");
        }
        vehicleDao.updateStatus(newVehicle.getId(), "ON_ROUTE");
        newVehicle.setStatus("ON_ROUTE");

        Assignment updated = assignmentDao.findById(request.getAssignmentId());
        AssignmentDto dto = assignmentMapper.mapTO(updated);

        notificationService.notifyVehicleUpdate(vehicleMapper.mapTO(newVehicle));
        if (oldVehicle != null) notificationService.notifyVehicleUpdate(vehicleMapper.mapTO(oldVehicle));
        notificationService.notifyAssignmentUpdate(dto);
        notificationService.broadcastNotification("SUCCESS", "Assignment reassigned to vehicle " + newVehicle.getId());

        return dto;
    }
}
