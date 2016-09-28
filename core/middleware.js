/**
 * Created by Tim on 2016-09-28.
 */

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

module.exports = {
    ensureAuthenticated
};