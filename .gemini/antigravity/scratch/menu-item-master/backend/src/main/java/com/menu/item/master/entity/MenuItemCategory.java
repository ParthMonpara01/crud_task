package com.menu.item.master.entity;

/**
 * This is the Entity file by according to this file Hibernate will Automatically maps Java objects to relational database tables
 */

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "menu_item_categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuItemCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Category name is required.")
    @Size(max = 50, message = "Category name cannot exceed 50 characters.")
    @Column(nullable = false, unique = true)
    private String name;

    @Column(columnDefinition = "TEXT")
    @Size(
            max = 250,
            message = "Description cannot exceed 250 characters."
    )
    private String description;

    @Column(nullable = false)
    private Boolean active = true;

}