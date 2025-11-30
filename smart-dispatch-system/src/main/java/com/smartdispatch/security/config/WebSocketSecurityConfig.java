package com.smartdispatch.security.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.config.annotation.web.socket.EnableWebSocketSecurity;
import org.springframework.security.messaging.access.intercept.MessageMatcherDelegatingAuthorizationManager;


@Configuration
@EnableWebSocketSecurity
public class WebSocketSecurityConfig {

    @Bean
    public AuthorizationManager<Message<?>> messageAuthorizationManager(
            MessageMatcherDelegatingAuthorizationManager.Builder messages
        ) {
        messages
            .anyMessage().permitAll();
            // .simpTypeMatchers(SimpMessageType.CONNECT, SimpMessageType.DISCONNECT).permitAll()
            // .simpSubscribeDestMatchers("/topic/public/**").authenticated()
            // .simpSubscribeDestMatchers("/topic/admin/**").hasRole("ADMIN")
            // .simpSubscribeDestMatchers("/topic/dispatcher/**").hasAnyRole("ADMIN", "DISPATCHER")
            // .simpSubscribeDestMatchers("/user/**")
            //     .access((authentication, context) -> {
            //         AppUserDetails user = (AppUserDetails) authentication.get().getPrincipal();
            //         Long userId = user.getId();
            //         String destination = (String) context.getMessage().getHeaders().get(SimpMessageHeaderAccessor.DESTINATION_HEADER);
            //         boolean isAuthorized = destination != null && destination.contains(String.valueOf(userId));
            //         return new AuthorizationDecision(isAuthorized);
            //     })
            // .simpDestMatchers("/app/**").authenticated()
            // .anyMessage().denyAll();

        return messages.build();
    }

    @Bean
    public boolean csrfDisabled() {
        return true;
    }
    
    @Bean
    public boolean sameOriginDisabled() {
        return false;
    }

    @Bean
    public ChannelInterceptor csrfChannelInterceptor() {
        return new ChannelInterceptor() {
            // This anonymous class implements ChannelInterceptor but does nothing,
            // effectively disabling CSRF on the messaging channel.
        };
    }
}
