package com.example.demo.controller;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.request.OrderRequest;
import com.example.demo.dto.response.OrderResponse;
import com.example.demo.dto.response.ProductResponse;
import com.example.demo.service.FlashSaleService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/flash-sale")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@CrossOrigin(origins = "*")
public class FlashSaleController {
    FlashSaleService flashSaleService;

    @GetMapping("/products")
    public ApiResponse<List<ProductResponse>> getFlashSaleProducts() {
        return ApiResponse.<List<ProductResponse>>builder()
                .message("Lấy danh sách sản phẩm thành công")
                .result(flashSaleService.getFlashSaleProducts())
                .build();
    }

    @PostMapping("/order")
    public ApiResponse<OrderResponse> createOrder(@Valid @RequestBody OrderRequest orderRequest) {
        return ApiResponse.<OrderResponse>builder()
                .message("Đặt hàng thành công")
                .result(flashSaleService.createOrder(orderRequest))
                .build();
    }
}
