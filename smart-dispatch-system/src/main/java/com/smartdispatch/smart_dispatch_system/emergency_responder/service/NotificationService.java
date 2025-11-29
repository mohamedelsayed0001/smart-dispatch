package com.smartdispatch.smart_dispatch_system.emergency_responder.service;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.smartdispatch.smart_dispatch_system.emergency_responder.dto.WebSocketMessageDTO;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Send notification to a specific responder
     */
    public void notifyResponder(Integer responderId, String messageType, Object payload) {
        WebSocketMessageDTO message = new WebSocketMessageDTO(
            messageType,
            payload,
            LocalDateTime.now()
        );

        messagingTemplate.convertAndSendToUser(
            responderId.toString(),
            "/queue/notifications",
            message
        );
    }

    /**
     * Send notification to a specific dispatcher
     */
    public void notifyDispatcher(Integer dispatcherId, String messageType, Object payload) {
        WebSocketMessageDTO message = new WebSocketMessageDTO(
            messageType,
            payload,
            LocalDateTime.now()
        );

        messagingTemplate.convertAndSendToUser(
            dispatcherId.toString(),
            "/queue/notifications",
            message
        );
    }

    /**
     * Broadcast to all dispatchers
     */
    public void broadcastToDispatchers(String messageType, Object payload) {
        WebSocketMessageDTO message = new WebSocketMessageDTO(
            messageType,
            payload,
            LocalDateTime.now()
        );

        messagingTemplate.convertAndSend("/topic/dispatchers", message);
    }

    /**
     * Send location update to dispatcher
     */
    public void sendLocationUpdate(Integer dispatcherId, Integer vehicleId, Object locationData) {
        WebSocketMessageDTO message = new WebSocketMessageDTO(
            "LOCATION_UPDATE",
            locationData,
            LocalDateTime.now()
        );

        messagingTemplate.convertAndSendToUser(
            dispatcherId.toString(),
            "/queue/vehicle-location/" + vehicleId,
            message
        );
    }
}
