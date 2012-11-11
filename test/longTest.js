(function() {
  var Chrono, chai, expect;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  Chrono = (require('../lib/chrono')).Chrono;

  describe('Chrono, long tests', function() {
    describe('Handlers', function() {
      it('should call them afterward with right values', function(done) {
        var c, callDone, setErrTimeout, ticksAlready, timeoutHandle;
        ticksAlready = 0;
        timeoutHandle = 0;
        setErrTimeout = function() {
          return setTimeout((function() {
            throw new Error('handler not called soon enough');
          }), 110);
        };
        callDone = function(ticks, chrono) {
          if (timeoutHandle) {
            clearTimeout(timeoutHandle);
          }
          timeoutHandle = setErrTimeout();
          if (ticks !== ticksAlready++) {
            done(new Error('ticks are not incremented correcly'));
          }
          if (chrono !== c) {
            done(new Error('chrono is not passed as expected'));
          }
          if (ticks === 2) {
            c.stop();
            if (timeoutHandle) {
              clearTimeout(timeoutHandle);
            }
            return done();
          }
        };
        c = new Chrono(100, callDone);
        timeoutHandle = setErrTimeout();
        return c.start();
      });
      return it('stop calling them after being stopped', function(done) {
        var c, callDone, ticksAlready;
        ticksAlready = -1;
        callDone = function(ticks, chrono) {
          var checkChrono;
          ticksAlready++;
          if (ticks === 2) {
            c.stop();
            checkChrono = function() {
              c.ticking.should.be["false"];
              ticksAlready.should.equal(2);
              return done();
            };
            setTimeout(checkChrono, 200);
          }
          if (ticks > 2) {
            return done(new Error('handler has been called after chrono has been stopped'));
          }
        };
        c = new Chrono(100, callDone);
        return c.start();
      });
    });
    return describe('Time attributes', function() {
      return describe('Read', function() {
        it('should be correct while ticking', function(done) {
          var c;
          c = new Chrono(1000, function(ticks, chrono) {
            chrono.seconds.should.equal(ticks);
            chrono.minutes.should.equal(0);
            chrono.hours.should.equal(0);
            if (ticks > 1) {
              chrono.stop();
              return done();
            }
          });
          return c.start();
        });
        return it('should be correct after a stop', function(done) {
          var c, timeoutCallback;
          c = new Chrono(1000);
          timeoutCallback = function() {
            c.stop();
            c.seconds.should.equal(2);
            c.minutes.should.equal(0);
            c.hours.should.equal(0);
            return done();
          };
          c.start();
          return setTimeout(timeoutCallback, 2010);
        });
      });
    });
  });

}).call(this);
