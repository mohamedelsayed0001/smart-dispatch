package com.smartdispatch.dao.imp;

import com.smartdispatch.dao.IUserDao;
import com.smartdispatch.mapper.UserRowMapper;
import com.smartdispatch.model.User;
import com.smartdispatch.model.enums.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
@SuppressWarnings("null")
public class UserDao implements IUserDao {

  private final JdbcTemplate jdbcTemplate;
  private final UserRowMapper userRowMapper;

  @Override
  public Optional<User> findById(Long id) {
    try {
      String sql = "SELECT * FROM User WHERE id = ?";
      return Optional.ofNullable(jdbcTemplate.queryForObject(sql, userRowMapper, id));
    } catch (EmptyResultDataAccessException e) {
      return Optional.empty();
    }
  }

  @Override
  public Optional<User> findByEmail(String email) {
    try {
      String sql = "SELECT * FROM User WHERE email = ?";
      return Optional.ofNullable(jdbcTemplate.queryForObject(sql, userRowMapper, email));
    } catch (EmptyResultDataAccessException e) {
      return Optional.empty();
    }
  }

  @Override
  public List<User> getAllUsers(int page, int pageSize, String role, String search) {
    int offset = (page - 1) * pageSize;
    StringBuilder sql = new StringBuilder("SELECT * FROM User WHERE 1=1");
    List<Object> params = new ArrayList<>();

    if (role != null && !role.isEmpty() && !role.equalsIgnoreCase("all")) {
      sql.append(" AND role = ?");
      params.add(role.toUpperCase());
    }

    if (search != null && !search.isEmpty()) {
      sql.append(" AND (LOWER(name) LIKE ? OR LOWER(email) LIKE ?)");
      String searchParam = "%" + search.toLowerCase() + "%";
      params.add(searchParam);
      params.add(searchParam);
    }

    sql.append(" LIMIT ? OFFSET ?");
    params.add(pageSize);
    params.add(offset);

    return jdbcTemplate.query(sql.toString(), userRowMapper, params.toArray());
  }

  @Override
  public long getTotalCount(String role, String search) {
    StringBuilder sql = new StringBuilder("SELECT COUNT(*) FROM User WHERE 1=1");
    List<Object> params = new ArrayList<>();

    if (role != null && !role.isEmpty() && !role.equalsIgnoreCase("all")) {
      sql.append(" AND role = ?");
      params.add(role.toUpperCase());
    }

    if (search != null && !search.isEmpty()) {
      sql.append(" AND (LOWER(name) LIKE ? OR LOWER(email) LIKE ?)");
      String searchParam = "%" + search.toLowerCase() + "%";
      params.add(searchParam);
      params.add(searchParam);
    }

    Long count = jdbcTemplate.queryForObject(sql.toString(), Long.class, params.toArray());
    return count != null ? count : 0;
  }

  @Override
  public long save(User user) {
    String sql = "INSERT INTO User (name, password, email, role) VALUES (?, ?, ?, ?)";
    org.springframework.jdbc.support.KeyHolder keyHolder = new org.springframework.jdbc.support.GeneratedKeyHolder();

    jdbcTemplate.update(connection -> {
      java.sql.PreparedStatement ps = connection.prepareStatement(sql, java.sql.Statement.RETURN_GENERATED_KEYS);
      ps.setString(1, user.getName());
      ps.setString(2, user.getPassword());
      ps.setString(3, user.getEmail());
      ps.setString(4, user.getRole().name());
      return ps;
    }, keyHolder);

    Number key = keyHolder.getKey();
    return key != null ? key.longValue() : 0L;
  }

  @Override
  public boolean updateUserRole(Long id, UserRole newRole) {
    String sql = "UPDATE User SET role = ? WHERE id = ?";
    int rows = jdbcTemplate.update(sql, newRole.name(), id);
    return rows > 0;
  }
}
