module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-coffeelint');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.initConfig({
    clean:{
      build:"lib"
    },
    coffee:{
      compile:{
        files:{
          'lib/*.js':'src/*.coffee'
        }
      }
    },
    min:{
      dist:{
        src:'lib/chrono.js',
        dest:'lib/chrono.min.js'
      }
    }
  });



  grunt.registerTask('default', 'clean coffee min');
};