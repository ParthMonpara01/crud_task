package com.menu.item.master.controller;

/**
 * This is the Controller file to handle MenuItemCategory API Request From Frontend to backend
 */

import com.menu.item.master.dto.MenuItemCategoryDto;
import com.menu.item.master.repository.MenuItemCategoryRepository;
import com.menu.item.master.service.MenuItemCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@CrossOrigin // CrossOrigin allowed for local development
public class MenuItemCategoryController {

    private final MenuItemCategoryService categoryService;

    @Autowired
    private final MenuItemCategoryRepository menuItemCategoryRepository;

    // GET /api/categories?page=0&size=10&sort=name,asc&search=test
    @GetMapping
    public ResponseEntity<Page<MenuItemCategoryDto>> getCategories(
            @RequestParam(value = "search", required = false) String search,
            @PageableDefault(size = 5, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {

        Page<MenuItemCategoryDto> categories = categoryService.getCategories(search, pageable);
        return ResponseEntity.ok(categories);
    }

    // GET /api/categories/active
    @GetMapping("/active")
    public ResponseEntity<List<MenuItemCategoryDto>> getActiveCategories() {

        List<MenuItemCategoryDto> activeCategories = categoryService.getActiveCategories();
        return ResponseEntity.ok(activeCategories);
    }

    // GET /api/categories/{id}
    @GetMapping("/{id}")
    public ResponseEntity<MenuItemCategoryDto> getCategoryById(@PathVariable Long id) {

        MenuItemCategoryDto category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(category);
    }

    // POST /api/categories
    @PostMapping
    public ResponseEntity<MenuItemCategoryDto> createCategory(@Valid @RequestBody MenuItemCategoryDto dto) {

        MenuItemCategoryDto created = categoryService.createCategory(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    // PUT /api/categories/{id}
    @PutMapping("/{id}")
    public ResponseEntity<MenuItemCategoryDto> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody MenuItemCategoryDto dto) {

        MenuItemCategoryDto updated = categoryService.updateCategory(id, dto);
        return ResponseEntity.ok(updated);

    }

    // DELETE /api/categories/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        System.out.println("Delete maping testing");
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    // PATCH /api/categories/{id}/toggle-status
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<MenuItemCategoryDto> toggleCategoryStatus(@PathVariable Long id) {

        MenuItemCategoryDto updated = categoryService.toggleStatus(id);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/check-name")
    public ResponseEntity<Boolean> checkName( @RequestParam String name) {
        boolean exists = menuItemCategoryRepository.existsByNameIgnoreCase(name);
        return ResponseEntity.ok(exists);
    }

}