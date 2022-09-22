/**
 * 
 * @param {*} func 
 * @returns 
 */
module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}

/**
 * 异步代码的错误必须返回给next()函数 Express会捕获和处理
 * 同时必须定义错误处理函数(自定义错误程序)
 * 同时错误处理函数需要放到末尾 因为在中间件中是由上到下执行的
 * 如果遇到一处错误 就不会继续向下执行
 * 
 *   app.use((err, req, res, next) => {
 *       res.send('Something went wrong!')
 *   })
 * 
 * 对于async异常 需要封装一个函数将async/await与Express错误处理中间件联系起来
 * 
 *   function wrapAsync(fn) {
 *       return function(req, res, next) {
 *           fn(req, res, next).catch(next)
 *       }
 *   }
 *
 * 
 * 
 */