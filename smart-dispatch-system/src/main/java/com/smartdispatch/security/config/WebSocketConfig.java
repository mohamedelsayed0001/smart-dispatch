package com.smartdispatch.security.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable a simple memory-based message broker to send messages to clients
        config.enableSimpleBroker("/topic");

        // Application destination prefix for messages from client to server
        config.setApplicationDestinationPrefixes("/app");

        System.out.println("✅ Message broker configured - Topics: /topic, App prefix: /app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Register the WebSocket endpoint that clients will connect to
        registry.addEndpoint("/ws-car-location")
                .setAllowedOriginPatterns("*")  // Allow all origins for development
                .withSockJS();  // Enable SockJS fallback for browsers that don't support WebSocket

        System.out.println("✅ WebSocket endpoint registered: /ws-car-location");
        System.out.println("   - Allowed origins: *");
        System.out.println("   - SockJS enabled");
        System.out.println("   - Full URL: http://localhost:8080/ws-car-location");
    }
}