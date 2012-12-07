(function() {
  var Timer, chai, expect;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  Timer = (require('../lib/chrono')).Timer;

  describe('Timer', function() {
    describe('export and construction', function() {
      it('is exported as Timer', function() {
        return expect(Timer).to.exist;
      });
      return it('is constructed from precision and callback', function() {
        var t;
        return t = new Timer(1000, function() {
          return console.log('tick');
        });
      });
    });
    return describe('precision', function() {
      return it('callback is called every 20ms for 2 minutes', function(done) {
        var checkTicks, ticks, timer;
        ticks = 0;
        timer = new Timer(20, function() {
          return ticks++;
        });
        checkTicks = function() {
          timer.stop();
          ticks.should.equal(6000);
          return done();
        };
        timer.start();
        return setTimeout(checkTicks, 120010);
      });
    });
  });

}).call(this);
