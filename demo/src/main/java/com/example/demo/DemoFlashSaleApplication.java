package com.example.demo;

import com.example.demo.entity.Product;
import com.example.demo.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.amqp.autoconfigure.RabbitAutoConfiguration;
import org.springframework.boot.autoconfigure.data.*;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication(exclude = {
		RabbitAutoConfiguration.class
})
public class DemoFlashSaleApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoFlashSaleApplication.class, args);
	}

	@Bean
	CommandLineRunner initData(ProductRepository ProductRepository) {
		return args -> {
			if (ProductRepository.count() == 0) {
				ProductRepository.save(
						Product.builder()
								.name("iPhone 15")
								.originalPrice(20000000.0)
								.salePrice(10000000.0)
								.stock(100)
								.build()
				);

				ProductRepository.save(
						Product.builder()
								.name("AirPods Pro")
								.originalPrice(6000000.0)
								.salePrice(3000000.0)
								.stock(150)
								.build()
				);

				ProductRepository.save(
						Product.builder()
								.name("Apple Watch")
								.originalPrice(10000000.0)
								.salePrice(5000000.0)
								.stock(50)
								.build()
				);
			}
		};
	}
}