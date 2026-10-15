package com.vaishnavi.ems.service.impl;

import com.vaishnavi.ems.dto.request.DepartmentRequestDTO;
import com.vaishnavi.ems.dto.response.DepartmentResponseDTO;
import com.vaishnavi.ems.entity.Department;
import com.vaishnavi.ems.exception.DuplicateResourceException;
import com.vaishnavi.ems.exception.ResourceNotFoundException;
import com.vaishnavi.ems.repository.DepartmentRepository;
import com.vaishnavi.ems.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;

    @Override
    @Transactional
    public DepartmentResponseDTO createDepartment(DepartmentRequestDTO requestDTO) {
        if (departmentRepository.existsByName(requestDTO.getName())) {
            throw new DuplicateResourceException("Department", "name", requestDTO.getName());
        }

        Department department = new Department();
        department.setName(requestDTO.getName());
        department.setDescription(requestDTO.getDescription());

        Department saved = departmentRepository.saveAndFlush(department);
        return mapToResponseDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public DepartmentResponseDTO getDepartmentById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));
        return mapToResponseDTO(department);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DepartmentResponseDTO> getAllDepartments() {
        return departmentRepository.findAll()
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DepartmentResponseDTO> getDepartmentsPaginated(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        return departmentRepository.findAll(pageable).map(this::mapToResponseDTO);
    }

    @Override
    @Transactional
    public DepartmentResponseDTO updateDepartment(Long id, DepartmentRequestDTO requestDTO) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));

        if (departmentRepository.existsByNameAndIdNot(requestDTO.getName(), id)) {
            throw new DuplicateResourceException("Department", "name", requestDTO.getName());
        }

        department.setName(requestDTO.getName());
        department.setDescription(requestDTO.getDescription());

        Department updated = departmentRepository.saveAndFlush(department);
        return mapToResponseDTO(updated);
    }

    @Override
    @Transactional
    public void deleteDepartment(Long id) {
        if (!departmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Department", "id", id);
        }
        departmentRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DepartmentResponseDTO> searchByName(String keyword) {
        return departmentRepository.findAll()
                .stream()
                .filter(d -> d.getName().toLowerCase().contains(keyword.toLowerCase()))
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    private DepartmentResponseDTO mapToResponseDTO(Department department) {
        DepartmentResponseDTO dto = new DepartmentResponseDTO();
        dto.setId(department.getId());
        dto.setName(department.getName());
        dto.setDescription(department.getDescription());
        dto.setCreatedAt(department.getCreatedAt());
        dto.setUpdatedAt(department.getUpdatedAt());
        return dto;
    }
}