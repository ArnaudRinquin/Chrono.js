module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-coffeelint');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-macreload');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-less');

  grunt.initConfig({
    clean:{
      chrono:["lib","test"],
      demo:['demo/assets/script.js','demo/assets/style.css', 'demo/index.html']
    },
    coffeelint:{
      chrono:["src/*.coffee", "src/test/*.coffee"],
      demo:["src/demo/assets/*.coffee"]
    },
    coffee:{
      chrono:{
        files:{
          'lib/*.js':'src/*.coffee',
          'test/*.js':'src/test/*.coffee'
        }
      },
      demo:{
        files:{
          'demo/assets/*.js':'src/demo/assets/*.coffee'
        }
      }
    },
    jade:{
      demo:{
        files:{
          'demo/index.html':'src/demo/*.jade'
        }
      }
    },
    less:{
      demo:{
        files:{
          'demo/assets/style.css':'src/demo/assets/style.less'
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
      chrono:{
        src:"test/test.js",
        options:{
          reporter: 'spec',
          slow: 200,
          timeout: 1000
        }
      },
      long:{
        src:"test/long.js",
        options:{
          reporter:'spec',
          slow: 1000000000,
          timeout: 100000000
        }
      }
    },
    macreload:{
      chrome:{
        browser:'chrome',
        editor:'safari'
      }
    },
    watch:{
      files:'src/demo/*',
      tasks:['buildDemo']
    }
  });

  grunt.registerTask('build', 'clean:chrono coffeelint:chrono coffee:chrono min');
  grunt.registerTask('default', 'build simplemocha:chrono');
  grunt.registerTask('buildDemo', 'default clean:demo coffeelint:demo coffee:demo less:demo jade:demo');
  grunt.registerTask('watchDemo', 'watch buildDemo');
  grunt.registerTask('longtest', 'build simplemocha:long');

};