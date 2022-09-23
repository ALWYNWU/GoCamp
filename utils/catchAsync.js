/**
 * Function use to handle async error
 * Associate async/await with Express error handling middleware
 */
module.exports = func => {
    return (req, res, next) => {
        // Catch async func error and pass it to next()
        // if func(req, res, next) is async function, it return a promise object
        // then call promise.catch() method to catch error and pass to next() function
        func(req, res, next).catch(next);
    }
}
