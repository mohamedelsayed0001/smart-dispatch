package com.smartdispatch.dispatcher.mappers.imp;

import com.smartdispatch.dispatcher.domains.dtos.IncidentDto;
import com.smartdispatch.dispatcher.domains.dtos.VehicleDto;
import com.smartdispatch.dispatcher.domains.entities.Incident;
import com.smartdispatch.dispatcher.mappers.Mapper;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
public class IncidentMapper  implements Mapper<Incident, IncidentDto> {
    private final ModelMapper modelMapper;

    public IncidentMapper(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }

    @Override
    public IncidentDto mapTO(Incident incident) {
        return this.modelMapper.map(incident, IncidentDto.class);
    }

    @Override
    public Incident mapFrom(IncidentDto incidentDto) {
        return this.modelMapper.map(incidentDto, Incident.class);
    }
}
