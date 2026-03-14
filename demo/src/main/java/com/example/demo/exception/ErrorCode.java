package com.example.demo.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import lombok.Getter;

@Getter
public enum ErrorCode {
    PRODUCT_NOT_FOUND(2001, "Sản phẩm không tồn tại", HttpStatus.NOT_FOUND),
    OUT_OF_STOCK(2002, "Sản phẩm đã hết hàng", HttpStatus.BAD_REQUEST),
    INSUFFICIENT_STOCK(2003, "Không đủ tồn kho", HttpStatus.BAD_REQUEST),
    PURCHASE_LIMIT_EXCEEDED(2004, "Mỗi khách hàng chỉ được mua tối đa 2 sản phẩm", HttpStatus.BAD_REQUEST),
    INVALID_VALIDATION(2005, "Dữ liệu đầu vào không hợp lệ", HttpStatus.BAD_REQUEST),
    FORBIDDEN(2006, "Bạn không có quyền truy cập", HttpStatus.FORBIDDEN),
    BAD_REQUEST(2007, "Yêu cầu không hợp lệ", HttpStatus.BAD_REQUEST),
    TOO_MANY_REQUESTS(2008, "Bạn thao tác quá nhanh, vui lòng thử lại sau", HttpStatus.TOO_MANY_REQUESTS);

    private final int code;
    private final String message;
    private final HttpStatusCode httpStatusCode;

    ErrorCode(int code, String message, HttpStatusCode httpStatusCode) {
        this.code = code;
        this.message = message;
        this.httpStatusCode = httpStatusCode;
    }
}
