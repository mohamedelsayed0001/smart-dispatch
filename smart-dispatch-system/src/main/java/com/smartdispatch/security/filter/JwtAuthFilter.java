package com.smartdispatch.security.filter;

import java.io.IOException;

import com.smartdispatch.security.service.JwtService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthFilter.class);

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
        // Allow OPTIONS requests for CORS preflight
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }


        String path = request.getServletPath();

        logger.debug("JwtAuthFilter: Processing request for path: {}", path);

        // Allow public URLs (including SockJS endpoints)
        for (String p : PUBLIC_URLS) {
            if (path.startsWith(p)) {
                filterChain.doFilter(request, response);
                return;
            }
        }

        logger.debug("JwtAuthFilter: Secured path accessed: {}", path);

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            try {
                response.getWriter().write("Missing or invalid Authorization header");
            } catch (IOException e) {
                logger.error("IOException writing response for missing header: {}", e.getMessage(), e);
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
                logger.error("IOException writing response for invalid token: {}", e.getMessage(), e);
            }
            return;
        }

        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                userDetails,
                null,
                userDetails.getAuthorities()
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilterAsyncDispatch() {
        return true;
    }
}
