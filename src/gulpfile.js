// Include Gulp
var gulp = require('gulp');

// Include required Gulp packages
var concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    csslint = require('gulp-csslint'),
    jshint = require('gulp-jshint'),
    mustache = require('gulp-mustache'),
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

// JS task
gulp.task('js', function() {
    return gulp.src([
            'node_modules/jquery/dist/jquery.js',
            'node_modules/handlebars/dist/handlebars.js',
            'node_modules/handlebars-intl/dist/handlebars-intl-with-locales.js',
            'node_modules/sammy/lib/sammy.js',
            'node_modules/sammy/lib/plugins/sammy.handlebars.js',
            'node_modules/sammy/lib/plugins/sammy.json.js',
            'node_modules/sammy/lib/plugins/sammy.storage.js',
            'node_modules/bootstrap/dist/js/bootstrap.js',
            'node_modules/isotope-layout/dist/isotope.pkgd.js',
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
    return gulp.src('js/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Fonts
gulp.task('fonts', function() {
    return gulp.src([
            'node_modules/fork-awesome/fonts/*',
            'node_modules/source-code-pro/EOT/*.eot',
            'node_modules/source-code-pro/OTF/*.otf',
            'node_modules/source-code-pro/TTF/*.ttf',
            'node_modules/source-code-pro/WOFF/OTF/*.woff',
            'node_modules/source-code-pro/WOFF2/TTF/*.woff2',
            'node_modules/source-sans-pro/EOT/*.eot',
            'node_modules/source-sans-pro/OTF/*.otf',
            'node_modules/source-sans-pro/TTF/*.ttf',
            'node_modules/source-sans-pro/WOFF/OTF/*.woff',
            'node_modules/source-sans-pro/WOFF2/TTF/*.woff2',
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
        .pipe(csslint.formatter())
});


// Images task
gulp.task('img', function () {
    return gulp.src('img/*')
        .pipe(gulpif(isProduction, imagemin()))
        .pipe(gulp.dest('./dist/img'))
});

// Views task
gulp.task('views', function () {
    return gulp.src('views/**/*.ms')
    .pipe(gulp.dest("./dist/views"));
});

// Global build task
gulp.task('build', gulp.series('css', 'fonts', 'js', 'img', 'views'));

// Watch task
gulp.task('watch', function() {
    gulp.watch('js/**/*.js', gulp.series('js'));
    gulp.watch('css/*.less', gulp.series('css'));
    gulp.watch('views/**/*.ms', gulp.series('views'));
});

gulp.task('lint', gulp.series('css-lint', 'js-lint'));

gulp.task('default', gulp.series('build', 'watch'));