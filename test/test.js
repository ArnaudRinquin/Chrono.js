(function() {
  var Chrono, ChronoJS, Timer, chai, expect;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  ChronoJS = require('../lib/chrono');

  Chrono = ChronoJS.Chrono;

  Timer = ChronoJS.Timer;

  describe('Chrono', function() {
    describe('Constructor', function() {
      it('is exported', function() {
        return expect(Chrono).to.exist;
      });
      it('can be created with default values', function() {
        var c;
        c = new Chrono();
        c.should.be.ok;
        c.settings.precision.should.equal(1000);
        return c.settings.startFrom.should.equal(0);
      });
      describe('can be created with specific precision', function() {
        it('as an integer (milliseconds)', function() {
          var c;
          c = new Chrono({
            precision: 100
          });
          c.should.be.ok;
          return c.settings.precision.should.equal(100);
        });
        it('or as an object', function() {
          var c;
          c = new Chrono({
            precision: {
              ms: 100,
              s: 1
            }
          });
          c.should.be.ok;
          return c.settings.precision.should.equal(1100);
        });
        return it('or as a string', function() {
          var c;
          c = new Chrono({
            precision: '1s 10ms'
          });
          c.should.be.ok;
          return c.settings.precision.should.equal(1010);
        });
      });
      describe('can be created with specific stopTo value', function() {
        it('as an integer (milliseconds)', function() {
          var c;
          c = new Chrono({
            precision: 100,
            stopTo: 50
          });
          return c.settings.stopTo.should.equal(50);
        });
        it('or as an object', function() {
          var c;
          c = new Chrono({
            precision: 100,
            stopTo: {
              ms: 50,
              s: 3
            }
          });
          return c.settings.stopTo.should.equal(3050);
        });
        return it('or as string', function() {
          var c;
          c = new Chrono({
            precision: 100,
            stopTo: '2min 3sec 10ms'
          });
          return c.settings.stopTo.should.equal(123010);
        });
      });
      describe('can be created with specific startFrom value', function() {
        it('as an integer (milliseconds)', function() {
          var c;
          c = new Chrono({
            precision: 100,
            startFrom: 50
          });
          return c.settings.startFrom.should.equal(50);
        });
        it('or as an object', function() {
          var c;
          c = new Chrono({
            precision: 100,
            startFrom: {
              ms: 50,
              s: 3
            }
          });
          return c.settings.startFrom.should.equal(3050);
        });
        return it('or as string', function() {
          var c;
          c = new Chrono({
            precision: 100,
            startFrom: '2min 3sec 10ms'
          });
          return c.settings.startFrom.should.equal(123010);
        });
      });
      it('with one handler', function() {
        var c, handler;
        handler = function(ticks, chrono) {
          return this;
        };
        c = new Chrono({
          precision: 200
        }, handler);
        c.handlers.should.not.be.empty;
        return c.handlers.should.contain(handler);
      });
      return it('or several handlers', function() {
        var c, handler2, handler3;
        handler2 = function(time, chrono) {
          return this;
        };
        handler3 = function(time, chrono) {
          return this;
        };
        c = new Chrono({
          precision: 200
        }, handler2, handler3);
        c.handlers.should.not.be.empty;
        return c.handlers.should.contain(handler2, handler3);
      });
    });
    describe('Handlers binding', function() {
      it('can be added one by one', function() {
        var c, handler;
        c = new Chrono;
        handler = console.log;
        c.bind(handler);
        return c.handlers.should.contain(handler);
      });
      it('can be added several at once', function() {
        var c, handler1, handler2;
        c = new Chrono;
        handler1 = console.log;
        handler2 = console.log;
        c.bind(handler1, handler2);
        c.handlers.should.contain(handler1);
        return c.handlers.should.contain(handler2);
      });
      it('can be removed one by one', function() {
        var c, handler;
        c = new Chrono;
        handler = console.log;
        c.bind(handler);
        c.unbind(handler);
        return c.handlers.should.not.contain(handler);
      });
      return it('can be removed several at once', function() {
        var c, handler1, handler2;
        c = new Chrono;
        handler1 = console.log;
        handler2 = console.log;
        c.bind(handler1, handler2);
        c.unbind(handler1, handler2);
        c.handlers.should.not.contain(handler1);
        return c.handlers.should.not.contain(handler2);
      });
    });
    describe('Controls', function() {
      var c;
      c = new Chrono({
        startFrom: 50
      });
      it('start', function() {
        c.should.respondTo('start');
        return c.start().ticking.should.be["true"];
      });
      it('stop', function() {
        c.should.respondTo('stop');
        return c.stop().ticking.should.be["false"];
      });
      describe('reset', function() {
        it('stops the ticking', function() {
          return c.start().reset().ticking.should.be["false"];
        });
        it('and set time to settings.startFrom', function() {
          return c.time().t.should.equal(c.settings.startFrom);
        });
        return describe('accepts new settings', function() {
          it('precision as an integer', function() {
            return c.reset(1010).time().t.should.equal(1010);
          });
          return it('or as a string', function() {
            return c.reset('1s10ms').time().t.should.equal(1010);
          });
        });
      });
      return it('start, stop, reset can be chained (returning the chrono)', function() {
        return c.start().stop().reset().should.equal(c);
      });
    });
    describe('Handlers', function() {
      it('are called at t+0 with a -start- flag', function(done) {
        var c, callDoneAndStopHandler;
        callDoneAndStopHandler = function(time, chrono, flag) {
          time.should.equal(0);
          flag.should.equal('start');
          chrono.unbind(callDoneAndStopHandler);
          chrono.stop();
          return done();
        };
        c = new Chrono({
          precision: 20
        }, callDoneAndStopHandler);
        return c.start();
      });
      it('are all called', function(done) {
        var c, callback, callbacksCalled;
        callbacksCalled = 0;
        callback = function(time, chrono, flag) {
          callbacksCalled++;
          if (callbacksCalled === 4) {
            chrono.stop();
            done();
          }
          if (time > 0) {
            return done(new Error('not all handlers were called'));
          }
        };
        c = new Chrono({
          precision: 20
        }, callback, callback, callback, callback);
        return c.start();
      });
      it('normal ticks have the -tick- flag', function(done) {
        var c, callback, callbackCalledOnce;
        callbackCalledOnce = false;
        callback = function(time, chrono, flag) {
          if (callbackCalledOnce) {
            flag.should.equal('tick');
            chrono.unbind(callback);
            chrono.stop();
            done();
          }
          return callbackCalledOnce = true;
        };
        c = new Chrono({
          precision: 20
        }, callback);
        return c.start();
      });
      return it('called with a -stop- flag when stopped', function(done) {
        var c, called, cb;
        called = 0;
        cb = function(ms, chrono, flag) {
          called++;
          switch (called) {
            case 1:
              return c.stop();
            case 2:
              flag.should.equal('stop');
              return done();
            default:
              throw new Error('Handler called after stop()');
          }
        };
        c = new Chrono({
          precision: 100
        }, cb);
        return c.start();
      });
    });
    describe('stopTo', function() {
      return it('triggers -stop- flag and stops', function(done) {
        var c, s;
        s = {
          precision: 10,
          stopTo: 30
        };
        c = new Chrono(s, function(time, chrono, flag) {
          if (time === 30) {
            expect(flag).to.equal('stop');
            chrono.ticking.should.be["false"];
            return done();
          }
        });
        return c.start();
      });
    });
    return describe('time', function() {
      describe('returns a correct time object', function() {
        it('at t+0', function() {
          var c, time;
          c = new Chrono;
          time = c.time();
          time.ms.should.equal(0);
          time.s.should.equal(0);
          time.m.should.equal(0);
          return time.h.should.equal(0);
        });
        return it('at any time', function() {
          var c, time;
          c = new Chrono;
          c.reset(3750123);
          time = c.time();
          time.ms.should.equal(123);
          time.s.should.equal(30);
          time.m.should.equal(2);
          return time.h.should.equal(1);
        });
      });
      describe('can change time unit values', function() {
        it('setting a unit', function() {
          var c, time;
          c = new Chrono;
          time = c.time('5s');
          time.s.should.equal(5);
          time.ms.should.equal(0);
          time.m.should.equal(0);
          return time.h.should.equal(0);
        });
        it('add to a unit value', function() {
          var c, time;
          c = new Chrono;
          c.reset(30);
          time = c.time('+5ms');
          return time.ms.should.equal(35);
        });
        it('substract to a unit value', function() {
          var c, time;
          c = new Chrono;
          c.reset(30000);
          time = c.time('-10s');
          return time.s.should.equal(20);
        });
        it('multiply a unit value', function() {
          var c, time;
          c = new Chrono;
          c.reset(20000);
          time = c.time('*2s');
          return time.s.should.equal(40);
        });
        it('divide a unit value', function() {
          var c, time;
          c = new Chrono;
          c.reset(20000);
          time = c.time('/4s');
          return time.s.should.equal(5);
        });
        return describe('any number of changes can be applied at once', function() {
          it('with spaces between them', function() {
            var c, time;
            c = new Chrono;
            time = c.time('43ms 15s 32m 6h');
            time.ms.should.equal(43);
            time.s.should.equal(15);
            time.m.should.equal(32);
            return time.h.should.equal(6);
          });
          it('without any space between them', function() {
            var c, time;
            c = new Chrono;
            time = c.time('1ms2s3m4h');
            time.ms.should.equal(1);
            time.s.should.equal(2);
            time.m.should.equal(3);
            return time.h.should.equal(4);
          });
          return it('even a mix of all available operations, spaced and not', function() {
            var c, time;
            c = new Chrono;
            c.reset(3750300);
            time = c.time('+100ms -3s5m *2h');
            time.ms.should.equal(400);
            time.s.should.equal(27);
            time.m.should.equal(5);
            time.h.should.equal(2);
            time = c.time('/2ms 3s *7m4h');
            time.ms.should.equal(200);
            time.s.should.equal(3);
            time.m.should.equal(35);
            return time.h.should.equal(4);
          });
        });
      });
      return describe('remainingTime()', function() {
        it('returns undefined if stopTo is undefined', function() {
          var c;
          c = new Chrono();
          return expect(c.remainingTime()).not.to.exist;
        });
        it('returns the right time at start', function() {
          var c, r;
          c = new Chrono({
            stopTo: {
              m: 1,
              s: 30
            }
          });
          r = c.remainingTime();
          r.m.should.equal(1);
          return r.s.should.equal(30);
        });
        it('returns the right time at an point of time', function() {
          var c, r;
          c = new Chrono({
            startFrom: {
              m: 1,
              s: 13
            },
            stopTo: {
              m: 2,
              s: 30
            }
          });
          r = c.remainingTime();
          r.m.should.equal(1);
          return r.s.should.equal(17);
        });
        return it('takes changes into account', function() {
          var c, r;
          c = new Chrono({
            stopTo: {
              m: 2,
              s: 30
            }
          });
          r = c.remainingTime('+1h 3m -15s');
          r.h.should.equal(1);
          r.m.should.equal(3);
          r.s.should.equal(15);
          r = c.remainingTime('*5h +15m +90s 300ms');
          r.h.should.equal(5);
          r.m.should.equal(19);
          r.s.should.equal(45);
          return r.ms.should.equal(300);
        });
      });
    });
  });

}).call(this);
