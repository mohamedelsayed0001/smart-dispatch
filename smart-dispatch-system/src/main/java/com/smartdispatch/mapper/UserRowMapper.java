package com.smartdispatch.mapper;

import com.smartdispatch.model.User;
import com.smartdispatch.model.enums.UserRole;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;

import java.sql.ResultSet;
import java.sql.SQLException;

@Component
public class UserRowMapper implements RowMapper<User> {

  @Override
  public User mapRow(ResultSet rs, int rowNum) throws SQLException {
    User user = new User();
    user.setId(rs.getLong("id"));
    user.setName(rs.getString("name"));
    user.setPassword(rs.getString("password"));
    user.setEmail(rs.getString("email"));
    user.setRole(UserRole.valueOf(rs.getString("role")));
    if (rs.getTimestamp("created_at") != null) {
      user.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
    }
    return user;
  }
}
