package com.smartdispatch.dispatcher.mappers.imp;

import com.smartdispatch.dispatcher.domains.dtos.AssignmentDto;
import com.smartdispatch.dispatcher.domains.dtos.IncidentDto;
import com.smartdispatch.dispatcher.domains.entities.Assignment;
import com.smartdispatch.dispatcher.mappers.Mapper;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
public class AssignmentMapper implements Mapper<Assignment, AssignmentDto> {
    private final ModelMapper modelMapper;

    public AssignmentMapper(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }

    @Override
    public AssignmentDto mapTO(Assignment assignment) {
        return this.modelMapper.map(assignment, AssignmentDto.class);

    }

    @Override
    public Assignment mapFrom(AssignmentDto assignmentDto) {
        return this.modelMapper.map(assignmentDto, Assignment.class);
    }
}
