package com.smartdispatch.security.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.smartdispatch.dispatcher.domains.dtos.AssignmentDto;
import com.smartdispatch.dispatcher.domains.dtos.IncidentDto;
import com.smartdispatch.dispatcher.domains.dtos.VehicleDto;

@Service
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(
        SimpMessagingTemplate messagingTemplate
    ) {
        this.messagingTemplate = messagingTemplate;
    }

    public void notifyChannel(String channelName, Object messagePayload) {
        String destination = "/topic/" + channelName;

        messagingTemplate.convertAndSend(destination, messagePayload);

        System.out.println("Sent message to " + destination + ": " + messagePayload);
    }

    public void notifyUser(String userId, String destination, Object messagePayload) {

        System.out.println("Sending message to user " + userId + " at destination " + destination);
        
        messagingTemplate.convertAndSendToUser(
            userId,
            destination,
            messagePayload
        );
    }

    public void notifyVehicleUpdate(VehicleDto vehicle) {
        // Send to topic/vehicle/status
        messagingTemplate.convertAndSend("/topic/vehicle/status", vehicle);
    }


    public void notifyIncidentUpdate(IncidentDto incident) {
        // Send the full IncidentDto
        messagingTemplate.convertAndSend("/topic/incidents", incident);
    }

    public void notifyAssignmentUpdate(AssignmentDto assignment) {
        // Send to topic/vehicle/assignment
        messagingTemplate.convertAndSend("/topic/vehicle/assignment", assignment);
    }


    public void broadcastNotification(String type, String message) {
        SimpleNotification notification = new SimpleNotification(type, message);
        messagingTemplate.convertAndSend("/topic/notifications", notification);
    }


    public static class SimpleNotification {
        public String type;
        public String message;
        public long timestamp;

        public SimpleNotification(String type, String message) {
            this.type = type;
            this.message = message;
            this.timestamp = System.currentTimeMillis();
        }
    }
}