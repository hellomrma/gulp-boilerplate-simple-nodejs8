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

const bases = {
    src: 'public/src/',
    dest: 'public/dist/'
};

const paths = {
    js: bases.src + 'js/**/*.js',
    scss: bases.src + 'css/scss/**/*.scss',
    less: bases.src + 'css/less/**/*.less',
    html: bases.src + '**/*.html',
    images: bases.src + 'img/**/*.*',
    sprites: bases.src + 'img/sprites/**/*.*'
};

gulp.task('html', function () {
    return gulp.src(paths.html)
        .pipe(gulp.dest(bases.dest))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('js-vendors', ['clean-js-folders'], function () {
    return gulp.src(bases.src + 'js/vendors/**/*.*')
        .pipe(gulp.dest(bases.dest + 'js/vendors'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('minify-js', ['js-vendors'], function () {
    return gulp.src([paths.js, '!public/src/js/vendors/**/*.*'])
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
    gulp.src([bases.dest + 'css/**/*.css', '!public/dist/css/**/*.min.css'])
        .pipe(cssmin())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(bases.dest + 'css'));
});

gulp.task('images', function () {
    return gulp.src(paths.images)
        .pipe(imagemin())
        .pipe(gulp.dest(bases.dest + 'img'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('sprites', function () {
    var opts = {
        spritesmith: function (options, sprite, icons) {
            options.imgPath = `../img/sprites/${options.imgName}`;
            options.cssName = `${sprite}-sprites.css`;
            options.cssTemplate = null;
            options.cssSpritesheetName = sprite;
            options.padding = 4;
            options.cssVarMap = function (sp) {
                sp.name = `${sprite}-${sp.name}`;
            };
            return options;
        }
    };
    var spriteData = gulp.src('./public/src/img/sprites/**/*.png').pipe(spritesmith(opts)).on('error', function (err) {
        console.log(err)
    });

    var imgStream = spriteData.img.pipe(gulp.dest('./public/dist/img/sprites'));
    var cssStream = spriteData.css.pipe(gulp.dest('./public/dist/css/sprites'));

    return merge(imgStream, cssStream);
});

gulp.task('sprites-css-concat', function () {
    return gulp.src(bases.dest + 'css/sprites/**/*.css')
        .pipe(concatCss("sprites.css"))
        .pipe(gulp.dest(bases.dest + 'css/sprites'));
});

gulp.task('clean-dist-folders', function () {
    return del(bases.dest + '*.*');
});

gulp.task('clean-img-folders', function () {
    return del(bases.dest + 'img');
});

gulp.task('clean-css-folders', function () {
    return del(bases.dest + 'css');
});

gulp.task('clean-js-folders', function () {
    return del(bases.dest + 'js');
});

gulp.task('generate-sass', function () {
    runSequence('clean-css-folders', 'sprites', 'sass', 'sprites-css-concat', 'minify-css');
});

gulp.task('generate-images-sprites', function () {
    runSequence('clean-css-folders', 'clean-img-folders', 'images', 'sprites', 'sass', 'sprites-css-concat', 'minify-css');
});

gulp.task('watch', function () {
    gulp.watch(paths.html, ['html']);
    gulp.watch(paths.js, ['minify-js']);
    watch([paths.scss], function () {
        gulp.start('generate-sass');
    });
    gulp.watch(paths.scss, ['sass']);
    watch([paths.images], function () {
        gulp.start('generate-images-sprites');
    });
});

gulp.task('init-dist-resources', function () {
    gulp.start('clean-dist-folders');
    gulp.start('minify-js');
    gulp.start('generate-images-sprites');
    gulp.start('html');
})

gulp.task('server', function () {
    browserSync.init({
        server: {
            baseDir: bases.dest
        }
    });
});

gulp.task('default', ['init-dist-resources', 'server', 'watch']);