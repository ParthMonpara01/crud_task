package com.menu.item.master.entity;

/**
 * This is the Entity file by according to this file Hibernate will Automatically maps Java objects to relational database tables
 */

import jakarta.persistence.*;
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

    @Column(nullable = false, unique = true)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Boolean active = true;

}