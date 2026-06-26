package com.menu.item.master.repository;

/**
 * This is the file which provide Inbuilt methods to get data from Database for MenuItemRepository
 */

import com.menu.item.master.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long>, JpaSpecificationExecutor<MenuItem> {

    //CRUD operation Methods
    Optional<MenuItem> findByName(String name);
    boolean existsByName(String name);
    boolean existsByNameAndIdNot(String name, Long id);
    boolean existsByMenuItemCategoryId(Long categoryId);
    boolean existsByNameIgnoreCase(String name);

}