package com.smartdispatch.security.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;
import com.smartdispatch.security.model.AppUserDetails;
import com.smartdispatch.model.enums.UserRole;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.crypto.SecretKey;

@Service
public class JwtService {

    private static final String SECRET = "1234567890abcdef1234567890abcdef";
    private static final long EXPIRATION_MS = 24 * 60 * 60 * 1000;

    public String generateToken(Long userId, String username, String email, UserRole role) {
        Map<String, String> claims = new HashMap<>();
        claims.put("id", String.valueOf(userId));
        claims.put("username", username);
        claims.put("email", email);
        claims.put("role", role.name());

        SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));

        return Jwts.builder()
                .claims(claims)
                .subject(userId.toString())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_MS))
                .signWith(key)
                .compact();
    }

    public AppUserDetails extractUserDetails(String jwt) {
        Claims claims = extractAllClaims(jwt);
        if (claims == null)
            return null;
        return new AppUserDetails(
                Long.valueOf((String) claims.get("id")),
                (String) claims.get("username"),
                (String) claims.get("email"),
                (String) claims.get("role"));
    }

    public boolean isTokenValid(String jwt) {
        try {
            extractAllClaims(jwt);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private Claims extractAllClaims(String token) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));

            return Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            return null;
        }
    }
}