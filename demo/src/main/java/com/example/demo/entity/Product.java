package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "flash_sale_products")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Product extends BaseEntity {

    @Column(nullable = false)
    String name;

    @Column(name = "original_price", nullable = false)
    Double originalPrice;

    @Column(name = "sale_price", nullable = false)
    Double salePrice;

    @Column(nullable = false)
    Integer stock;
}