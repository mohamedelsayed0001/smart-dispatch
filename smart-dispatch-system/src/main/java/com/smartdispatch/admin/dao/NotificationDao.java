package com.smartdispatch.admin.dao;

import com.smartdispatch.admin.entity.Notification;

import com.smartdispatch.admin.entity.NotificationType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public class NotificationDao {
    private static final Logger logger = LoggerFactory.getLogger(NotificationDao.class);
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final RowMapper<Notification> notificationRowMapper = new RowMapper<Notification>() {
        @Override
        public Notification mapRow(ResultSet rs, int rowNum) throws SQLException {
            Notification notification = new Notification();
            notification.setId(rs.getLong("id"));
            notification.setNotifiedId(rs.getLong("notified_id"));
            notification.setNotificationType(Enum.valueOf(com.smartdispatch.admin.entity.NotificationType.class, rs.getString("notification_type")));
            notification.setContent(rs.getString("content"));
            notification.setTimeSent(rs.getTimestamp("time_sent").toInstant().atOffset(java.time.ZoneOffset.UTC).toLocalDateTime());            java.sql.Timestamp deliveredTs = rs.getTimestamp("time_delivered");
            notification.setTimeDelivered(deliveredTs != null ? deliveredTs.toLocalDateTime() : null);
            return notification;
        }
    };


    public void add(Notification notification) {
        String sql = "INSERT INTO Notification (notification_type, content, time_sent) VALUES (?, ?, ?)";
        LocalDateTime timeSent = notification.getTimeSent();
        logger.debug("Adding notification - Type: {}, Time sent: {}", notification.getNotificationType(), timeSent);
        jdbcTemplate.update(sql,
            notification.getNotificationType().name(),
            notification.getContent(),
            timeSent
        );
        logger.debug("Notification added successfully");
    }


    public List<Notification> getNotificationsByType(int limit, NotificationType notificationType) {
        logger.debug("Fetching notifications - Type: {}, Limit: {}", notificationType, limit);
        String sql = "SELECT * FROM Notification WHERE notification_type = ?" +
                " ORDER BY time_sent DESC LIMIT ?";

        List<Notification> notifications = jdbcTemplate.query(sql, notificationRowMapper, notificationType.name(), limit);
        logger.debug("Retrieved {} notifications of type {}", notifications.size(), notificationType);
        return notifications;
    }
}
