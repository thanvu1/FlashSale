package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "flash_sale_orders")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Order extends BaseEntity{
    @Column(name = "product_id", nullable = false)
    Long productId;

    @Column(name = "user_id", nullable = false)
    Long userId;

    @Column(name = "quantity", nullable = false)
    Integer quantity;
}
