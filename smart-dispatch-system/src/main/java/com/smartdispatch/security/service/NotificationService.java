package com.smartdispatch.security.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

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
        // The framework automatically prepends "/user/{userId}" to the destination.
        // E.g., for user 'alex', destination '/queue/updates' -> '/user/alex/queue/updates'
        System.out.println("Sending message to user " + userId + " at destination " + destination);
        messagingTemplate.convertAndSendToUser(
            userId,
            destination,
            messagePayload
        );
    }
}