(function() {
  var Chrono, root,
    __slice = [].slice;

  Chrono = (function() {

    function Chrono() {
      var precision, tickHandlers;
      precision = arguments[0], tickHandlers = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      this.precision = precision != null ? precision : 1000;
      this.tickHandlers = tickHandlers;
      this.reset();
    }

    Chrono.prototype.start = function() {
      var _this = this;
      if (this.__handlers) {
        return this;
      }
      this.__callHandlers();
      this.__handlers = setInterval((function(args) {
        return _this.__tick(args);
      }), this.precision);
      this.ticking = true;
      return this;
    };

    Chrono.prototype.stop = function() {
      if (this.__handlers) {
        clearInterval(this.__handlers);
      }
      this.__handlers = null;
      this.ticking = false;
      return this;
    };

    Chrono.prototype.reset = function(__ticks) {
      this.__ticks = __ticks != null ? __ticks : 0;
      this.stop();
      return this;
    };

    Chrono.prototype.__tick = function() {
      var elapsedSeconds;
      this.__ticks++;
      if (!Chrono.prototype.optimized) {
        elapsedSeconds = Math.floor(this.__ticks * precision / 1000);
        this.seconds = elapsedSeconds % 60;
        this.minutes = Math.floor(elapsedSeconds / 60) % 60;
        this.hours = Math.floor(elapsedSeconds / 3600);
      }
      this.__callHandlers();
      return this;
    };

    Chrono.prototype.__callHandlers = function() {
      var tickHandler, _i, _len, _ref;
      _ref = this.tickHandlers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        tickHandler = _ref[_i];
        tickHandler(this.__ticks, this);
      }
      return this;
    };

    return Chrono;

  })();

  if (Object.defineProperty) {
    Chrono.prototype.optimized = true;
    Object.defineProperty(Chrono.prototype, '__date', {
      get: function() {
        return new Date(this.__ticks * this.precision);
      },
      set: function(date) {
        this.__ticks = date.getTime() / this.precision;
        return date;
      }
    });
    Object.defineProperty(Chrono.prototype, 'seconds', {
      get: function() {
        return this.__date.getSeconds();
      },
      set: function(seconds) {
        var newDate;
        newDate = this.__date;
        newDate.setSeconds(seconds);
        this.__date = newDate;
        return seconds;
      }
    });
    Object.defineProperty(Chrono.prototype, 'minutes', {
      get: function() {
        return this.__date.getMinutes();
      },
      set: function(minutes) {
        var newDate;
        newDate = this.__date;
        newDate.setMinutes(minutes);
        this.__date = newDate;
        return minutes;
      }
    });
    Object.defineProperty(Chrono.prototype, 'hours', {
      get: function() {
        return this.__date.getHours();
      },
      set: function(hours) {
        var newDate;
        newDate = this.__date;
        newDate.setHours(hours);
        this.__date = newDate;
        return hours;
      }
    });
  }

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.Chrono = Chrono;

}).call(this);
