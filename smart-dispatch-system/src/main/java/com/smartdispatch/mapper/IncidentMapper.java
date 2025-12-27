package com.smartdispatch.mapper;

import com.smartdispatch.dispatcher.dtos.IncidentDto;
import com.smartdispatch.model.Incident;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
public class IncidentMapper implements Mapper<Incident, IncidentDto> {
  private final ModelMapper modelMapper;

  public IncidentMapper(ModelMapper modelMapper) {
    this.modelMapper = modelMapper;
  }

  @Override
  public IncidentDto mapTo(Incident incident) {
    return this.modelMapper.map(incident, IncidentDto.class);
  }

  @Override
  public Incident mapFrom(IncidentDto incidentDto) {
    return this.modelMapper.map(incidentDto, Incident.class);
  }
}
