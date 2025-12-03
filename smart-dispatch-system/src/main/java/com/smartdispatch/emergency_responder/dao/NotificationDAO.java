package com.smartdispatch.emergency_responder.dao;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import com.smartdispatch.emergency_responder.model.Notification;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class NotificationDAO {

    private final JdbcTemplate jdbcTemplate;

    private final RowMapper<Notification> notificationRowMapper = (rs, rowNum) -> {
        Notification notification = new Notification();
        notification.setId(rs.getInt("id"));
        notification.setNotifiedId(rs.getInt("notified_id"));
        notification.setNotificationType(rs.getString("notification_type"));
        notification.setContent(rs.getString("content"));
        notification.setTimeSent(rs.getTimestamp("time_sent"));
        notification.setTimeDelivered(rs.getTimestamp("time_delivered"));
        return notification;
    };

    public List<Notification> findPendingByNotifiedId(Integer notifiedId, int limit, int offset) {
        String sql = "SELECT * FROM Notification WHERE notified_id = ? " +
                    "AND time_delivered IS NULL " +
                    "ORDER BY time_sent DESC LIMIT ? OFFSET ?";
        return jdbcTemplate.query(sql, notificationRowMapper, notifiedId, limit, offset);
    }
}