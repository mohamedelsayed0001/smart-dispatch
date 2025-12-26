package com.smartdispatch.check;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Controller
public class TestMessageController {

    /**
     * Public channel - broadcast to all
     * Client sends to: /app/public/send
     * Broadcast to: /topic/public/messages
     */
    @MessageMapping("/public/send")
    @SendTo("/topic/public/messages")
    public Map<String, Object> sendPublicMessage(String message) {
        System.out.println("Public message received: " + message);
        Map<String, Object> response = new HashMap<>();
        response.put("message", message);
        response.put("channel", "public");
        response.put("type", "public_message");
        response.put("timestamp", LocalDateTime.now().toString());
        return response;
    }

    /**
     * Admin channel - broadcast to admins
     * Client sends to: /app/admin/send
     * Broadcast to: /topic/admin/messages
     */
    @MessageMapping("/admin/send")
    @SendTo("/topic/admin/messages")
    public Map<String, Object> sendAdminMessage(String message) {
        System.out.println("Admin message received: " + message);
        Map<String, Object> response = new HashMap<>();
        response.put("message", message);
        response.put("channel", "admin");
        response.put("type", "admin_message");
        response.put("timestamp", LocalDateTime.now().toString());
        return response;
    }

    /**
     * Dispatcher channel - broadcast to dispatchers
     * Client sends to: /app/dispatcher/send
     * Broadcast to: /topic/dispatcher/messages
     */
    @MessageMapping("/dispatcher/send")
    @SendTo("/topic/dispatcher/messages")
    public Map<String, Object> sendDispatcherMessage(String message) {
        System.out.println("Dispatcher message received: " + message);
        Map<String, Object> response = new HashMap<>();
        response.put("message", message);
        response.put("channel", "dispatcher");
        response.put("type", "dispatcher_message");
        response.put("timestamp", LocalDateTime.now().toString());
        return response;
    }

    /**
     * User channel - user specific messages
     * Client sends to: /app/user/send
     * Broadcast to: /topic/user/messages
     */
    @MessageMapping("/user/send")
    @SendTo("/topic/user/messages")
    public Map<String, Object> sendUserMessage(String message) {
        System.out.println("User message received: " + message);
        Map<String, Object> response = new HashMap<>();
        response.put("message", message);
        response.put("channel", "user");
        response.put("type", "user_message");
        response.put("timestamp", LocalDateTime.now().toString());
        return response;
    }

    /**
     * App channel - application level messages
     * Client sends to: /app/app/send
     * Broadcast to: /topic/app/messages
     */
    @MessageMapping("/app/send")
    @SendTo("/topic/app/messages")
    public Map<String, Object> sendAppMessage(String message) {
        System.out.println("App message received: " + message);
        Map<String, Object> response = new HashMap<>();
        response.put("message", message);
        response.put("channel", "app");
        response.put("type", "app_message");
        response.put("timestamp", LocalDateTime.now().toString());
        return response;
    }
}
