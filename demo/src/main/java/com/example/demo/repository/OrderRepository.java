package com.example.demo.repository;

import com.example.demo.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface OrderRepository extends JpaRepository<Order,Long> {
    @Query("""
        select coalesce(sum(o.quantity),0) from Order o where o.productId = :productId and o.userId = :userId
    """)
    Integer sumQuantityByProductIdAndUserId(Long productId, Long userId);
}
