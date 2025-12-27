package com.smartdispatch.dispatcher.daos;

import com.smartdispatch.admin.dto.IncidentStatsDto;
import com.smartdispatch.dispatcher.domains.entities.Incident;

import java.util.List;

public interface IncidentDao {
    List<Incident> getAllPendingIncidents();
    List<Incident> getAllIncidents();
    boolean updateStatus(Integer incidentId, String status);
    Incident findById(Integer id);
    List<IncidentStatsDto> getIncidentCountPerMonthByType(int limit);
    Incident findClosestPendingIncident(String type, double latitude, double longitude);
}
