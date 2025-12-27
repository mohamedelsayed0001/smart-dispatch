package com.smartdispatch.dao;

import com.smartdispatch.admin.dto.AvgTimeResolved;
import com.smartdispatch.admin.dto.IncidentStatsDto;
import com.smartdispatch.model.Incident;
import com.smartdispatch.model.enums.IncidentStatus;
import com.smartdispatch.model.enums.IncidentType;
import java.util.List;
import java.util.Optional;

public interface IIncidentDao {
  Long createIncident(Incident incident);

  List<Incident> getAllPendingIncidents();

  List<Incident> getAllIncidents();

  Incident findById(Long id);

  Optional<Incident> findOptionalById(Long id);

  boolean updateStatus(Long id, IncidentStatus status);

  int updateTimeResolved(Long incidentId, IncidentStatus status);

  Incident findClosestPendingIncident(IncidentType type, double latitude, double longitude);

  List<Incident> findTopIncidents(int limit);

  List<Incident> findRecentIncidents(int limit);

  List<AvgTimeResolved> getAvgTimeResolvedByType();

  List<IncidentStatsDto> getIncidentCountPerMonthByType(int limit);
}
