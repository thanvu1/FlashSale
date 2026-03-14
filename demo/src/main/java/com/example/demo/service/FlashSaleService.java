package com.example.demo.service;

import com.example.demo.dto.request.OrderRequest;
import com.example.demo.dto.response.OrderResponse;
import com.example.demo.dto.response.ProductResponse;
import com.example.demo.entity.Product;
import com.example.demo.entity.Order;
import com.example.demo.enums.OrderStatus;
import com.example.demo.exception.ApplicationException;
import com.example.demo.exception.ErrorCode;
import com.example.demo.mapper.FlashSaleMapper;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.OrderRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import lombok.AccessLevel;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FlashSaleService {
    OrderRepository orderRepository;
    ProductRepository productRepository;
    FlashSaleMapper flashSaleMapper;

    Map<Long, Long> userLastRequestTime = new ConcurrentHashMap<>();

    static final int MAX_QUANTITY_PER_USER = 2;
    static final long MIN_REQUEST_INTERVAL_MS = 500;

    public List<ProductResponse> getFlashSaleProducts() {
        List<Product> products = productRepository.findAll();
        return products.stream()
                .map(flashSaleMapper::toProductResponse)
                .toList();
    }

    @Transactional
    public OrderResponse createOrder(OrderRequest orderRequest) {
        validateSpamRequest(orderRequest.getUserId());

        if (orderRequest.getQuantity() > MAX_QUANTITY_PER_USER) {
            throw new ApplicationException(ErrorCode.PURCHASE_LIMIT_EXCEEDED);
        }

        Product product = productRepository.findByIdForUpdate(orderRequest.getProductId())
                .orElseThrow(() -> new ApplicationException(ErrorCode.PRODUCT_NOT_FOUND));

        Integer boughtQuantity = orderRepository.sumQuantityByProductIdAndUserId(orderRequest.getProductId(), orderRequest.getUserId());

        if(boughtQuantity + orderRequest.getQuantity() > MAX_QUANTITY_PER_USER) {
            throw new ApplicationException(ErrorCode.PURCHASE_LIMIT_EXCEEDED);
        }

        if(product.getStock() < 0) {
            throw new ApplicationException(ErrorCode.OUT_OF_STOCK);
        }

        if(product.getStock() < orderRequest.getQuantity()) {
            throw new ApplicationException(ErrorCode.INSUFFICIENT_STOCK);
        }

        product.setStock(product.getStock() - orderRequest.getQuantity());
        productRepository.save(product);

        Order order = Order.builder()
                .productId(orderRequest.getProductId())
                .userId(orderRequest.getUserId())
                .quantity(orderRequest.getQuantity())
                .build();

        Order savedOrder = orderRepository.save(order);

        return OrderResponse.builder()
                .orderId(savedOrder.getId())
                .productId(savedOrder.getProductId())
                .userId(savedOrder.getUserId())
                .quantity(savedOrder.getQuantity())
                .remainingStock(product.getStock())
                .status(OrderStatus.SUCCESS.name())
                .build();
    }


    private void validateSpamRequest(Long userId) {
        long now = System.currentTimeMillis();
        Long lastTime = userLastRequestTime.get(userId);

        if (lastTime != null && now - lastTime < MIN_REQUEST_INTERVAL_MS) {
            throw new ApplicationException(ErrorCode.TOO_MANY_REQUESTS);
        }

        userLastRequestTime.put(userId, now);
    }
}
