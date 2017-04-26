const gulp = require('gulp');
const sass = require('gulp-sass');
const less = require('gulp-less');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const cssmin = require('gulp-cssmin');
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
const spritesmith = require('gulp.spritesmith-multi')
const merge = require('merge-stream')
const imagemin = require('gulp-imagemin')
const runSequence = require('run-sequence')
const del = require('del')
const watch = require('gulp-watch')
const concatCss = require('gulp-concat-css')
const browserSync = require('browser-sync').create();

const dist = './';
const paths = {
    js: dist + 'js/**/*.js',
    scss: dist + 'scss/**/*.scss',
    html: dist + '**/*.html',
    images: dist + 'img/**/*.*',
    sprites: dist + 'img/sprites/**/*.*'
};

gulp.task('html', function () {
    return gulp.src(paths.html)
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('minify-js', ['clean-js-folders'], function () {
    return gulp.src([paths.js, '!./js/libs/**/*.*'])
        .pipe(concat('project-name.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(dist + 'js'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('sass', ['clean-css-folders'], function () {
    return gulp.src(paths.scss)
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'expanded'
        }).on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(autoprefixer({
            browsers: ['last 2 version', 'safari 5', 'ie 7', 'ie 8', 'ie 9', 'ios 6', 'android 4'],
            cascade: false
        }))
        .pipe(gulp.dest(dist + 'css'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('minify-css', ['sass'], function () {
    gulp.src([dist + 'css/**/*.css', '!./css/**/*.min.css'])
        .pipe(cssmin())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(dist + 'css'));
});

gulp.task('clean-css-folders', function () {
    return del(dist + 'css');
});

gulp.task('clean-js-folders', function () {
    return del(dist + 'js/*.js');
});

gulp.task('watch', function () {
    gulp.watch(paths.html, ['html']);
    gulp.watch(paths.js, ['minify-js']);
    gulp.watch(paths.scss, ['minify-css']);
});

gulp.task('init-dist-resources', function () {
    gulp.start('html');
    gulp.start('minify-js');
    gulp.start('minify-css');
})

gulp.task('server', function () {
    browserSync.init({
        server: {
            baseDir: dist
        }
    });
});

gulp.task('default', ['init-dist-resources', 'server', 'watch']);