package com.smartdispatch.authentication.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartdispatch.authentication.dto.LoginRequestDTO;
import com.smartdispatch.authentication.dto.LoginResponseDTO;
import com.smartdispatch.authentication.services.LoginService;
import com.smartdispatch.authentication.model.User;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;




@RestController
@RequestMapping("/api/auth")
public class LoginController {
    LoginService loginService;

    public LoginController(LoginService loginService) {
        this.loginService = loginService;
    }
   @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO loginRequestDTO) {
        LoginResponseDTO resp = loginService.loginWithEmailPassword(loginRequestDTO);
        if (resp == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/signup")
    public ResponseEntity<LoginResponseDTO> signup(@RequestBody User newUser) {
        LoginResponseDTO resp = loginService.signup(newUser);

        if (resp == null) {
            return ResponseEntity.badRequest().build();
        }

        if ("EMAIL_EXISTS".equals(resp.getToken())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(resp);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

}
