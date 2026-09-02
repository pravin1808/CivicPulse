package com.civicpulse.civicpulse.exception;

import com.civicpulse.civicpulse.model.dto.ErrorResponseDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // ── 400 Bad Request ──────────────────────────────────────────────────────

    /**
     * Handles @Valid / @Validated failures on @RequestBody DTOs.
     * Collects all field-level messages and joins them.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseDto> handleValidation(MethodArgumentNotValidException ex) {
        List<FieldError> fieldErrors = ex.getBindingResult().getFieldErrors();
        String message = fieldErrors
                .stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        Map<String, List<String>> errorsByField = fieldErrors.stream()
                .collect(Collectors.groupingBy(
                        FieldError::getField,
                        java.util.LinkedHashMap::new,
                        Collectors.mapping(FieldError::getDefaultMessage, Collectors.toList())
                ));
        return build(HttpStatus.BAD_REQUEST, "Validation Failed", message, errorsByField);
    }

    /**
     * Handles malformed JSON / unreadable request body.
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponseDto> handleUnreadable(HttpMessageNotReadableException ex) {
        return build(HttpStatus.BAD_REQUEST, "Malformed Request",
                "Request body is missing or contains invalid JSON.");
    }

    /**
     * Handles missing required @RequestParam.
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponseDto> handleMissingParam(MissingServletRequestParameterException ex) {
        return build(HttpStatus.BAD_REQUEST, "Missing Parameter",
                "Required parameter '" + ex.getParameterName() + "' is missing.");
    }

    /**
     * Handles type mismatch on path variables or request params (e.g. string where Long expected).
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponseDto> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        return build(HttpStatus.BAD_REQUEST, "Type Mismatch",
                "Parameter '" + ex.getName() + "' has an invalid value: '" + ex.getValue() + "'.");
    }

    /**
     * Handles invalid OTP supplied by the user.
     */
    @ExceptionHandler(InvalidOtpException.class)
    public ResponseEntity<ErrorResponseDto> handleInvalidOtp(InvalidOtpException ex) {
        return build(HttpStatus.BAD_REQUEST, "Invalid OTP", ex.getMessage());
    }

    /**
     * Handles uploaded files that exceed the configured size limit.
     */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponseDto> handleMaxUpload(MaxUploadSizeExceededException ex) {
        return build(HttpStatus.BAD_REQUEST, "File Too Large",
                "The image must be 10 MB or smaller.",
                Map.of("image", List.of("The image must be 10 MB or smaller.")));
    }

    @ExceptionHandler(MissingServletRequestPartException.class)
    public ResponseEntity<ErrorResponseDto> handleMissingPart(MissingServletRequestPartException ex) {
        String field = "image".equals(ex.getRequestPartName()) ? "image" : "status";
        String message = "Required upload data is missing. Please select the image again and retry.";
        return build(HttpStatus.BAD_REQUEST, "Missing Upload Data", message, Map.of(field, List.of(message)));
    }

    @ExceptionHandler(InvalidImageException.class)
    public ResponseEntity<ErrorResponseDto> handleInvalidImage(InvalidImageException ex) {
        return build(HttpStatus.BAD_REQUEST, "Invalid Image", ex.getMessage(), Map.of("image", List.of(ex.getMessage())));
    }

    @ExceptionHandler(ImageStorageException.class)
    public ResponseEntity<ErrorResponseDto> handleImageStorage(ImageStorageException ex) {
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Image Storage Failed", ex.getMessage(), Map.of("image", List.of(ex.getMessage())));
    }

    // ── 403 Forbidden ────────────────────────────────────────────────────────

    /**
     * Handles attempts to access or modify a resource the user does not own.
     */
    @ExceptionHandler(AccessForbiddenException.class)
    public ResponseEntity<ErrorResponseDto> handleForbidden(AccessForbiddenException ex) {
        return build(HttpStatus.FORBIDDEN, "Access Denied", ex.getMessage());
    }

    // ── 404 Not Found ────────────────────────────────────────────────────────

    /**
     * Handles any resource that could not be found in the database.
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponseDto> handleNotFound(ResourceNotFoundException ex) {
        return build(HttpStatus.NOT_FOUND, "Resource Not Found", ex.getMessage());
    }

    // ── 409 Conflict ─────────────────────────────────────────────────────────

    /**
     * Handles duplicate resource creation (e.g. email already registered).
     */
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ErrorResponseDto> handleDuplicate(DuplicateResourceException ex) {
        return build(HttpStatus.CONFLICT, "Conflict", ex.getMessage());
    }

    // ── 410 Gone ─────────────────────────────────────────────────────────────

    /**
     * Handles expired OTP / expired session.
     */
    @ExceptionHandler(OtpExpiredException.class)
    public ResponseEntity<ErrorResponseDto> handleOtpExpired(OtpExpiredException ex) {
        return build(HttpStatus.GONE, "Session Expired", ex.getMessage());
    }

    // ── Spring ResponseStatusException (used in AdminService) ────────────────

    /**
     * Passes through Spring's own ResponseStatusException with its original status.
     */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponseDto> handleResponseStatus(ResponseStatusException ex) {
        return build(HttpStatus.valueOf(ex.getStatusCode().value()),
                "Request Failed",
                ex.getReason() != null ? ex.getReason() : ex.getMessage());
    }

    // ── 500 Internal Server Error (fallback) ─────────────────────────────────

    /**
     * Catch-all fallback for any unhandled exception — prevents stack-trace leaks.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDto> handleGeneral(Exception ex) {
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error",
                "An unexpected error occurred. Please try again later.");
    }

    // ── Helper ───────────────────────────────────────────────────────────────

    private ResponseEntity<ErrorResponseDto> build(HttpStatus status, String error, String message) {
        return ResponseEntity
                .status(status)
                .body(new ErrorResponseDto(status.value(), error, message));
    }

    private ResponseEntity<ErrorResponseDto> build(
            HttpStatus status,
            String error,
            String message,
            Map<String, List<String>> fieldErrors
    ) {
        return ResponseEntity
                .status(status)
                .body(new ErrorResponseDto(status.value(), error, message, fieldErrors));
    }
}
