class MissingConfigurationError extends Error {
    constructor(message) {
        super(message);
        this.name = "MissingConfigurationError";
    }
}

class CustomError extends Error {
    constructor(message) {
        super(message);
        this.name = "CustomError";
    }
}

class CustomValidationError extends Error {
    constructor(data) {
        super(data);
        this.name = "CustomValidationError";
        this.data = data;
    }
}

class ForbiddenError extends Error {
    constructor(message) {
        super(message);
        this.name = "ForbiddenError";
        this.message = message;
    }
}

class ConflictError extends Error {
    constructor(code) {
        super(code);
        this.name = "ConflictError";
        this.reason = code;
    }
}

module.exports = {
    ConflictError,
    ForbiddenError,
    MissingConfigurationError,
    CustomError,
    CustomValidationError,
};
