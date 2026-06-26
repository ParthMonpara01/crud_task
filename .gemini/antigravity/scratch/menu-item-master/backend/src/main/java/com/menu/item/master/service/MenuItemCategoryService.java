package com.menu.item.master.service;

/**
 * This is the Service Layer file which handles Business logic to fetch data for MenuItemCategoryService
 */

import com.menu.item.master.dto.MenuItemCategoryDto;
import com.menu.item.master.entity.MenuItemCategory;
import com.menu.item.master.exception.BusinessValidationException;
import com.menu.item.master.exception.ResourceNotFoundException;
import com.menu.item.master.repository.MenuItemCategoryRepository;
import com.menu.item.master.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuItemCategoryService {

    private final MenuItemCategoryRepository categoryRepository;
    private final MenuItemRepository menuItemRepository;

    // Fetch paginated, sorted, and searched categories
    @Transactional(readOnly = true)
    public Page<MenuItemCategoryDto> getCategories(String search, Pageable pageable) {

        Specification<MenuItemCategory> spec = (root, query, cb) -> {
            if (search == null || search.trim().isEmpty()) {
                return cb.conjunction();
            }
            String wildcard = "%" + search.trim().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("name")), wildcard),
                    cb.like(cb.lower(root.get("description")), wildcard)
            );
        };

        return categoryRepository.findAll(spec, pageable).map(this::convertToDto);
    }

    // Fetch all active categories for dropdown selection
    @Transactional(readOnly = true)
    public List<MenuItemCategoryDto> getActiveCategories() {

        return categoryRepository.findByActiveTrue().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Fetch single category details
    @Transactional(readOnly = true)
    public MenuItemCategoryDto getCategoryById(Long id) {

        MenuItemCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return convertToDto(category);
    }

    // Create a new category
    @Transactional
    public MenuItemCategoryDto createCategory(MenuItemCategoryDto dto) {

        validateDto(dto);

        // Category name uniqueness check
        if (categoryRepository.existsByName(dto.getName().trim())) {
            throw new BusinessValidationException("Category name '" + dto.getName() + "' already exists.");
        }

        MenuItemCategory category = MenuItemCategory.builder()
                .name(dto.getName().trim())
                .description(dto.getDescription() != null ? dto.getDescription().trim() : null)
                .active(dto.getActive() != null ? dto.getActive() : true)
                .build();

        MenuItemCategory saved = categoryRepository.save(category);
        return convertToDto(saved);
    }

    // Update an existing category
    @Transactional
    public MenuItemCategoryDto updateCategory(Long id, MenuItemCategoryDto dto) {
        validateDto(dto);

        MenuItemCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        // Category name uniqueness check (excluding current category)
        if (categoryRepository.existsByNameAndIdNot(dto.getName().trim(), id)) {
            throw new BusinessValidationException("Category name '" + dto.getName() + "' already exists.");
        }

        category.setName(dto.getName().trim());
        category.setDescription(dto.getDescription() != null ? dto.getDescription().trim() : null);
        if (dto.getActive() != null) {
            category.setActive(dto.getActive());
        }

        MenuItemCategory updated = categoryRepository.save(category);
        return convertToDto(updated);
    }

    // Delete a category
    @Transactional
    public void deleteCategory(Long id) {

        if (!categoryRepository.existsById(id)) {

            throw new ResourceNotFoundException("Category not found with id: " + id);
        }

        // Business Rule: Block deletion if category is assigned to menu items
        if (menuItemRepository.existsByMenuItemCategoryId(id)) {

            throw new BusinessValidationException("Category cannot be deleted because it is already assigned to menu items.");
        }

        categoryRepository.deleteById(id);
    }

    // Toggle active status
    @Transactional
    public MenuItemCategoryDto toggleStatus(Long id) {

        MenuItemCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        category.setActive(!category.getActive());
        MenuItemCategory updated = categoryRepository.save(category);
        return convertToDto(updated);
    }

    // Convert Entity to DTO
    private MenuItemCategoryDto convertToDto(MenuItemCategory category) {

        return MenuItemCategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .active(category.getActive())
                .build();
    }

    // Basic DTO validations
    private void validateDto(MenuItemCategoryDto dto) {

        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            throw new BusinessValidationException("Category name must not be blank.");
        }
    }

    public boolean existsByName(String name) {
        return categoryRepository.existsByNameIgnoreCase(name);
    }

}