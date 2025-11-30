package com.smartdispatch.security.config;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.smartdispatch.security.interceptor.WebSocketChannelInterceptor;

@Configuration
@EnableWebSocketMessageBroker 
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketConfig.class);

    @Autowired
    private WebSocketChannelInterceptor webSocketChannelInterceptor;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        logger.info("Configuring message broker");

        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");

        logger.info("Message broker configured: /topic broker, /app prefix");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        logger.info("Registering STOMP endpoints");

        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*");

        logger.info("STOMP endpoint registered: /ws");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        logger.info("Configuring client inbound channel");

        registration.interceptors(webSocketChannelInterceptor);

        logger.info("Channel interceptor registered");
    }

}