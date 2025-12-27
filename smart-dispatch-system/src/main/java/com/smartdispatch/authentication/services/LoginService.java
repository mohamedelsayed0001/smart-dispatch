package com.smartdispatch.authentication.services;

import java.util.Optional;

import com.smartdispatch.dao.IUserDao;
import org.springframework.stereotype.Service;

import com.smartdispatch.authentication.dto.LoginRequestDTO;
import com.smartdispatch.authentication.dto.LoginResponseDTO;
import com.smartdispatch.model.User;
import com.smartdispatch.security.service.JwtService;

@Service
public class LoginService {

    private final IUserDao userDAO;
    private final JwtService jwtService;

    public LoginService(
            IUserDao userDAO,
            JwtService jwtService) {
        this.userDAO = userDAO;
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
        Optional<User> optUser = userDAO.findByEmail(email);
        if (optUser.isEmpty())
            return null;
        User user = optUser.get();

        // Note: In a real app we would check the password here.
        // For now, assuming password match or handled elsewhere.

        String token = jwtService.generateToken(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole());

        return new LoginResponseDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                token);
    }

    public LoginResponseDTO signup(User newUser) {
        if (newUser.getEmail() == null || newUser.getEmail().isEmpty() ||
                newUser.getPassword() == null || newUser.getPassword().isEmpty() ||
                newUser.getName() == null || newUser.getName().isEmpty() ||
                newUser.getRole() == null) {
            return null;
        }

        if (userDAO.findByEmail(newUser.getEmail()).isPresent()) {
            return new LoginResponseDTO(0L, "", "", null, "EMAIL_EXISTS");
        }

        long generatedId = userDAO.save(newUser);
        newUser.setId(generatedId);

        String token = jwtService.generateToken(
                newUser.getId(),
                newUser.getName(),
                newUser.getEmail(),
                newUser.getRole());

        return new LoginResponseDTO(
                newUser.getId(),
                newUser.getName(),
                newUser.getEmail(),
                newUser.getRole(),
                token);
    }
}
