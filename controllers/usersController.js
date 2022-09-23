const User = require('../models/user');

/**
 * Route to register page
 */
module.exports.toRegister = (req, res) => {
    res.render('users/register')
}

/**
 * Register user
 */
module.exports.register = async (req, res, next) => {

    try {
        const {email, username, password} = req.body;
        const user = new User({email, username});

        // user.register is passport method
        // This method can automatically encrypte password, generate salt and hash
        const registerUser = await User.register(user, password);

        // call req.login to auto login after register
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

/**
 * Route to login page
 */
module.exports.toLogin = (req, res) => {

    /**
     * At campground show page, if user are not logged in, and 
     * click the leave a review button, we set 'returnTo' in Url,
     * so if req.query.returnTo exist, set it into session
     */
    if(req.query.returnTo){
        req.session.returnTo = req.query.returnTo;
    }
    res.render('users/login');
}

/**
 * User login
 */
module.exports.login = (req, res) => {

    req.flash('success','welcome back!');

    // reserve the url before login to 'returnTo'
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;

    // redirect to the page before login
    res.redirect(redirectUrl);
}

/**
 * User logout
 */
module.exports.logout = (req, res, next) => {
    req.logout(function(err) {
      if (err) { return next(err); }
      req.flash('success', "Goodbye!");
      res.redirect('/campgrounds');
    });
}