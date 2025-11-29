package com.smartdispatch.smart_dispatch_system.emergency_responder.service;


import com.smartdispatch.smart_dispatch_system.emergency_responder.dao.*;
import com.smartdispatch.smart_dispatch_system.emergency_responder.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

/**
 * Custom UserDetailsService implementation that loads user data from database
 * using JDBC.
 * This service is used by Spring Security to authenticate users.
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

  private final UserDAO userDAO;

  /**
   * Load user by email (username in Spring Security context)
   * This method is called by Spring Security during authentication
   */
  @Override
  public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
    // Find user in database by email
    User user = userDAO.findByEmail(email)
        .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

    // Convert role to Spring Security format (ROLE_XXX)
    // Database has: "operator" → Spring Security needs: "ROLE_OPERATOR"
    String role = "ROLE_" + user.getRole().toUpperCase();

    // Build Spring Security UserDetails object
    return org.springframework.security.core.userdetails.User.builder()
        .username(user.getEmail()) // Use email as username
        .password(user.getPassword()) // Password should be BCrypt encrypted
        .authorities(Collections.singletonList(new SimpleGrantedAuthority(role)))
        .accountExpired(false)
        .accountLocked(false)
        .credentialsExpired(false)
        .disabled(false)
        .build();
  }

  /**
   * Helper method to get user ID from email
   * Useful in controllers when you need user ID from Authentication object
   */
  public Integer getUserIdByEmail(String email) {
    return userDAO.findByEmail(email)
        .map(User::getId)
        .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
  }

  /**
   * Helper method to get full User object by email
   */
  public User getUserByEmail(String email) {
    return userDAO.findByEmail(email)
        .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
  }

  /**
   * Check if user exists by email
   */
  public boolean userExists(String email) {
    return userDAO.findByEmail(email).isPresent();
  }
}