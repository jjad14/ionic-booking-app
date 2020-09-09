export class User {
    constructor(public id: string,
                public email: string,
                public token: string,
                private tokenExpirationDate: Date) {}

    
    getToken() {
        if (!this.tokenExpirationDate || this.tokenExpirationDate <= new Date()) {
            return null;
        }

        return this.token;
    }

    getTokenDuration() {
        if (!this.token) {
            return 0;
        }
        return this.tokenExpirationDate.getTime() - new Date().getTime();
    }



}