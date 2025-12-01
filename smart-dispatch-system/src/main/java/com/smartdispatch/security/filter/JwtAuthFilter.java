package com.smartdispatch.security.filter;

import java.io.IOException;

import com.smartdispatch.security.model.AppUserDetails;
import com.smartdispatch.security.service.JwtService;

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
            "/ws"
    );

    private final JwtService jwtService;

    JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

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
