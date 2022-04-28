const gulp = require("gulp"),
  sass = require("gulp-sass")(require("sass")),
  browsersync = require("browser-sync").create(),
  del = require("del"),
  autoprefixer = require("gulp-autoprefixer"),
  csso = require("gulp-csso"),
  pug = require("gulp-pug"),
  data = require("gulp-data"),
  htmlmin = require("gulp-htmlmin"),
  uglify = require("gulp-uglify"),
  concat = require("gulp-concat"),
  pump = require("pump");

const path = {
  build: "./build",
  dataJson: "./src/data.json",
  css: {
    source: "./src/styles/main.+(scss|sass)",
    dest: "./build/styles/",
    watchSource: "./src/styles/**/*.scss",
  },
  html: {
    indexSource: "./src/pages/*.pug",
    dest: "./build/pages/",
    watchSource: "./src/pages/**/*.pug",
  },
  scripts: {
    source: "./src/js/**/*",
    dest: "./build/js/",
    watchSource: "./src/js/**/*.js",
  },
  images: {
    source: "./src/img/**/*",
    dest: "./build/img/",
  },
  fonts: {
    source: "./src/fonts/**/*",
    dest: "./build/fonts/",
  },
};

// Clean
gulp.task("clean", (done) => {
  del.sync(path.build);
  done();
});

// Css
gulp.task("css", (done) => {
  gulp
    .src(path.css.source)
    .pipe(sass().on("error", sass.logError))
    .pipe(
      autoprefixer(["last 5 versions", "> 1%", "ie 8", "ie 7"], {
        cascade: true,
      })
    )
    .pipe(csso())
    .pipe(gulp.dest(path.css.dest))
    .pipe(browsersync.stream());
  done();
});

// De-caching for Data files
function requireUncached($module) {
  delete require.cache[require.resolve($module)];
  return require($module);
}

// Html
gulp.task("html", (done) => {
  gulp
    .src(path.html.indexSource)
    .pipe(pug())
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest(path.build))
    .pipe(browsersync.stream());
  done();
});

// Scripts
gulp.task("scripts", (cb) => {
  pump(
    [
      gulp.src(path.scripts.source),
      concat("script.js"),
      uglify(),
      gulp.dest(path.scripts.dest),
    ],
    cb
  );
});

// Images
gulp.task("img", (done) => {
  gulp.src(path.images.source).pipe(gulp.dest(path.images.dest));
  done();
});

//Fonts
gulp.task("fonts", (done) => {
  gulp.src(path.fonts.source).pipe(gulp.dest(path.fonts.dest));
  done();
});

// BrowserSync
function reload(done) {
  browsersync.reload();
  done();
}

gulp.task("browser-sync", (done) => {
  browsersync.init({
    server: {
      baseDir: path.build,
    },
    notify: false,
  });
  done();
});

// Watch files
gulp.task("watch", (done) => {
  gulp.watch(path.css.watchSource, gulp.series("css", reload));
  gulp.watch(path.html.watchSource, gulp.series("html", reload));
  gulp.watch(path.dataJson, gulp.series("html", reload));
  gulp.watch(path.scripts.watchSource, gulp.series("scripts", reload));
  done();
});

gulp.task(
  "default",
  gulp.parallel(
    "clean",
    "css",
    "html",
    "scripts",
    "fonts",
    "img",
    "browser-sync",
    "watch"
  )
);
