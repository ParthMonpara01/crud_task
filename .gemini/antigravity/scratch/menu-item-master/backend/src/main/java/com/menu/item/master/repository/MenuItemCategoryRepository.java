package com.menu.item.master.repository;

/**
 * This is the repository file which provide inbuilt methods to get data from Database for MenuItemRepository
 */

import com.menu.item.master.entity.MenuItemCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MenuItemCategoryRepository extends JpaRepository<MenuItemCategory, Long>, JpaSpecificationExecutor<MenuItemCategory> {

    Optional<MenuItemCategory> findByName(String name);
    boolean existsByName(String name);
    boolean existsByNameAndIdNot(String name, Long id);
    List<MenuItemCategory> findByActiveTrue();
    boolean existsByNameIgnoreCase(String name);

}