package com.smartdispatch.websockets;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.smartdispatch.dispatcher.dtos.AssignmentDto;
import com.smartdispatch.dispatcher.dtos.IncidentDto;
import com.smartdispatch.websockets.websocketDto.*;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);
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

        logger.debug("Sent message to {}: {}", destination, messagePayload);
    }

    public void notifyVehicleUpdate(VehicleUpdateDto vehicleUpdateDto) {
        notifyChannel("vehicle/update", vehicleUpdateDto);
    }

    public void notifyIncidentUpdate(IncidentDto incident) {
        notifyChannel("incident/update", incident);
    }

    public void notifyAssignmentUpdate(AssignmentUpdateDto assignmentUpdateDto) {
        notifyChannel("assignment/update", assignmentUpdateDto);
    }

    public void notifyNewAssignment(Long operatorId, AssignmentDto assignmentDto) {
        notifyChannel("assignment/new/" + operatorId, assignmentDto);
    }
}