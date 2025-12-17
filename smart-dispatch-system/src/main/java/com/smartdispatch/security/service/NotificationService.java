package com.smartdispatch.security.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.smartdispatch.dispatcher.domains.dtos.IncidentDto;
import com.smartdispatch.security.service.websocketDto.*;

@Service
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void notifyChannel(String channelName, Object messagePayload) {
        String destination = "/topic/" + channelName;

        if (messagePayload == null) {
            return;
        }
        messagingTemplate.convertAndSend(destination, messagePayload);

        System.out.println("Sent message to " + destination + ": " + messagePayload);
    }

    public void notifyVehicleUpdate(VehicleUpdateDto vehicleUpdateDto) {
        notifyChannel("vehicle/update", vehicleUpdateDto);
    }

    public void notifyIncidentUpdate(IncidentDto incident) {
        notifyChannel("incidents/update", incident);
    }

    public void notifyAssignmentUpdate(AssignmentUpdateDto assignmentUpdateDto) {
        notifyChannel("assignment/update", assignmentUpdateDto);
    }

    public void notifyNewAssignment(NewAssignmentDto assignmentDto, Integer userId) {
        notifyChannel("assignment/new/" + userId, assignmentDto);
    }
}