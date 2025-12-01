package com.smartdispatch.authentication.dao;

import com.smartdispatch.authentication.model.User;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public class LoginDAO {

    private final JdbcTemplate jdbcTemplate;
    private final UserRowMapper userRowMapper;

    public LoginDAO(JdbcTemplate jdbcTemplate,
            UserRowMapper userDTORowMapper){
                this.jdbcTemplate= jdbcTemplate;
                this.userRowMapper = userDTORowMapper;
    }

    private static final String INSERT_USER = """
            INSERT INTO User (name, password, email, role)
            VALUES (?, ?, ?, ?)
            """;
    private static final String GET_USER_BY_EMAIL = """
            SELECT id, name, password, email, role
            FROM User
            WHERE email = ?
            """;

    public int createUser(User user) {
        return jdbcTemplate.update(
                INSERT_USER,
                user.getName(),
                user.getPassword(),
                user.getEmail(),
                user.getRole()
        );
    }

    public Optional<User> findByEmail(String email) {
        var users = jdbcTemplate.query(GET_USER_BY_EMAIL, this.userRowMapper, email);
        return users.stream().findFirst();
    }
}
