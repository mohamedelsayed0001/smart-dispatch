package com.smartdispatch.emergency_responder.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartdispatch.emergency_responder.dao.*;
import com.smartdispatch.emergency_responder.dto.*;
import com.smartdispatch.emergency_responder.model.*;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResponderService {

    private final UserDAO userDAO;
    private final VehicleDAO vehicleDAO;
    private final AssignmentDAO assignmentDAO;
    private final IncidentDAO incidentDAO;
    private final VehicleLocationDAO vehicleLocationDAO;
    private final NotificationDAO notificationDAO;
//     private final NotificationService notificationService;

    public ResponderProfileDTO getResponderProfile(Integer responderId) {
        User responder = userDAO.findById(responderId)
                .orElseThrow(() -> new RuntimeException("Responder not found"));

        if (!"operator".equals(responder.getRole())) {
            throw new RuntimeException("User is not a responder");
        }

        Vehicle vehicle = vehicleDAO.findByOperatorId(responderId).orElse(null);

        VehicleDetailsDTO vehicleDTO = null;
        if (vehicle != null) {
            vehicleDTO = new VehicleDetailsDTO(
                    vehicle.getId(),
                    vehicle.getType(),
                    vehicle.getStatus(),
                    vehicle.getCapacity());
        }

        return new ResponderProfileDTO(
                responder.getId(),
                responder.getName(),
                responder.getEmail(),
                responder.getRole(),
                vehicleDTO);
    }

    public List<AssignmentDTO> getActiveAssignments(Integer responderId) {
        Vehicle vehicle = vehicleDAO.findByOperatorId(responderId)
                .orElseThrow(() -> new RuntimeException("No vehicle assigned to responder"));

        List<Assignment> assignments = assignmentDAO.findByVehicleIdAndStatus(vehicle.getId(), "active");

        return assignments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public AssignmentDTO getAssignmentDetails(Integer assignmentId, Integer responderId) {
        Assignment assignment = assignmentDAO.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        Vehicle vehicle = vehicleDAO.findByOperatorId(responderId)
                .orElseThrow(() -> new RuntimeException("No vehicle assigned"));

        if (!assignment.getVehicleId().equals(vehicle.getId())) {
            throw new RuntimeException("Not authorized to view this assignment");
        }

        return convertToDTO(assignment);
    }

    public LocationsResponseDTO getAssignmentLocations(Integer assignmentId, Integer responderId) {
        Assignment assignment = assignmentDAO.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        Vehicle vehicle = vehicleDAO.findByOperatorId(responderId)
                .orElseThrow(() -> new RuntimeException("No vehicle assigned"));

        if (!assignment.getVehicleId().equals(vehicle.getId())) {
            throw new RuntimeException("Not authorized");
        }

        // Get latest vehicle location
        VehicleLocation latestLocation = vehicleLocationDAO
                .findTopByVehicleIdOrderByTimeStampDesc(vehicle.getId())
                .orElseThrow(() -> new RuntimeException("No location data for vehicle"));

        LocationDTO vehicleLocation = new LocationDTO(
                latestLocation.getLatitude(),
                latestLocation.getLongitude(),
                latestLocation.getTimeStamp());

        VehicleLocationDTO vehicleDTO = new VehicleLocationDTO(
                vehicle.getId(),
                vehicle.getType(),
                vehicleLocation);

        // Get incident location
        Incident incident = incidentDAO.findById(assignment.getIncidentId())
                .orElseThrow(() -> new RuntimeException("Incident not found"));

        LocationDTO incidentLocation = new LocationDTO(
                incident.getLatitude(),
                incident.getLongitude(),
                incident.getTimeReported());

        IncidentLocationDTO incidentDTO = new IncidentLocationDTO(
                incident.getId(),
                incident.getType(),
                incident.getLevel(),
                incidentLocation);

        return new LocationsResponseDTO(vehicleDTO, incidentDTO);
    }

    @Transactional
    public void updateVehicleLocation(Integer responderId, LocationDTO locationDTO) {
        Vehicle vehicle = vehicleDAO.findByOperatorId(responderId)
                .orElseThrow(() -> new RuntimeException("No vehicle assigned"));

        vehicleLocationDAO.saveWithCoordinates(
                vehicle.getId(),
                locationDTO.getLatitude(),
                locationDTO.getLongitude());
    }

    @Transactional
    public void updateStatus(Integer assignmentId, Integer responderId, StatusUpdateDTO statusDTO) {
        Assignment assignment = assignmentDAO.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        Vehicle vehicle = vehicleDAO.findByOperatorId(responderId)
                .orElseThrow(() -> new RuntimeException("No vehicle assigned"));

        if (!assignment.getVehicleId().equals(vehicle.getId())) {
            throw new RuntimeException("Not authorized");
        }

        // Validate status transition
        validateStatusTransition(vehicle.getStatus(), statusDTO.getVehicleStatus());

        // Update vehicle status
        if (statusDTO.getVehicleStatus() != null) {
            vehicleDAO.updateStatus(vehicle.getId(), statusDTO.getVehicleStatus());
        }

        // Update assignment status
        if (statusDTO.getAssignmentStatus() != null) {
            Timestamp timeResolved = null;

            if ("completed".equals(statusDTO.getAssignmentStatus())) {
                timeResolved = Timestamp.valueOf(LocalDateTime.now());

                // Update incident status
                incidentDAO.updateStatus(
                        assignment.getIncidentId(),
                        "resolved",
                        timeResolved);

                // Return vehicle to available
                vehicleDAO.updateStatus(vehicle.getId(), "Available");
            }

            assignmentDAO.updateStatus(
                    assignmentId,
                    statusDTO.getAssignmentStatus(),
                    timeResolved);
        }

        // Notify dispatcher
        User dispatcher = userDAO.findById(assignment.getDispatcherId())
                .orElse(null);

        if (dispatcher != null) {
        //     notificationService.notifyDispatcher(
        //             dispatcher.getId(),
        //             "STATUS_UPDATE",
        //             String.format("Vehicle %s updated status: %s",
        //                     vehicle.getId(),
        //                     statusDTO.getVehicleStatus()));
        }
    }

    public List<AssignmentDTO> getAssignmentHistory(Integer responderId, int page, int size) {
        Vehicle vehicle = vehicleDAO.findByOperatorId(responderId)
                .orElseThrow(() -> new RuntimeException("No vehicle assigned"));

        List<Assignment> assignments = assignmentDAO
                .findByVehicleIdOrderByTimeAssignedDesc(vehicle.getId());

        return assignments.stream()
                .skip((long) page * size)
                .limit(size)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private void validateStatusTransition(String currentStatus, String newStatus) {
        if (newStatus == null)
            return;

        boolean isValid = false;
        switch (currentStatus) {
            case "Available":
                isValid = "On Route".equals(newStatus);
                break;
            case "On Route":
                isValid = "Resolving".equals(newStatus) || "Available".equals(newStatus);
                break;
            case "Resolving":
                isValid = "Available".equals(newStatus);
                break;
        }

        if (!isValid) {
            throw new RuntimeException(
                    String.format("Invalid status transition from %s to %s",
                            currentStatus, newStatus));
        }
    }

    private AssignmentDTO convertToDTO(Assignment assignment) {
        Incident incident = incidentDAO.findById(assignment.getIncidentId())
                .orElseThrow(() -> new RuntimeException("Incident not found"));

        Vehicle vehicle = vehicleDAO.findById(assignment.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        IncidentDetailsDTO incidentDTO = new IncidentDetailsDTO(
                incident.getId(),
                incident.getType(),
                incident.getLevel(),
                incident.getDescription(),
                incident.getLatitude(),
                incident.getLongitude(),
                incident.getStatus(),
                incident.getTimeReported());

        VehicleDetailsDTO vehicleDTO = new VehicleDetailsDTO(
                vehicle.getId(),
                vehicle.getType(),
                vehicle.getStatus(),
                vehicle.getCapacity());

        return new AssignmentDTO(
                assignment.getId(),
                incident.getId(),
                vehicle.getId(),
                assignment.getStatus(),
                assignment.getTimeAssigned(),
                assignment.getTimeResolved(),
                incidentDTO,
                vehicleDTO);
    }

    /**
     * Get all assignments (active, completed, canceled, rejected)
     */
    public List<AssignmentDTO> getAllAssignments(Integer responderId, int page, int size) {
        Vehicle vehicle = vehicleDAO.findByOperatorId(responderId)
                .orElseThrow(() -> new RuntimeException("No vehicle assigned to responder"));

        // Get all assignments, not filtered by status
        List<Assignment> assignments = assignmentDAO
                .findByVehicleIdOrderByTimeAssignedDesc(vehicle.getId());

        return assignments.stream()
                .skip((long) page * size)
                .limit(size)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get notifications for responder
     */
    public List<NotificationDTO> getNotifications(Integer responderId, int page, int size) {
        Vehicle vehicle = vehicleDAO.findByOperatorId(responderId)
                .orElseThrow(() -> new RuntimeException("No vehicle assigned to responder"));

        List<Notification> notifications = notificationDAO.findPendingByNotifiedId(
                responderId,
                size,
                page * size);

        return notifications.stream()
                .map(this::convertNotificationToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Respond to assignment (accept or reject)
     */
    @Transactional
    public AssignmentActionResponseDTO respondToAssignment(
            Integer assignmentId,
            Integer responderId,
            String response) {

        Assignment assignment = assignmentDAO.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        Vehicle vehicle = vehicleDAO.findByOperatorId(responderId)
                .orElseThrow(() -> new RuntimeException("No vehicle assigned"));

        if (!assignment.getVehicleId().equals(vehicle.getId())) {
            throw new RuntimeException("Not authorized for this assignment");
        }

        Incident incident = incidentDAO.findById(assignment.getIncidentId())
                .orElseThrow(() -> new RuntimeException("Incident not found"));

        if ("accepted".equalsIgnoreCase(response)) {
            // ACCEPT: Update statuses
            assignmentDAO.updateStatus(assignmentId, "active", null);
            vehicleDAO.updateStatus(vehicle.getId(), "ON_ROUTE");
            incidentDAO.updateStatus(assignment.getIncidentId(), "assigned", null);

            // Remove notification
            notificationDAO.deleteByNotifiedIdAndAssignmentId(responderId, assignmentId);

            // Notify dispatcher
        //     notificationService.notifyDispatcher(
        //             assignment.getDispatcherId(),
        //             "ASSIGNMENT_RESPONSE",
        //             java.util.Map.of(
        //                     "assignmentId", assignmentId,
        //                     "responderId", responderId,
        //                     "response", "accepted",
        //                     "message", "Responder accepted the assignment"));

            return new AssignmentActionResponseDTO(
                    true,
                    "Assignment accepted",
                    convertToDTO(assignment),
                    null,
                    null);

        } else if ("rejected".equalsIgnoreCase(response)) {
            // REJECT: Update statuses
            assignmentDAO.updateStatus(assignmentId, "rejected", null);
            // Vehicle stays AVAILABLE
            incidentDAO.updateStatus(assignment.getIncidentId(), "pending", null);

            // Remove notification
            notificationDAO.deleteByNotifiedIdAndAssignmentId(responderId, assignmentId);

            // Notify dispatcher
        //     notificationService.notifyDispatcher(
        //             assignment.getDispatcherId(),
        //             "ASSIGNMENT_RESPONSE",
        //             java.util.Map.of(
        //                     "assignmentId", assignmentId,
        //                     "responderId", responderId,
        //                     "response", "rejected",
        //                     "message", "Responder rejected the assignment"));

            return new AssignmentActionResponseDTO(
                    true,
                    "Assignment rejected",
                    null,
                    null,
                    null);

        } else {
            throw new RuntimeException("Invalid response: " + response);
        }
    }

    /**
     * Cancel assignment
     */
    @Transactional
    public AssignmentActionResponseDTO cancelAssignment(Integer assignmentId, Integer responderId) {
        Assignment assignment = assignmentDAO.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        Vehicle vehicle = vehicleDAO.findByOperatorId(responderId)
                .orElseThrow(() -> new RuntimeException("No vehicle assigned"));

        if (!assignment.getVehicleId().equals(vehicle.getId())) {
            throw new RuntimeException("Not authorized");
        }

        // Update statuses
        assignmentDAO.updateStatus(assignmentId, "canceled", null);
        vehicleDAO.updateStatus(vehicle.getId(), "AVAILABLE");
        incidentDAO.updateStatus(assignment.getIncidentId(), "pending", null);

        // Notify dispatcher
        // notificationService.notifyDispatcher(
        //         assignment.getDispatcherId(),
        //         "ASSIGNMENT_CANCELLED",
        //         java.util.Map.of(
        //                 "assignmentId", assignmentId,
        //                 "responderId", responderId,
        //                 "vehicleId", vehicle.getId(),
        //                 "message", "Responder cancelled the assignment"));

        return new AssignmentActionResponseDTO(
                true,
                "Assignment cancelled",
                convertToDTO(assignment),
                null,
                null);
    }

    /**
     * Convert Notification to DTO with full assignment and incident details
     */
    private NotificationDTO convertNotificationToDTO(Notification notification) {
        // Parse the content to extract assignmentId
        // Assuming content is JSON like: {"assignmentId": 45, "message": "..."}
        // You'll need a JSON parser or store assignmentId separately

        // For now, simplified version:
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setNotifiedId(notification.getNotifiedId());
        dto.setNotificationType(notification.getNotificationType());
        dto.setContent(notification.getContent());
        dto.setTimeSent(notification.getTimeSent());
        dto.setTimeDelivered(notification.getTimeDelivered());

        // TODO: Parse content to get assignmentId and load full details
        // For now, return basic notification

        return dto;
    }
}