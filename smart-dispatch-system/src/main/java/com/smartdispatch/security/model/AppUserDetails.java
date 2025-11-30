package com.smartdispatch.security.model;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;

public class AppUserDetails implements UserDetails {

    private final Long id;
    private final String username;
    private final String email;
    private final String password;
    private final List<GrantedAuthority> authorities;

    public AppUserDetails(Long id, String username, String email, String role) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = "";

        this.authorities = List.of(new SimpleGrantedAuthority("ROLE_"+role));
    }

    public Long getId() { return id; }

    @Override
    public List<GrantedAuthority> getAuthorities() {
        return this.authorities;
    }

    @Override
    public String getPassword() {
        return this.password;
    }

    @Override
    public String getUsername() {
        return this.username;
    }

    public String getEmail() {
        return this.email;
    }

    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}
