var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var path = require('path');
var browserSync = require('browser-sync').create();

var dist = '.';
var paths = {
    js: dist + '/js/**/*.js',
    scss: dist + '/scss/**/*.scss'
};

gulp.task('server', ['watch'], function() {
    browserSync.init({
        server: {
            baseDir: dist
        }
    });
    gulp.watch("./scss/*.scss", ['sass']);
    gulp.watch("./*.html").on('change', browserSync.reload);
    gulp.watch("./js/*.js", ['js-watch']);
});

gulp.task('sass', function() {
    return gulp.src(paths.scss)
        .pipe(sourcemaps.init())
        .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(dist + '/css'))
        .pipe(browserSync.reload({ stream: true }));
});

gulp.task('js-watch', function (done) {
    browserSync.reload();
    done();
});

gulp.task('watch', function() {
    gulp.watch(paths.scss, ['sass']);
});

gulp.task('default', ['server']);
