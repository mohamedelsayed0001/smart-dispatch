package com.smartdispatch.security.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

import org.springframework.stereotype.Service;

import com.smartdispatch.security.model.AppUserDetails;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {

    private static final String SECRET = "1234567890abcdef1234567890abcdef";
    private static final long EXPIRATION_MS = 24 * 60 * 60 * 1000;

    public String generateToken(Long userId, String username, String email, String role) {
        Map<String, String> claims = new HashMap<>();
        claims.put("id", String.valueOf(userId));
        claims.put("username", username);
        claims.put("email", email);
        claims.put("role", role);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(userId.toString())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_MS))
                .signWith(SignatureAlgorithm.HS256, SECRET.getBytes())
                .compact();
    }

    public AppUserDetails extractUserDetails(String jwt) {
        Claims claims = extractAllClaims(jwt);
        if (claims == null) return null;
        return new AppUserDetails(
                Long.valueOf((String) claims.get("id")),
                (String) claims.get("username"),
                (String) claims.get("email"),
                (String) claims.get("role")
        );
    }

    // Validate token
    public boolean isTokenValid(String jwt) {
        try {
            Claims claims = extractAllClaims(jwt);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parser()
                    .setSigningKey(SECRET.getBytes())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        }
        catch (Exception e) {
            return null;
        }
    }
}