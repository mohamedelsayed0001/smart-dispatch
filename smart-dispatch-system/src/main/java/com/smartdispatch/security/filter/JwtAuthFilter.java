package com.smartdispatch.security.filter;

import java.io.IOException;

import com.smartdispatch.security.service.JwtService;
import org.springframework.core.env.Environment;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final List<String> PUBLIC_URLS = List.of(
            "/api/auth/login",
            "/api/auth/signup",
            "/api/check/users",
            "/ws",
            "/api/responder"
    );

    private final JwtService jwtService;
    private final Environment env;

    JwtAuthFilter(JwtService jwtService, Environment env) {
        this.jwtService = jwtService;
        this.env = env;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

<<<<<<< HEAD
        // Allow OPTIONS requests for CORS preflight
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
=======
        // Read the security flag from the environment at runtime so changes in properties take effect
        boolean securityEnabled = true;
        try {
            securityEnabled = Boolean.parseBoolean(env.getProperty("app.security.enabled", "true"));
        } catch (Exception e) {
            System.err.println("JwtAuthFilter: Failed to read app.security.enabled, defaulting to true: " + e.getMessage());
        }

        // If security is disabled, skip authentication checks and continue the chain
        if (!securityEnabled) {
>>>>>>> e80bbd1 (reassign)
            filterChain.doFilter(request, response);
            return;
        }

        String path = request.getServletPath();

        System.out.println("JwtAuthFilter: Processing request for path: " + path);

        for (String p : PUBLIC_URLS) {
            if (path.startsWith(p)) {
                try {
                    filterChain.doFilter(request, response);
                } catch (ServletException | IOException e) {
                    System.err.println("Exception thrown during filterChain.doFilter for public path: " + e.getMessage());
                    throw e;
                }
                return;
            }
        }
        System.out.println("JwtAuthFilter: Secured path accessed: " + path);
        for (String prefix : PUBLIC_URLS) {
            if (path.startsWith(prefix)) {
                filterChain.doFilter(request, response);
                return;
            }
        }

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            try {
                response.getWriter().write("Missing or invalid Authorization header");
            } catch (IOException e) {
                System.err.println("IOException trying to write response for missing header: " + e.getMessage());
                throw e;
            }
            return;
        }

        String jwt = authHeader.substring(7);

        UserDetails userDetails = jwtService.extractUserDetails(jwt);

        if (userDetails == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            try {
                response.getWriter().write("Invalid or expired token");
            } catch (IOException e) {
                System.err.println("IOException trying to write response for invalid token: " + e.getMessage());
            }
        }

        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                userDetails,
                null,
                userDetails.getAuthorities()
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        try {
            filterChain.doFilter(request, response);
        } catch (ServletException | IOException e) {
            System.err.println("Exception thrown during filterChain.doFilter after successful authentication: " + e.getMessage());
            throw e;
        }
    }

    @Override
    protected boolean shouldNotFilterAsyncDispatch() {
        return true;
    }
}
