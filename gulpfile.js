const gulp = require("gulp");
const sass = require("gulp-sass");
const imagemin = require("gulp-imagemin");
const autoprefixer = require("gulp-autoprefixer");
const browserSync = require("browser-sync");
const webpack = require("webpack-stream");

const paths = {
  styles: {
    src: "./src/assets/sass/**/*.scss",
    dest: "./dist/assets/css",
  },
  scripts: {
    src: "./src/assets/js/script.js",
    dest: "./dist/assets/js",
  },
  images: {
    src: "./src/assets/img/*",
    dest: "./dist/assets/img",
  },
};

gulp.task("sass", function () {
  return gulp
    .src(paths.styles.src)
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(gulp.dest(paths.styles.dest));
});

gulp.task("script", function () {
  return gulp
    .src(paths.scripts.src)
    .pipe(webpack(require("./webpack.config.js")))
    .pipe(gulp.dest(paths.scripts.dest));
});

gulp.task("compress", function () {
  return gulp
    .src(paths.images.src)
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(gulp.dest(paths.images.dest));
});

gulp.task("serve", function () {
  browserSync.init({
    server: {
      baseDir: "./dist/",
    },
  });

  gulp.watch(paths.images.src, gulp.series("compress"));
  gulp.watch(paths.styles.src, gulp.series("sass"));
  gulp.watch(paths.scripts.src, gulp.series("script"));
  gulp.watch(paths.images.dest + "/*").on("change", browserSync.reload);
  gulp.watch(paths.styles.dest + "/*.css").on("change", browserSync.reload);
  gulp.watch(paths.scripts.dest + "/*.js").on("change", browserSync.reload);
  gulp.watch("./dist/*.html").on("change", browserSync.reload);
});
