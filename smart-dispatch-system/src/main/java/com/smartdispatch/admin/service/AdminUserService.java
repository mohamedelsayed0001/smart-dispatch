package com.smartdispatch.admin.service;

import com.smartdispatch.dao.IUserDao;
import com.smartdispatch.admin.dto.PaginatedResponse;
import com.smartdispatch.admin.dto.UserDTO;
import com.smartdispatch.model.User;
import com.smartdispatch.model.enums.UserRole;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

// import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class AdminUserService {

    private static final Logger logger = LoggerFactory.getLogger(AdminUserService.class);

    @Autowired
    private IUserDao userDAO;

    private static final int DEFAULT_PAGE_SIZE = 10;
    // private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public PaginatedResponse<UserDTO> getUsers(int page, String role, String search) {
        if (page < 1)
            page = 1;

        logger.debug("getUsers called with page={}, role={}, search={}", page, role, search);

        // Get users for the current page
        List<User> users = userDAO.getAllUsers(page, DEFAULT_PAGE_SIZE, role, search);

        // Get total count
        long totalCount = userDAO.getTotalCount(role, search);
        int totalPages = (int) Math.ceil((double) totalCount / DEFAULT_PAGE_SIZE);

        logger.debug("Retrieved {} users, total={}, totalPages={}", users.size(), totalCount, totalPages);

        // Convert to DTOs
        List<UserDTO> userDTOs = new ArrayList<>();
        for (User user : users)
            userDTOs.add(convertToDTO(user));

        // Build response
        PaginatedResponse<UserDTO> response = new PaginatedResponse<>();
        response.setData(userDTOs);
        response.setCurrentPage(page);
        response.setTotalPages(totalPages);
        response.setTotalElements(totalCount);
        response.setPageSize(DEFAULT_PAGE_SIZE);

        return response;
    }

    public boolean promoteUser(Long userId, String newRole) {
        logger.debug("Promoting user id={} to role={}", userId, newRole);
        try {
            UserRole roleEnum = UserRole.valueOf(newRole.toUpperCase());
            return userDAO.updateUserRole(userId, roleEnum);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid role: {}", newRole);
            return false;
        }
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());
        return dto;
    }
}
