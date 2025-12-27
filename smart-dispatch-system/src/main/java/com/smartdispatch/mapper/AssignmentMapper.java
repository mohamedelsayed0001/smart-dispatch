package com.smartdispatch.mapper;

import com.smartdispatch.dispatcher.dtos.AssignmentDto;
import com.smartdispatch.model.Assignment;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
public class AssignmentMapper implements Mapper<Assignment, AssignmentDto> {
  private final ModelMapper modelMapper;

  public AssignmentMapper(ModelMapper modelMapper) {
    this.modelMapper = modelMapper;
  }

  @Override
  public AssignmentDto mapTo(Assignment assignment) {
    return this.modelMapper.map(assignment, AssignmentDto.class);
  }

  @Override
  public Assignment mapFrom(AssignmentDto assignmentDto) {
    return this.modelMapper.map(assignmentDto, Assignment.class);
  }
}
