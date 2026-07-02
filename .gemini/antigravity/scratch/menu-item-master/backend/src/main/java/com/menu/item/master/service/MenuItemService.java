package com.menu.item.master.service;

/**
 * This is the Service Layer file which handles Business logic to fetch data for MenuItemService
 */

import com.menu.item.master.dto.MenuItemDto;
import com.menu.item.master.entity.MenuItem;
import com.menu.item.master.entity.MenuItemCategory;
import com.menu.item.master.exception.BusinessValidationException;
import com.menu.item.master.exception.ResourceNotFoundException;
import com.menu.item.master.repository.MenuItemCategoryRepository;
import com.menu.item.master.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import net.sf.jasperreports.engine.JasperExportManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.FileInputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;

    private final MenuItemCategoryRepository categoryRepository;

    // Fetch paginated, sorted, and searched menu items
    @Transactional(readOnly = true)
    public Page<MenuItemDto> getMenuItems(String search, Pageable pageable) {

        Specification<MenuItem> spec = (root, query, cb) -> {
            if (search == null || search.trim().isEmpty()) {
                return cb.conjunction();
            }
            String wildcard = "%" + search.trim().toLowerCase() + "%";

            // Searching on name, slogan, description and category name
            return cb.or(
                    cb.like(cb.lower(root.get("name")), wildcard),
                    cb.like(cb.lower(root.get("slogan")), wildcard),
                    cb.like(cb.lower(root.get("description")), wildcard),
                    cb.like(cb.lower(root.join("menuItemCategory").get("name")), wildcard),
                    cb.like(cb.lower(root.join("menuItemCategory").get("description")), wildcard)
            );
        };

        return menuItemRepository.findAll(spec, pageable).map(this::convertToDto);
    }

    // Fetch single menu item by ID
    @Transactional(readOnly = true)
    public MenuItemDto getMenuItemById(Long id) {

        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + id));
        return convertToDto(item);
    }

    // Create new menu item
    @Transactional
    public MenuItemDto createMenuItem(MenuItemDto dto) {

        validateDto(dto);

        // 1. Uniqueness check
        if (menuItemRepository.existsByName(dto.getName().trim())) {
            throw new BusinessValidationException("Menu item name '" + dto.getName() + "' already exists.");
        }

        // 2. Fetch category and ensure it exists and is active
        MenuItemCategory category = categoryRepository.findById(dto.getMenuItemCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + dto.getMenuItemCategoryId()));
        if (!category.getActive()) {
            throw new BusinessValidationException("Cannot assign an inactive category '" + category.getName() + "' to a menu item.");
        }

        MenuItem item = MenuItem.builder()
                .name(dto.getName().trim())
                .slogan(dto.getSlogan() != null ? dto.getSlogan().trim() : null)
                .description(dto.getDescription() != null ? dto.getDescription().trim() : null)
                .price(dto.getPrice())
                .menuItemCategory(category)
                .active(dto.getActive() != null ? dto.getActive() : true)
                .build();

        MenuItem saved = menuItemRepository.save(item);
        return convertToDto(saved);
    }

    // Update menu item
    @Transactional
    public MenuItemDto updateMenuItem(Long id, MenuItemDto dto) {

        validateDto(dto);

        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + id));

        // 1. Uniqueness check (excluding current item)
        if (menuItemRepository.existsByNameAndIdNot(dto.getName().trim(), id)) {

            throw new BusinessValidationException("Menu item name '" + dto.getName() + "' already exists.");
        }

        // 2. Fetch category and ensure it exists and is active
        MenuItemCategory category = categoryRepository.findById(dto.getMenuItemCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + dto.getMenuItemCategoryId()));
        
        // If the category is being changed or re-assigned, it must be active.
        if (!category.getActive() && !item.getMenuItemCategory().getId().equals(category.getId())) {

            throw new BusinessValidationException("Cannot assign an inactive category '" + category.getName() + "' to a menu item.");
        }

        item.setName(dto.getName().trim());
        item.setSlogan(dto.getSlogan() != null ? dto.getSlogan().trim() : null);
        item.setDescription(dto.getDescription() != null ? dto.getDescription().trim() : null);
        item.setPrice(dto.getPrice());
        item.setMenuItemCategory(category);
        if (dto.getActive() != null) {
            item.setActive(dto.getActive());
        }

        MenuItem updated = menuItemRepository.save(item);
        return convertToDto(updated);
    }

    // Delete menu item
    @Transactional
    public void deleteMenuItem(Long id) {

        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Menu item not found with id: " + id));

        menuItemRepository.delete(item);
    }

    // Convert Entity to DTO
    private MenuItemDto convertToDto(MenuItem item) {
        return MenuItemDto.builder()
                .id(item.getId())
                .name(item.getName())
                .slogan(item.getSlogan())
                .description(item.getDescription())
                .price(item.getPrice())
                .menuItemCategoryId(item.getMenuItemCategory().getId())
                .menuItemCategoryName(item.getMenuItemCategory().getName())
                .active(item.getActive())
                .build();
    }

    // Business validations for DTO
    private void validateDto(MenuItemDto dto) {
        if (dto.getName() == null || dto.getName().trim().isEmpty()) {

            throw new BusinessValidationException("Menu item name must not be blank.");
        }
        if (dto.getPrice() == null) {

            throw new BusinessValidationException("Price must be specified.");
        }
        if (dto.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessValidationException("Price must be greater than 0.");
        }
        if(dto.getPrice().compareTo(new BigDecimal("99999")) > 0){

            throw new BusinessValidationException(
                    "Price cannot exceed 99999.");
        }
        if (dto.getMenuItemCategoryId() == null) {

            throw new BusinessValidationException("Category selection is mandatory.");
        }
        if(dto.getDescription()!=null &&
                dto.getDescription().length()>250){

            throw new BusinessValidationException(
                    "Description cannot exceed 250 characters."
            );
        }
    }

    public boolean existsByName(String name) {

        return menuItemRepository.existsByNameIgnoreCase(name);
    }

    // 2. ADD THIS NEW METHOD for the Jasper report
    public byte[] generateCrudReport() throws Exception {
        // Reuse your existing Read operation to pull live data
        List<MenuItem> dataList = menuItemRepository.findAll();

        // Load the compiled report file from src/main/resources/reports/
        InputStream templateStream = new FileInputStream("C:\\Users\\neelj.DESKTOP-MTEDLQU\\.gemini\\antigravity\\scratch\\menu-item-master\\backend\\src\\main\\resources\\reports\\Blank_A4_1.jasper");
        // Bind your CRUD List to Jasper's data framework
        JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(dataList);

        // Optional parameters map
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("TotalRecordsCount", dataList.size());

        // Fill and build the PDF document
        JasperPrint jasperPrint = JasperFillManager.fillReport(templateStream, parameters, dataSource);

        // Return raw binary bytes to stream over the web
        return JasperExportManager.exportReportToPdf(jasperPrint);
    }

}