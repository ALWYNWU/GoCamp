class ExpressError extends Error{
    constructor(message, statusCode){
        // Cause we extend Error class
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}

module.exports=ExpressError;