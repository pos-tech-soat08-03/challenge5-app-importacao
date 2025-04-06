"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userEntity = void 0;
class userEntity {
    constructor(userId, email, firstName, lastName, authToken) {
        this.userId = userId;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.authToken = authToken;
    }
}
exports.userEntity = userEntity;
