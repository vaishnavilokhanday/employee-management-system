package com.vaishnavi.ems.service;

import com.vaishnavi.ems.dto.request.DepartmentRequestDTO;
import com.vaishnavi.ems.dto.response.DepartmentResponseDTO;
import org.springframework.data.domain.Page;

import java.util.List;

public interface DepartmentService {

    DepartmentResponseDTO createDepartment(DepartmentRequestDTO requestDTO);

    DepartmentResponseDTO getDepartmentById(Long id);

    List<DepartmentResponseDTO> getAllDepartments();

    Page<DepartmentResponseDTO> getDepartmentsPaginated(int page, int size, String sortBy, String sortDir);

    DepartmentResponseDTO updateDepartment(Long id, DepartmentRequestDTO requestDTO);

    void deleteDepartment(Long id);

    List<DepartmentResponseDTO> searchByName(String keyword);
}