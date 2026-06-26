package com.menu.item.master.controller;

/**
 * This is the Controller file to handle MenuItem APIs request From Frontend to backend
 */

import com.menu.item.master.dto.MenuItemDto;
import com.menu.item.master.service.MenuItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/menu-items")
@RequiredArgsConstructor
@CrossOrigin // CrossOrigin allowed for local development
public class MenuItemController {

    private final MenuItemService menuItemService;

    // GET /api/menu-items?page=0&size=10&sort=name,asc&search=test
    @GetMapping
    public ResponseEntity<Page<MenuItemDto>> getMenuItems(
            @RequestParam(value = "search", required = false) String search,
            @PageableDefault(size = 10, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        Page<MenuItemDto> items = menuItemService.getMenuItems(search, pageable);
        return ResponseEntity.ok(items);
    }

    // GET /api/menu-items/{id}
    @GetMapping("/{id}")
    public ResponseEntity<MenuItemDto> getMenuItemById(@PathVariable Long id) {
        MenuItemDto item = menuItemService.getMenuItemById(id);
        return ResponseEntity.ok(item);
    }

    // POST /api/menu-items
    @PostMapping
    public ResponseEntity<MenuItemDto> createMenuItem(@Valid @RequestBody MenuItemDto dto) {
        MenuItemDto created = menuItemService.createMenuItem(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    // PUT /api/menu-items/{id}
    @PutMapping("/{id}")
    public ResponseEntity<MenuItemDto> updateMenuItem(@PathVariable Long id, @Valid @RequestBody MenuItemDto dto) {
        MenuItemDto updated = menuItemService.updateMenuItem(id, dto);
        return ResponseEntity.ok(updated);
    }

    // DELETE /api/menu-items/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable Long id) {

        menuItemService.deleteMenuItem(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/check-name")
    public ResponseEntity<Boolean> checkName(@RequestParam String name) {

        return ResponseEntity.ok(
                menuItemService.existsByName(name)
        );
    }

    // Add this to your existing Controller file
    @GetMapping("/print")
    public ResponseEntity<byte[]> printCrudData() {
        try {
            // Trigger your new service method
            byte[] pdfFile = menuItemService.generateCrudReport();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);

            // "inline" makes it instantly open up in a native browser print tab
            headers.setContentDispositionFormData("inline", "crud_data_export.pdf");

            return new ResponseEntity<>(pdfFile, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}