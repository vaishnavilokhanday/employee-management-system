package com.vaishnavi.ems.repository;

import com.vaishnavi.ems.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {

    boolean existsByName(String name);

    boolean existsByNameAndIdNot(String name, Long id);
}