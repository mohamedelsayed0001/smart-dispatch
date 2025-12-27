package com.smartdispatch.dao;

import com.smartdispatch.model.User;
import com.smartdispatch.model.enums.UserRole;
import java.util.List;
import java.util.Optional;

public interface IUserDao {
  Optional<User> findById(Long id);

  Optional<User> findByEmail(String email);

  List<User> getAllUsers(int page, int pageSize, String role, String search);

  long getTotalCount(String role, String search);

  long save(User user);

  boolean updateUserRole(Long id, UserRole newRole);
}
