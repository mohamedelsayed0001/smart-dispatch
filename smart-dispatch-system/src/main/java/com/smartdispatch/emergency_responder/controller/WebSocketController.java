package com.smartdispatch.emergency_responder.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import com.smartdispatch.emergency_responder.dto.*;
import com.smartdispatch.emergency_responder.service.ResponderService;

@Controller
@RequiredArgsConstructor
public class WebSocketController {

    private final ResponderService responderService;

    /**
     * Handle real-time location updates from responder
     * URL: /app/location/update/{responderId}
     */
    @MessageMapping("/location/update/{responderId}")
    public void handleLocationUpdate(
            @DestinationVariable Integer responderId,
            @Payload LocationDTO locationDTO) {
        
        // Save location to database
        responderService.updateVehicleLocation(responderId, locationDTO);
        
        // You can broadcast location to dispatcher if needed
        // notificationService.sendLocationUpdate(dispatcherId, vehicleId, locationDTO);
    }

    /**
     * Handle responder connection
     * URL: /app/responder/connect/{responderId}
     */
    @MessageMapping("/responder/connect/{responderId}")
    public void handleResponderConnection(
            @DestinationVariable Integer responderId,
            SimpMessageHeaderAccessor headerAccessor) {
        
        System.out.println("Responder connected: " + responderId);
        
        // Store session info
        headerAccessor.getSessionAttributes().put("userId", responderId);
        headerAccessor.getSessionAttributes().put("userType", "responder");
    }

    /**
     * Handle responder disconnection
     * URL: /app/responder/disconnect/{responderId}
     */
    @MessageMapping("/responder/disconnect/{responderId}")
    public void handleResponderDisconnection(@DestinationVariable Integer responderId) {
        System.out.println("Responder disconnected: " + responderId);
        
        // Handle cleanup if needed
    }
}