/**
 * Created by Tim on 2016-09-28.
 */

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

function inQuiz(req, res, next) {
    if(req.session.quizID) {
        return next();
    } else {
        res.status(404);
        return res.json({message: 'User not in quiz'});
    }
}

module.exports = {
    ensureAuthenticated,
    inQuiz
};