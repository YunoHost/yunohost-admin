// Include Gulp
var gulp = require('gulp');

// Include required Gulp packages
var concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    csslint = require('gulp-csslint'),
    jshint = require('gulp-jshint'),
    less = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    cssmin = require('gulp-cssmin'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename')
    util = require('gulp-util')
    gulpif = require('gulp-if')
    ;

// Environment variables
isDev = (util.env.dev) ? true : false;
isProduction = !isDev;

// Global build task
gulp.task('build', [
    'css',
    'fonts',
    'js',
    'img',
]);


// Watch task
gulp.task('watch', function(){
    gulp.watch('js/**/*.js', ['js']);
    gulp.watch('css/*.less', ['css']);
});


// JS task
gulp.task('js', function() {
    return gulp.src([
            'bower_components/jquery/dist/jquery.js',
            'bower_components/js-cookie/src/js.cookie.js',
            'bower_components/handlebars/handlebars.js',
            'bower_components/handlebars-helper-intl/dist/handlebars-intl-with-locales.js',
            'bower_components/sammy/lib/sammy.js',
            'bower_components/sammy/lib/plugins/sammy.handlebars.js',
            'bower_components/sammy/lib/plugins/sammy.json.js',
            'bower_components/sammy/lib/plugins/sammy.storage.js',
            'bower_components/bootstrap/dist/js/bootstrap.js',
            'bower_components/isotope-layout/dist/isotope.pkgd.js',
            'js/yunohost/y18n.js',
            'js/yunohost/main.js',
            'js/yunohost/helpers.js',
            'js/yunohost/filters.js',
            'js/yunohost/events.js',
            'js/yunohost/controllers/*.js',
        ])
        .pipe(gulpif(isProduction, uglify()))
        .pipe(concat('script.min.js'))
        .pipe(gulp.dest('./dist/js'))
});


// JS Lint task
gulp.task('js-lint', function() {
    return gulp.src('js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Fonts
gulp.task('fonts', function() {
    return gulp.src([
            'bower_components/font-awesome/fonts/*',
            'bower_components/source-code-pro/EOT/*.eot',
            'bower_components/source-code-pro/OTF/*.otf',
            'bower_components/source-code-pro/TTF/*.ttf',
            'bower_components/source-code-pro/WOFF/OTF/*.woff',
            'bower_components/source-code-pro/WOFF2/TTF/*.woff2',
            'bower_components/source-sans-pro/EOT/*.eot',
            'bower_components/source-sans-pro/OTF/*.otf',
            'bower_components/source-sans-pro/TTF/*.ttf',
            'bower_components/source-sans-pro/WOFF/OTF/*.woff',
            'bower_components/source-sans-pro/WOFF2/TTF/*.woff2',
        ])
        .pipe(gulp.dest('./dist/fonts'))
});

// CSS task
gulp.task('css', function () {
    return gulp.src('css/style.less')
        .pipe(less())
        .pipe(autoprefixer())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulpif(isProduction, cssmin()))
        .pipe(gulp.dest('./dist/css'))
});


// CSS/Less lint task
gulp.task('css-lint', function() {
    return gulp.src('css/style.less')
        .pipe(less())
        .pipe(autoprefixer())
        .pipe(csslint())
        .pipe(csslint.reporter('compact'))
        .pipe(gulp.dest('./css/'))
});


// Images task
gulp.task('img', function () {
    return gulp.src('img/*')
        .pipe(gulpif(isProduction, imagemin()))
        .pipe(gulp.dest('./dist/img'))
});
