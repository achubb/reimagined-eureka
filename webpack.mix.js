let mix = require('laravel-mix');

// mix.sass('src/sass/app.scss', 'dist/css')
mix.js('src/js/app.js', 'dist/js')
   .sass('src/sass/app.scss', 'dist/css')
   .browserSync({
      proxy: 'gallery.dev',
      files: ["dist/css/*.css", "dist/js/*.js"]
   });
