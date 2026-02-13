package com.smartdispatch.dispatcher.services;

import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.ReentrantLock;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;

import jakarta.annotation.PostConstruct;

import com.smartdispatch.dao.*;
import com.smartdispatch.dispatcher.dtos.*;
import com.smartdispatch.model.*;
import com.smartdispatch.mapper.*;
import com.smartdispatch.model.enums.*;
import com.smartdispatch.websockets.NotificationService;

import lombok.RequiredArgsConstructor;

import com.smartdispatch.model.enums.VehicleType;
import com.smartdispatch.util.RedisAssignmentUtil;
import com.smartdispatch.util.LocationCoordinates;

@Service
@RequiredArgsConstructor
public class DispatcherService implements IDispatcherService {
    private final IIncidentDao incidentDao;
    private final IVehicleDao vehicleDao;
    private final ILocationDao locationDao;
    private final IAssignmentDao assignmentDao;
    private final IncidentMapper incidentMapper;
    private final AssignmentMapper assignmentMapper;
    private final VehicleMapper vehicleMapper;
    private final NotificationService notificationService;
    private final RedisAssignmentUtil redisAssignmentUtil;
    private final TransactionTemplate txTemplate;
    // private final ReentrantLock assignmentLock = new ReentrantLock();

    @PostConstruct
    void configureTransactionTemplate() {
        txTemplate.setIsolationLevel(TransactionDefinition.ISOLATION_READ_COMMITTED);
    }

    @Override
    public List<IncidentDto> getPendingIncidents() {
        List<Incident> incidents = incidentDao.getAllPendingIncidents();
        return incidents.stream()
                .map(incidentMapper::mapTo)
                .toList();
    }

    @Override
    public List<IncidentDto> getAllIncidents() {
        List<Incident> incidents = incidentDao.getAllIncidents();
        return incidents.stream()
                .map(incidentMapper::mapTo)
                .toList();
    }

    @Override
    public List<AssignmentDto> getAllAssignments() {
        List<Assignment> assignments = assignmentDao.getAllAssignments();

        List<AssignmentDto> theReturn = assignments.stream().map(assignmentMapper::mapTo).toList();
        for (AssignmentDto i : theReturn) {
            Incident incident = incidentDao.findById(i.getIncidentId());
            i.setDescription(incident.getDescription());
            i.setIncidentType(incident.getType().name());
        }
        return theReturn;
    }

    @Override
    public List<VehicleDto> getAvailableVehicles(String type) {
        List<Vehicle> vehicles = vehicleDao.findAvailableVehiclesByType(VehicleType.valueOf(type.toUpperCase()));
        return vehicles.stream()
                .map(vehicleMapper::mapTo)
                .toList();
    }

    @Override
    public List<VehicleDto> getAllVehicles() {
        List<Vehicle> vehicles = vehicleDao.getAllVehicles();
        return vehicles.stream()
                .map(vehicleMapper::mapTo)
                .toList();
    }

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public AssignmentDto assignVehicleToIncident(AssignmentRequest assignmentRequest) {
        Incident incident = incidentDao.findById(assignmentRequest.getIncidentId());
        if (incident == null) {
            throw new IllegalArgumentException("Incident not found");
        }
        if (incident.getStatus() != IncidentStatus.PENDING) {
            throw new IllegalStateException("Incident is not in pending status");
        }

        Vehicle vehicle = vehicleDao.findById(assignmentRequest.getVehicleId());
        if (vehicle == null) {
            throw new IllegalArgumentException("Vehicle not found");
        }
        if (vehicle.getStatus() != VehicleStatus.AVAILABLE) {
            throw new IllegalStateException("Vehicle is not available");
        }

        Assignment assignment = Assignment.builder()
                .dispatcherId(assignmentRequest.getDispatcherId())
                .vehicleId(assignmentRequest.getVehicleId())
                .incidentId(assignmentRequest.getIncidentId())
                .status(AssignmentStatus.PENDING)
                .build();
        Long assignmentId = assignmentDao.createAssignment(assignment);
        assignment.setId(assignmentId);
        incidentDao.updateStatus(assignmentRequest.getIncidentId(), IncidentStatus.ASSIGNED);
        vehicleDao.updateStatus(assignmentRequest.getVehicleId(), VehicleStatus.ONROUTE);

        incident.setStatus(IncidentStatus.ASSIGNED);
        vehicle.setStatus(VehicleStatus.ONROUTE);

        VehicleLocation location = locationDao.findLatestByVehicleId(vehicle.getId())
                .orElse(null);

        AssignmentDto assignmentDto = assignmentMapper.mapTo(assignment);
        assignmentDto.setIncidentType(incident.getType().name());
        assignmentDto.setDescription(incident.getDescription());
        if (location != null) {
            assignmentDto.setCurrentLatitude(location.getLatitude());
            assignmentDto.setCurrentLongitude(location.getLongitude());
        }

        notificationService.notifyNewAssignment(vehicle.getOperatorId(), assignmentDto);

        return assignmentDto;

    }

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public AssignmentDto reassignAssignment(ReassignRequest request) {
        // find existing assignment
        Assignment existing = assignmentDao.findById(request.getAssignmentId());
        if (existing == null)
            throw new IllegalArgumentException("Assignment not found");

        // find vehicles
        Vehicle oldVehicle = vehicleDao.findById(existing.getVehicleId());
        Vehicle newVehicle = vehicleDao.findById(request.getNewVehicleId());
        if (newVehicle == null)
            throw new IllegalArgumentException("New vehicle not found");
        if (newVehicle.getStatus() != VehicleStatus.AVAILABLE) {
            throw new IllegalStateException("New vehicle is not available");
        }

        boolean ok = assignmentDao.updateVehicle(request.getAssignmentId(), request.getNewVehicleId());
        if (!ok)
            throw new IllegalStateException("Failed to update assignment");

        // Update assignment status to PENDING
        assignmentDao.updateStatus(request.getAssignmentId(), AssignmentStatus.PENDING);

        if (oldVehicle != null) {
            vehicleDao.updateStatus(oldVehicle.getId(), VehicleStatus.AVAILABLE);
            oldVehicle.setStatus(VehicleStatus.AVAILABLE);
        }
        vehicleDao.updateStatus(newVehicle.getId(), VehicleStatus.ONROUTE);
        newVehicle.setStatus(VehicleStatus.ONROUTE);

        Assignment updated = assignmentDao.findById(request.getAssignmentId());
        AssignmentDto dto = assignmentMapper.mapTo(updated);
        Incident incident = incidentDao.findById(existing.getIncidentId());

        if (incident == null) {
            throw new IllegalStateException("Incident not found");
        }

        VehicleLocation location = locationDao.findLatestByVehicleId(newVehicle.getId())
                .orElse(null);

        // Update incident status to ASSIGNED
        incidentDao.updateStatus(incident.getId(), IncidentStatus.ASSIGNED);
        incident.setStatus(IncidentStatus.ASSIGNED);

        dto.setIncidentType(incident.getType().name());
        dto.setDescription(incident.getDescription());
        if (location != null) {
            dto.setCurrentLatitude(location.getLatitude());
            dto.setCurrentLongitude(location.getLongitude());
        }

        notificationService.notifyNewAssignment(newVehicle.getOperatorId(), dto);

        return dto;
    }

    @Override
    public AssignmentDto autoAssignClosestVehicle(Long incidentId) {
        // if (!tryAcquireAssignmentLock()) {
        //     return null;
        // }
        try {
            return txTemplate.execute(status -> performAutoAssignClosestVehicle(incidentId));
        } finally {
            // assignmentLock.unlock();
        }
    }

    @Override
    public AssignmentDto autoAssignPendingIncidentToVehicle(Long vehicleId) {
        // if (!tryAcquireAssignmentLock()) {
        //     return null;
        // }
        try {
            return txTemplate.execute(status -> performAutoAssignPendingIncidentToVehicle(vehicleId));
        } finally {
            // assignmentLock.unlock();
        }
    }

    // private boolean tryAcquireAssignmentLock() {
    //     try {
    //         return assignmentLock.tryLock(200, TimeUnit.MILLISECONDS);
    //     } catch (InterruptedException e) {
    //         Thread.currentThread().interrupt();
    //         return false;
    //     }
    // }

    private AssignmentDto performAutoAssignClosestVehicle(Long incidentId) {
        Incident incident = incidentDao.findByIdForUpdate(incidentId);
        if (incident == null) {
            return null;
        }

        if (incident.getStatus() != IncidentStatus.PENDING) {
            return null;
        }

        VehicleType targetVehicleType = mapIncidentTypeToVehicleType(incident.getType());

        Vehicle closestVehicle = redisAssignmentUtil.findClosestAvailableVehicleFromRedis(
            targetVehicleType,
            incident
        );

        if (closestVehicle == null) {
            return null;
        }

        Assignment assignment = Assignment.builder()
                .dispatcherId(3L)
                .vehicleId(closestVehicle.getId())
                .incidentId(incidentId)
                .status(AssignmentStatus.PENDING)
                .build();

        Long assignmentId = assignmentDao.createAssignment(assignment);
        assignment.setId(assignmentId);

        LocationCoordinates location = redisAssignmentUtil.getVehicleLocationFromRedis(closestVehicle.getId());

        AssignmentDto assignmentDto = assignmentMapper.mapTo(assignment);
        assignmentDto.setIncidentType(incident.getType().name());
        assignmentDto.setDescription(incident.getDescription());
        if (location != null) {
            assignmentDto.setCurrentLatitude(location.getLatitude());
            assignmentDto.setCurrentLongitude(location.getLongitude());
        }

        notificationService.notifyNewAssignment(closestVehicle.getOperatorId(), assignmentDto);

        return assignmentDto;
    }

    private AssignmentDto performAutoAssignPendingIncidentToVehicle(Long vehicleId) {
        Vehicle vehicle = vehicleDao.findByIdForUpdate(vehicleId);
        IncidentType targetIncidentType = mapVehicleTypeToIncidentType(vehicle.getType());

        LocationCoordinates location = redisAssignmentUtil.getVehicleLocationFromRedis(vehicleId);

        if (location == null) {
            return null;
        }

        Incident closestIncident = redisAssignmentUtil.findClosestPendingIncidentFromDatabase(
                targetIncidentType,
                location.getLatitude(),
                location.getLongitude());

        if (closestIncident == null) {
            return null;
        }
        Assignment assignment = Assignment.builder()
                .dispatcherId(3L)
                .vehicleId(vehicleId)
                .incidentId(closestIncident.getId())
                .status(AssignmentStatus.PENDING)
                .build();

        Long assignmentId = assignmentDao.createAssignment(assignment);
        assignment.setId(assignmentId);

        incidentDao.updateStatus(closestIncident.getId(), IncidentStatus.ASSIGNED);
        vehicleDao.updateStatus(vehicleId, VehicleStatus.ONROUTE);

        closestIncident.setStatus(IncidentStatus.ASSIGNED);
        vehicle.setStatus(VehicleStatus.ONROUTE);

        AssignmentDto assignmentDto = assignmentMapper.mapTo(assignment);
        assignmentDto.setIncidentType(closestIncident.getType().name());
        assignmentDto.setDescription(closestIncident.getDescription());
        assignmentDto.setCurrentLatitude(location.getLatitude());
        assignmentDto.setCurrentLongitude(location.getLongitude());

        notificationService.notifyNewAssignment(vehicle.getOperatorId(), assignmentDto);

        return assignmentDto;
    }

    private VehicleType mapIncidentTypeToVehicleType(IncidentType incidentType) {
        return switch (incidentType) {
            case FIRE -> VehicleType.FIRETRUCK;
            case MEDICAL -> VehicleType.AMBULANCE;
            case CRIME -> VehicleType.POLICE;
        };
    }

    private IncidentType mapVehicleTypeToIncidentType(VehicleType vehicleType) {
        return switch (vehicleType) {
            case FIRETRUCK -> IncidentType.FIRE;
            case AMBULANCE -> IncidentType.MEDICAL;
            case POLICE -> IncidentType.CRIME;
        };
    }
}
