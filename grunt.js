module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-coffeelint');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-simple-mocha');

  grunt.initConfig({
    clean:{
      build:"lib",
      test:"test"
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
          reporter:'spec'
        }
      }
    }
  });



  grunt.registerTask('default', 'clean coffee min simplemocha');
};