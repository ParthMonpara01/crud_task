package com.menu.item.master.dto;

/**
 * This is the file to send Data Transfer Objects to send only necessary data to the Frontend for MenuItem
 */

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuItemDto {

    private Long id;

    @NotBlank(message = "Menu item name is required")
    @Size(min = 2, max = 100, message = "Menu item name must be between 2 and 100 characters")
    @Pattern(
            regexp = "^[A-Za-z ]+$",
            message = "Name can contain only letters and spaces."
    )
    private String name;

    @Size(
            max = 100,
            message = "Slogan cannot exceed 100 characters."
    )
    private String slogan;

    @Size(
            max = 250,
            message = "Description cannot exceed 250 characters."
    )
    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal price;

    @NotNull(message = "Category selection is mandatory")
    private Long menuItemCategoryId;

    private String menuItemCategoryName;

    private Boolean active;

}