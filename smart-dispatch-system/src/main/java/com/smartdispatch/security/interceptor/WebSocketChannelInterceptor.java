package com.smartdispatch.security.interceptor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.Ordered;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.smartdispatch.security.model.AppUserDetails;
import com.smartdispatch.security.service.JwtService;

import java.util.List;

@Component
public class WebSocketChannelInterceptor implements ChannelInterceptor, Ordered {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketChannelInterceptor.class);

    @Autowired
    private JwtService jwtService;

    @SuppressWarnings("null")
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        logger.debug("WebSocketChannelInterceptor: PreSend called for command {}", accessor.getCommand());

        // If not a CONNECT frame, leave unchanged
        if (accessor.getCommand() == null || !accessor.getCommand().equals(StompCommand.CONNECT)) {
            return message;
        }


        logger.debug("CONNECT command detected");

        String authHeader = accessor.getFirstNativeHeader("Authorization");
        logger.debug("Authorization header: {}", (authHeader != null ? "present" : "MISSING"));

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.error("Invalid or missing JWT token");
            throw new IllegalArgumentException("Invalid or missing JWT token");
        }

        String jwt = authHeader.substring(7);
        logger.debug("JWT token extracted, length: {}", jwt.length());
        
        AppUserDetails userDetails = jwtService.extractUserDetails(jwt);

        if (userDetails == null) {
            logger.error("JWT validation failed - userDetails is null");
            throw new IllegalArgumentException("Invalid JWT token");
        }

        logger.debug("JWT validated successfully for user: {}", userDetails.getUsername());
        logger.debug("User ID: {}", userDetails.getId());
        logger.debug("User Email: {}", userDetails.getEmail());
        logger.debug("User Authorities: {}", userDetails.getAuthorities());

        List<GrantedAuthority> authorities = userDetails.getAuthorities();
        logger.debug("Total authorities: {}", authorities.size());
        authorities.forEach(auth -> logger.debug("  - Authority: {}", auth.getAuthority()));

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        authorities
                );


        logger.debug("Authentication status: {}", authentication.isAuthenticated());

        accessor.setUser(authentication);
        SecurityContextHolder.getContext().setAuthentication(authentication);


        logger.debug("WebSocket authentication successful for user: {} with roles: {}", userDetails.getUsername(), authorities);

        return MessageBuilder.createMessage(message.getPayload(), accessor.getMessageHeaders());
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE; 
    }
}
