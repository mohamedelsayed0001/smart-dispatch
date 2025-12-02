package com.smartdispatch.authentication.services;

import java.util.Optional;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.stereotype.Service;

import com.smartdispatch.authentication.dao.LoginDAO;
import com.smartdispatch.authentication.dto.LoginRequestDTO;
import com.smartdispatch.authentication.dto.LoginResponseDTO;
import com.smartdispatch.authentication.model.User;
import com.smartdispatch.security.service.JwtService;

@Service
public class LoginService {

    private final LoginDAO loginDAO;
    private final JwtService jwtService;
    public LoginService(
                LoginDAO loginDAO,
                JwtService jwtService
    ) {
        this.loginDAO = loginDAO;
        this.jwtService = jwtService;
    }

    
    public LoginResponseDTO loginWithEmailPassword(LoginRequestDTO request) {

        if (request.getEmail() == null || request.getEmail().isEmpty() ||
            request.getPassword() == null || request.getPassword().isEmpty()) {
            return null;
        }

        return login(request.getEmail(), request.getPassword());
    }


    public LoginResponseDTO login(String email, String rawPassword) {

        try {
            Optional<User> optUser = loginDAO.findByEmail(email);
            if (optUser.isEmpty()) return null;
            User user = optUser.get();


            String role = "ROLE_" + user.getRole(); // OPERATOR, DISPATCHER, ADMIN…

            String token = jwtService.generateToken(
                    user.getId(),
                    user.getName(),
                    user.getEmail(),
                    role
            );

            return new LoginResponseDTO(
                    user.getId(),
                    user.getName(),
                    user.getEmail(),
                    user.getRole(),
                    token
            );

        } catch (EmptyResultDataAccessException ignored) {}

        return null;
    }

  
    public LoginResponseDTO signup(User newUser) {

        if (newUser.getEmail() == null || newUser.getEmail().isEmpty() ||
            newUser.getPassword() == null || newUser.getPassword().isEmpty() ||
            newUser.getName() == null || newUser.getName().isEmpty() ||
            newUser.getRole() == null || newUser.getRole().isEmpty()) {
            return null;
        }

        if (loginDAO.findByEmail(newUser.getEmail()).isPresent()) {
            return new LoginResponseDTO(0L, "", "", "", "EMAIL_EXISTS");
        }

        long generatedId = loginDAO.createUser(newUser);
        newUser.setId(generatedId);

        String token = jwtService.generateToken(
                newUser.getId(),
                newUser.getName(),
                newUser.getEmail(),
                "ROLE_" + newUser.getRole()
        );

        return new LoginResponseDTO(
                newUser.getId(),
                newUser.getName(),
                newUser.getEmail(),
                newUser.getRole(),
                token
        );
    }
}

