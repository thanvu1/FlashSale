package com.example.demo.mapper;

import com.example.demo.entity.Product;
import com.example.demo.dto.response.ProductResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface FlashSaleMapper {
    ProductResponse toProductResponse(Product product);
}
