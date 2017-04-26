const gulp = require('gulp');
const sass = require('gulp-sass');
const less = require('gulp-less');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const cssmin = require('gulp-cssmin');
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin')
const runSequence = require('run-sequence')
const del = require('del')
const watch = require('gulp-watch')
const browserSync = require('browser-sync').create();

const bases = {
    src: './src/',
    dest: './'
};

const paths = {
    js: bases.dest + 'js/apps/**/*.js',
    scss: bases.src + 'scss/**/*.scss',
    html: bases.dest + '**/*.html',
    images: bases.src + 'img/**/*.*'
};

gulp.task('html', function () {
    return gulp.src([paths.html, '!./node_modules/**/*.*'])
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('minify-js', ['clean-min-js-files'], function () {
    return gulp.src(paths.js)
        .pipe(concat('project-name.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(bases.dest + 'js'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('sass', function () {
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
        .pipe(gulp.dest(bases.dest + 'css'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('minify-css', function () {
    gulp.src([bases.dest + 'css/**/*.css', '!./css/**/*.min.css'])
        .pipe(cssmin())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(bases.dest + 'css'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('images', ['clean-img-folders'], function () {
    return gulp.src(paths.images)
        .pipe(imagemin())
        .pipe(gulp.dest(bases.dest + 'img'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('clean-img-folders', function () {
    return del(bases.dest + 'img');
});

gulp.task('clean-css-folders', function () {
    return del(bases.dest + 'css');
});

gulp.task('clean-min-js-files', function () {
    return del(bases.dest + 'js/*.min.js');
});

gulp.task('generate-sass', function () {
    runSequence('clean-css-folders', 'sass', 'minify-css');
});

gulp.task('watch', function () {
    gulp.watch(paths.js, ['minify-js']);
    watch([paths.scss], function () {
        gulp.start('generate-sass');
    });
    watch([paths.images], function () {
        gulp.start('images');
    });
    gulp.watch(paths.html, ['html']);
});

gulp.task('init-resources', function () {
    gulp.start('generate-sass');
    gulp.start('minify-js');
    gulp.start('images');
    gulp.start('html');
})

gulp.task('server', function () {
    browserSync.init({
        server: {
            baseDir: bases.dest
        }
    });
});

gulp.task('default', ['init-resources', 'server', 'watch']);