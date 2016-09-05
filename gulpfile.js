// include gulp
const gulp = require('gulp');

// include plug-ins
const jshint = require('gulp-jshint');
const minifyHTML = require('gulp-minify-html');
const concat = require('gulp-concat');
const stripDebug = require('gulp-strip-debug');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');


// JS hint task
gulp.task('jshint', () => {
    gulp.src(['./app.js', './webapp/*.js', './core/*.js', './routes/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// minify new or changed HTML pages
gulp.task('htmlpage', () => {
    var htmlSrc = './webapp/*.html',
        htmlDst = './build/html';

    gulp.src(htmlSrc)
        .pipe(changed(htmlDst))
        .pipe(minifyHTML())
        .pipe(gulp.dest(htmlDst));
});

// JS concat, strip debugging and minify
gulp.task('scripts', () => {
    gulp.src(['./webapp/*.js','./routes/*.js', './app.js', './core/*.js'])
        .pipe(concat('script.js'))
        .pipe(stripDebug())
        .pipe(uglify())
        .pipe(gulp.dest('./.build/scripts/'));
});

gulp.task('babel', () => {
    gulp.src(['./app.js', './core/*.js', './routes/*.js'])
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('./.build/scripts'));
});

// minify gulp task
gulp.task('minify', ['htmlpage', 'scripts'], () => {
});

// production gulp task
gulp.task('production', ['babel', 'minify'], () => {
});