//initialize moduels
const { src, dest, watch, parallel, series } = require('gulp');
const autoprefixer = require('autoprefixer');
//const cssnano = require('cssnano');
const cleanCSS  = require( 'gulp-clean-css' )
const postcss = require('gulp-postcss');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const replace = require('gulp-replace');
const concat = require('gulp-concat');
const browserSync  = require( 'browser-sync' ).create();
const reload  = browserSync.reload;
const changed = require('gulp-changed');
const imagemin  = require('gulp-imagemin');
const lineec  = require('gulp-line-ending-corrector');

//config sass
//sass.compiler = require('node-sass');

//File path valirables
const files = {
    'scssPath': 'app/scss/**/*.scss',
    'jsPath' : 'app/js/**/*.js',
    'imgPath': 'app/images/*',
    'cssDest': 'dist/css/',
    'jsDest': 'dist/js/',
    'imgDest': 'dist/img/'
}

// const cssSRC =  [
//     'style1.css',
//     'style2.css'
//   ];

//sass task
function sassTask(){
    return src(files.scssPath)
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(postcss([autoprefixer()]))
        .pipe(cleanCSS())
        .pipe(sourcemaps.write('.'))
        .pipe(lineec())
        .pipe(dest(files.cssDest));

}

//concat css task
// function concatCSSTask() {
//     return src(cssSRC)
//     .pipe(sourcemaps.init({loadMaps: true, largeFile: true}))
//     .pipe(concat('style.min.css'))
//     .pipe(cleanCSS())
//     .pipe(sourcemaps.write('.'))
//     .pipe(lineec())
//     .pipe(dest('dist'));
//   }

//js task
function jsTask(){
    return src(files.jsPath)
        .pipe(concat('all.js'))
        .pipe(uglify())
        .pipe(lineec())
        .pipe(dest(files.jsDest));
}

//Image minify task
function imgmin() {
    return src(files.imgPath)
    .pipe(changed(files.imgDest))
        .pipe( imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({progressive: true}),
            imagemin.optipng({optimizationLevel: 5})
          ]))
        .pipe( dest(files.imgDest));
  }

//cachebusting task
function cachebusting(){
    const cbString = new Date().getTime();
    return src( ['index.html'] )
        .pipe(replace(/cb=\d+/g, 'cb='+cbString ))
        .pipe(dest('.'));
}

//watch task
function watchTask(){
    browserSync.init({
        open: 'external',
        server: './'
        //for dynamic
        //proxy: 'http://localhost:8888',
        //port: 8080
      });
    watch( [files.scssPath, files.jsPath], parallel( sassTask, jsTask ) );
    watch( [files.scssPath, files.jsPath] ).on('change', reload);
}

//if you want to run indvisual gulp task
exports.sassTask = sassTask;
exports.jsTask = jsTask;
exports.imgmin = imgmin;
exports.cachebusting = cachebusting;
//exports.concatCSSTask = concatCSSTask;

//default task
exports.default = series(
    parallel( sassTask, jsTask, imgmin ),
    cachebusting,
    watchTask
);

