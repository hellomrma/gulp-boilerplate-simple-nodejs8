var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var cssmin = require('gulp-cssmin');
var rename = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');
var spritesmith = require('gulp.spritesmith-multi');
var merge = require('merge-stream');
var imagemin = require('gulp-imagemin');
var runSequence = require('run-sequence');
var del = require('del');
var watch = require('gulp-watch');
var concatCss = require('gulp-concat-css');
var browserSync = require('browser-sync').create();

var bases = {
    src: './src/',
    dest: './'
};

var paths = {
    scss: bases.src + 'scss/**/*.scss',
    images: bases.src + 'img/**/*.*',
    js: bases.dest + 'js/apps/**/*.js',
    html: bases.dest + '**/*.html',
    sprites: bases.src + 'img/sprites/**/*.*'
};

gulp.task('html', function() {
    return gulp.src([paths.html, '!./node_modules/**/*.*'])
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('minify-js', ['clean-min-js-files'], function() {
    return gulp.src(paths.js)
        .pipe(concat('project-name.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(bases.dest + 'js'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('sass', function() {
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

gulp.task('minify-css', function() {
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

gulp.task('images', function() {
    return gulp.src(paths.images)
        .pipe(imagemin())
        .pipe(gulp.dest(bases.dest + 'img'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('sprites', function() {
    var opts = {
        spritesmith: function(options, sprite, icons) {
            options.imgPath = `../img/sprites/${options.imgName}`;
            options.cssName = `${sprite}-sprites.css`;
            options.cssTemplate = null;
            options.cssSpritesheetName = sprite;
            options.padding = 4;
            options.cssVarMap = function(sp) {
                sp.name = `${sprite}-${sp.name}`;
            };
            return options;
        }
    };
    var spriteData = gulp.src('./src/img/sprites/**/*.png').pipe(spritesmith(opts)).on('error', function(err) {
        console.log(err)
    });

    var imgStream = spriteData.img.pipe(gulp.dest('./img/sprites'));
    var cssStream = spriteData.css.pipe(gulp.dest('./css/sprites'));

    return merge(imgStream, cssStream);
});

gulp.task('sprites-css-concat', function() {
    return gulp.src(bases.dest + 'css/sprites/**/*.css')
        .pipe(concatCss("sprites.css"))
        .pipe(gulp.dest(bases.dest + 'css/sprites'));
});

gulp.task('clean-img-files', function() {
    return del(bases.dest + 'img/**/*.*');
});

gulp.task('clean-css-files', function() {
    return del(bases.dest + 'css/**/*.*');
});

gulp.task('clean-min-js-files', function() {
    return del(bases.dest + 'js/*.min.js');
});

gulp.task('generate-sass', function() {
    runSequence('clean-css-files', 'sprites', 'sass', 'sprites-css-concat', 'minify-css');
});

gulp.task('generate-images-sprites', function() {
    runSequence('clean-css-files', 'clean-img-files', 'images', 'sprites', 'sass', 'sprites-css-concat', 'minify-css');
});

gulp.task('watch', function() {
    watch([paths.scss], function() {
        gulp.start('generate-sass');
    });
    gulp.watch(paths.js, ['minify-js']);
    watch([paths.images], function() {
        gulp.start('generate-images-sprites');
    });
    gulp.watch(paths.html, ['html']);
});

gulp.task('init-resources', function() {
    gulp.start('clean-css-files');
    gulp.start('minify-js');
    gulp.start('generate-images-sprites');
    gulp.start('html');
});

gulp.task('server', ['watch'], function() {
    browserSync.init({
        server: {
            baseDir: bases.dest
        }
    });
});

gulp.task('default', ['init-resources', 'server']);
