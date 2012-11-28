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
        expect(c.settings.to).to.not.exist;
        return c.settings.keepGoing.should.be["false"];
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
      describe('can be created with specific maximum value (to)', function() {
        it('as an integer (milliseconds)', function() {
          var c;
          c = new Chrono({
            precision: 100,
            to: 50
          });
          return c.settings.to.should.equal(50);
        });
        it('or as an object', function() {
          var c;
          c = new Chrono({
            precision: 100,
            to: {
              ms: 50,
              s: 3
            }
          });
          return c.settings.to.should.equal(3050);
        });
        return it('or as string', function() {
          var c;
          c = new Chrono({
            precision: 100,
            to: '2min 3sec 10ms'
          });
          return c.settings.to.should.equal(123010);
        });
      });
      describe('can be created with specific initial value (from)', function() {
        it('as an integer (milliseconds)', function() {
          var c;
          c = new Chrono({
            precision: 100,
            from: 50
          });
          return c.settings.from.should.equal(50);
        });
        it('or as an object', function() {
          var c;
          c = new Chrono({
            precision: 100,
            from: {
              ms: 50,
              s: 3
            }
          });
          return c.settings.from.should.equal(3050);
        });
        return it('or as string', function() {
          var c;
          c = new Chrono({
            precision: 100,
            from: '2min 3sec 10ms'
          });
          return c.settings.from.should.equal(123010);
        });
      });
      it('can be created with keepGoing set to true', function() {
        var c;
        c = new Chrono({
          precision: 100,
          to: 50,
          keepGoing: true
        });
        return c.settings.keepGoing.should.be["true"];
      });
      it('allows to directly pass precision as a single setting', function() {
        var c;
        c = new Chrono(10000);
        c.settings.precision.should.equal(10000);
        c = new Chrono('15s');
        return c.settings.precision.should.equal(15000);
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
    describe('Bindings', function() {
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
        from: 50
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
        it('and set time to settings.from', function() {
          return c.time().t.should.equal(c.settings.from);
        });
        return describe('or to a specific time', function() {
          it('as an integer', function() {
            return c.reset(1010).time().t.should.equal(1010);
          });
          it('or as an object', function() {
            return c.reset({
              s: 1,
              ms: 10
            }).time().t.should.equal(1010);
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
      it('are called at t+0', function(done) {
        var c, callDoneAndStopHandler;
        callDoneAndStopHandler = function(time, chrono) {
          time.should.equal(0);
          chrono.stop();
          return done();
        };
        c = new Chrono({
          precision: 100
        }, callDoneAndStopHandler);
        return c.start();
      });
      return it('are all called', function(done) {
        var c, callback, callbacksCalled;
        callbacksCalled = 0;
        callback = function(time, chrono) {
          console.log('handlers:', time);
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
          precision: 100
        }, callback, callback, callback, callback);
        return c.start();
      });
    });
    describe('to and keepGoing', function() {
      it('triggers to flag on events', function(done) {
        var c, s;
        s = {
          precision: 10,
          to: 30
        };
        c = new Chrono(s, function(time, chrono, toReached) {
          if (time === 30) {
            expect(toReached).to.be["true"];
            c.stop();
            return done();
          }
        });
        return c.start();
      });
      it('keep ticking if keepGoing is set true', function(done) {
        var c, s;
        s = {
          precision: 10,
          to: 50,
          keepGoing: true
        };
        c = new Chrono(s, function(time, chrono, toReached) {
          if (time === 50) {
            c.ticking.should.be["true"];
            toReached.should.be["true"];
          }
          if (time === 60) {
            c.stop();
            return done();
          }
        });
        return c.start();
      });
      return it('stops at to if keepGoing is not specified', function(done) {
        var c, s;
        s = {
          precision: 10,
          to: 50
        };
        c = new Chrono(s, function(time, chrono, toReached) {
          if (time === 50) {
            c.ticking.should.be["false"];
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
      return describe('can change time unit values', function() {
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
    });
  });

}).call(this);
