package com.menu.item.master.entity;

/**
 * This is the Entity file by according to this file Hibernate will Automatically maps Java objects to relational database tables
 */

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "menu_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
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

    @Column(columnDefinition = "TEXT")
    @Size(
            max = 250,
            message = "Description cannot exceed 250 characters."
    )
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    @NotNull
    @DecimalMin(value = "0.01", message = "Minimum value can be 0.01")
    @DecimalMax(value = "99999.99", message = "Maximum value could be 99999.99")
    private BigDecimal price;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private MenuItemCategory menuItemCategory;

    @Column(nullable = false)
    private Boolean active = true;

}