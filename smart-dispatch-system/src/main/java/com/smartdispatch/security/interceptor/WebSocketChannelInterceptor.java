package com.smartdispatch.security.interceptor;

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

    @Autowired
    private JwtService jwtService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        System.out.println("bombena WebSocketChannelInterceptor: PreSend called for command " + accessor.getCommand());

        // If not a CONNECT frame, leave unchanged
        if (accessor.getCommand() == null || !accessor.getCommand().equals(StompCommand.CONNECT)) {
            return message;
        }


        System.out.println("CONNECT command detected");

        String authHeader = accessor.getFirstNativeHeader("Authorization");
        System.out.println("Authorization header: " + (authHeader != null ? "present" : "MISSING"));

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("ERROR: Invalid or missing JWT token");
            throw new IllegalArgumentException("Invalid or missing JWT token");
        }

        String jwt = authHeader.substring(7);
        System.out.println("JWT token extracted, length: " + jwt.length());
        
        AppUserDetails userDetails = jwtService.extractUserDetails(jwt);

        if (userDetails == null) {
            System.out.println("ERROR: JWT validation failed - userDetails is null");
            throw new IllegalArgumentException("Invalid JWT token");
        }

        System.out.println("JWT validated successfully for user: " + userDetails.getUsername());
        System.out.println("User ID: " + userDetails.getId());
        System.out.println("User Email: " + userDetails.getEmail());
        System.out.println("User Authorities: " + userDetails.getAuthorities());

        List<GrantedAuthority> authorities = userDetails.getAuthorities();
        System.out.println("Total authorities: " + authorities.size());
        authorities.forEach(auth -> System.out.println("  - Authority: " + auth.getAuthority()));

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        authorities
                );


        System.out.println("*****"+ authentication.isAuthenticated() +"******");

        accessor.setUser(authentication);
        SecurityContextHolder.getContext().setAuthentication(authentication);


        System.out.println("WebSocket authentication successful for user: " + userDetails.getUsername() + " with roles: " + authorities);

        return MessageBuilder.createMessage(message.getPayload(), accessor.getMessageHeaders());
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE; 
    }
}
