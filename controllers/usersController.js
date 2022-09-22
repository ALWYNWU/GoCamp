const User = require('../models/user');

module.exports.toRegister = (req, res) => {
    res.render('users/register')
}

module.exports.register = async (req, res, next) => {

    try {
        const {email, username, password} = req.body;
        const user = new User({email, username});
        const registerUser = await User.register(user, password);

        // 注册完自动登录
        req.login(registerUser, err => {
            if(err) return next(err);
            req.flash('success', 'Welcome to GoCamp!');
            res.redirect('/campgrounds')
        })

        
    } catch (error) {
        req.flash('error', error.message);
        res.redirect('register');
    }
}

module.exports.toLogin = (req, res) => {
    if(req.query.returnTo){
        req.session.returnTo = req.query.returnTo;
    }
    res.render('users/login');
}

module.exports.login = (req, res) => {
    req.flash('success','welcome back!');

    //记录登陆前访问的url 登陆后跳转到该url
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    // console.log(redirectUrl)
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
    req.logout(function(err) {
      if (err) { return next(err); }
      req.flash('success', "Goodbye!");
      res.redirect('/campgrounds');
    });
}