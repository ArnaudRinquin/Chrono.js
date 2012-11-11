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
      shortTests:{
        src:"test/test.js",
        options:{
          reporter: 'spec',
          slow: 200,
          timeout: 1000
        }
      },
      longTests:{
        src:"test/longTest.js",
        options:{
          reporter:'spec',
          slow: 1000000000,
          timeout: 100000000
        }
      }
    }
  });

  grunt.registerTask('build', 'clean coffeelint coffee min');
  grunt.registerTask('all', 'default simplemocha:longTests');
  grunt.registerTask('default', 'build simplemocha:shortTests');

};