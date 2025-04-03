"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersistenceErrorException = exports.ValidationErrorException = exports.DataNotFoundException = void 0;
class DataNotFoundException extends Error {
    constructor(message = "Data not found") {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.DataNotFoundException = DataNotFoundException;
class ValidationErrorException extends Error {
    constructor(message = "Validation error") {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ValidationErrorException = ValidationErrorException;
class PersistenceErrorException extends Error {
    constructor(message = "Validation error") {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.PersistenceErrorException = PersistenceErrorException;
