package com.smartdispatch.dispatcher.services.imp;

import com.smartdispatch.dispatcher.domains.dtos.AssignmentDto;
import com.smartdispatch.dispatcher.domains.dtos.IncidentDto;
import com.smartdispatch.dispatcher.domains.dtos.VehicleDto;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class WebSocketNotificationServiceImp {

    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketNotificationServiceImp(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }


    public void notifyVehicleUpdate(VehicleDto vehicle) {
        // Send the full VehicleDto
        messagingTemplate.convertAndSend("/topic/vehicles", vehicle);
    }


    public void notifyIncidentUpdate(IncidentDto incident) {
        // Send the full IncidentDto
        messagingTemplate.convertAndSend("/topic/incidents", incident);
    }

    public void notifyAssignmentUpdate(AssignmentDto assignment) {
        // Send the full AssignmentDto
        messagingTemplate.convertAndSend("/topic/assignments", assignment);
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