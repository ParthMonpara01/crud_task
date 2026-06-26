package com.menu.item.master.exception;

/**
 * This is the file which will handle by any case Exception occur, this Custom Exception
 * will not Crash the application and Handle Exception Properly and it will show in frontend
 */

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class BusinessValidationException extends RuntimeException {

    public BusinessValidationException(String message) {
        super(message);
    }

}