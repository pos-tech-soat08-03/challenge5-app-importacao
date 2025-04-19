export class userEntity {
    userId;
    email;
    firstName;
    lastName;
    authToken;
    constructor(userId, email, firstName, lastName, authToken) {
        this.userId = userId;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.authToken = authToken;
    }
}
