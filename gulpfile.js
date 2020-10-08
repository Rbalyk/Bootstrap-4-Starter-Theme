"use strict";

/* параметри для gulp-autoprefixer */
var autoprefixerList = [
    'Chrome >= 45',
    'Firefox ESR',
    'Edge >= 12',
    'Explorer >= 10',
    'iOS >= 9',
    'Safari >= 9',
    'Android >= 4.4',
    'Opera >= 30'
];
/* шляхи до ісходних файлів (src), до готовим файлам (build), а також до тих за змінами яких треба дивитися (watch)*/
var path = {
    build: {
        html: 'assets/build/',
        js: 'assets/build/js/',
        css: 'assets/build/css/',
        img: 'assets/build/img/',
        fonts: 'assets/build/fonts/'
    },
    src: {
        html: 'assets/src/*.html',
        js: 'assets/src/js/*.js',
        style: 'assets/src/style/style.scss',
        img: 'assets/src/img/**/*.*',
        fonts: 'assets/src/fonts/**/*.*'
    },
    watch: {
        html: 'assets/src/**/*.html',
        js: 'assets/src/js/**/*.js',
        css: 'assets/src/style/**/*.scss',
        img: 'assets/src/img/**/*.*',
        fonts: 'assets/srs/fonts/**/*.*'
    },
    clean: './assets/build'
};
/* настройки сервера */
var config = {
    server: {
        baseDir: './assets/build'
    },
    notify: false
};

/* підключення gulp і плагіни */
var gulp = require('gulp'),  // підключення Gulp
    webserver = require('browser-sync'), // сервер для роботи і автоматичного обновлення сторінок
    plumber = require('gulp-plumber'), // модуль для відслідковування помилок
    rigger = require('gulp-rigger'), // модуль для імпорта даних одного файла в другий
    sass = require('gulp-sass'), // модуль для компіляції SASS (SCSS) в CSS
    autoprefixer = require('gulp-autoprefixer'), // модуль для автопрефіксів
    cleanCSS = require('gulp-clean-css'), // плагін для мініфікації CSS
    uglify = require('gulp-uglify'), // модуль для мініфікації JavaScript
    cache = require('gulp-cache'), // модуль для кешування
    imagemin = require('gulp-imagemin'), // плагін для стискання PNG, JPEG, GIF і SVG зображень
    jpegrecompress = require('imagemin-jpeg-recompress'), // плагін для стискання jpeg
    pngquant = require('imagemin-pngquant'), // плагін для стискання png
    del = require('del'), // плагін для видалення файлів з каталога
    rename = require('gulp-rename');

/* завдання */

// запуск сервера
gulp.task('webserver', function () {
    webserver(config);
});

// збірка html
gulp.task('html:build', function () {
    return gulp.src(path.src.html)
        .pipe(plumber())
        .pipe(rigger())
        .pipe(gulp.dest(path.build.html))
        .pipe(webserver.reload({ stream: true }));
});

// збірка стилів
gulp.task('css:build', function () {
    return gulp.src(path.src.style)
        .pipe(plumber())
        .pipe(sass())
        .pipe(autoprefixer({
            overrideBrowserslist:  ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest(path.build.css))
        .pipe(rename({ suffix: '.min' }))
        .pipe(cleanCSS())
        .pipe(gulp.dest(path.build.css))
        .pipe(webserver.reload({ stream: true }));
});

// збірка js
gulp.task('js:build', function () {
    return gulp.src(path.src.js)
        .pipe(plumber())
        .pipe(rigger())
        .pipe(gulp.dest(path.build.js))
        .pipe(rename({ suffix: '.min' }))
        .pipe(uglify())
        .pipe(gulp.dest(path.build.js))
        .pipe(webserver.reload({ stream: true }));
});

// перенос шрифтів
gulp.task('fonts:build', function () {
    return gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts));
});

// обробка картинок
gulp.task('image:build', function () {
    return gulp.src(path.src.img)
        .pipe(cache(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            jpegrecompress({
                progressive: true,
                max: 90,
                min: 80
            }),
            pngquant(),
            imagemin.svgo({ plugins: [{ removeViewBox: false }] })
        ])))
        .pipe(gulp.dest(path.build.img));
});

// видалення каталога build
gulp.task('clean:build', function () {
    del.sync(path.clean);
});

// очистка кешу
gulp.task('cache:clear', function () {
    cache.clearAll();
});

// збірка
gulp.task('build', gulp.parallel('clean:build',
    'html:build',
    'css:build',
    'js:build',
    'fonts:build',
    'image:build'));

// запуск завдань при зміні файлів
gulp.task('watch', function () {
    gulp.watch(path.watch.html, gulp.parallel('html:build'));
    gulp.watch(path.watch.css, gulp.parallel('css:build'));
    gulp.watch(path.watch.js, gulp.parallel('js:build'));
    gulp.watch(path.watch.img, gulp.parallel('image:build'));
    gulp.watch(path.watch.fonts, gulp.parallel('fonts:build'));
});

// завдання за замовчуванням
gulp.task('default', gulp.parallel('clean:build',
    'build',
    'webserver',
    'watch'));
