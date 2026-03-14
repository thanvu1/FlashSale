package com.example.demo.exception;

import com.example.demo.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApplicationException.class)
    public ResponseEntity<ApiResponse<?>> applicationException(final ApplicationException e) {
        ApiResponse<?> apiResponse = new ApiResponse<>();
        ErrorCode errorCode = e.getErrorCode();

        apiResponse.setCode(errorCode.getCode());
        apiResponse.setMessage(errorCode.getMessage());

        return ResponseEntity
                .status(errorCode.getHttpStatusCode())
                .body(apiResponse);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<?>> illegalArgumentException(final IllegalArgumentException e) {
        ApiResponse<?> apiResponse = new ApiResponse<>();
        ErrorCode errorCode = ErrorCode.BAD_REQUEST;

        apiResponse.setCode(errorCode.getCode());
        apiResponse.setMessage(e.getMessage());

        return ResponseEntity
                .status(errorCode.getHttpStatusCode())
                .body(apiResponse);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<?>> accessDeniedException(final AccessDeniedException e) {
        ApiResponse<?> apiResponse = new ApiResponse<>();
        ErrorCode errorCode = ErrorCode.FORBIDDEN;

        apiResponse.setCode(errorCode.getCode());
        apiResponse.setMessage(errorCode.getMessage());

        return ResponseEntity
                .status(errorCode.getHttpStatusCode())
                .body(apiResponse);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
        ApiResponse<?> response = new ApiResponse<>();
        BindingResult bindingResult = e.getBindingResult();

        String message;
        if (!bindingResult.getFieldErrors().isEmpty()) {
            message = bindingResult.getFieldErrors().get(0).getDefaultMessage();
        } else {
            message = e.getGlobalErrors().get(0).getDefaultMessage();
        }

        ErrorCode errorCode = ErrorCode.INVALID_VALIDATION;
        response.setCode(errorCode.getCode());
        response.setMessage(message);

        return ResponseEntity
                .status(errorCode.getHttpStatusCode())
                .body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> genericException(final Exception e) {
        ApiResponse<?> apiResponse = new ApiResponse<>();
        apiResponse.setCode(9999);
        apiResponse.setMessage("Lỗi hệ thống");

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(apiResponse);
    }
}