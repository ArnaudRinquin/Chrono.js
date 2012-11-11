module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-coffeelint');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-simple-mocha');

  grunt.initConfig({
    clean:{
      all:["lib","test"]
    },
    coffeelint:{
      all:["src/*.coffee", "src/test/*.coffee"]
    },
    coffee:{
      compile:{
        files:{
          'lib/*.js':'src/*.coffee',
          'test/*.js':'src/test/*.coffee'
        }
      }
    },
    min:{
      dist:{
        src:'lib/chrono.js',
        dest:'lib/chrono.min.js'
      }
    },
    simplemocha:{
      all:{
        src:"test/**/*.js",
        options:{
          reporter:'spec',
          slow:'1000'
        }
      }
    }
  });

  grunt.registerTask('default', 'clean coffeelint coffee min simplemocha');

};