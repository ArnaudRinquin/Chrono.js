(function() {
  var Chrono, extend, root,
    __slice = [].slice;

  Chrono = (function() {

    function Chrono() {
      var defaults, settings, tickHandlers;
      settings = arguments[0], tickHandlers = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      this.tickHandlers = tickHandlers;
      defaults = {
        precision: 1000,
        maxTicks: void 0,
        stopAtMaxTicks: false
      };
      this.settings = extend(defaults, settings);
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
      }), this.settings.precision);
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
      if (this.settings.stopAtMaxTicks && this.__ticks === this.settings.maxTicks) {
        this.stop();
      }
      if (!Chrono.prototype.optimized) {
        elapsedSeconds = Math.floor(this.__ticks * this.settings.precision / 1000);
        this.seconds = elapsedSeconds % 60;
        this.minutes = Math.floor(elapsedSeconds / 60) % 60;
        this.hours = Math.floor(elapsedSeconds / 3600);
      }
      this.__callHandlers();
      return this;
    };

    Chrono.prototype.__callHandlers = function() {
      var h, _i, _len, _ref;
      _ref = this.tickHandlers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        h = _ref[_i];
        h(this.__ticks, this, this.__ticks === this.settings.maxTicks);
      }
      return this;
    };

    return Chrono;

  })();

  if (Object.defineProperty) {
    Chrono.prototype.optimized = true;
    Object.defineProperty(Chrono.prototype, '__date', {
      get: function() {
        return new Date(-3600000 + this.__ticks * this.settings.precision);
      },
      set: function(date) {
        this.__ticks = (3600000 + date.getTime()) / this.settings.precision;
        return date;
      }
    });
    Object.defineProperty(Chrono.prototype, 'seconds', {
      get: function() {
        return this.__date.getSeconds();
      },
      set: function(seconds) {
        this.__date = new Date(this.__date.setSeconds(seconds));
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
    Object.defineProperty(Chrono.prototype, '__dateToMax', {
      get: function() {
        var maxDate;
        maxDate = new Date(-3600000 + this.settings.maxTicks * this.settings.precision);
        return new Date(-3600000 + maxDate.getTime() - this.__date.getTime());
      }
    });
    Object.defineProperty(Chrono.prototype, 'secondsToMax', {
      get: function() {
        if (!this.settings.maxTicks) {
          return void 0;
        }
        return this.__dateToMax.getSeconds();
      }
    });
    Object.defineProperty(Chrono.prototype, 'minutesToMax', {
      get: function() {
        if (!this.settings.maxTicks) {
          return void 0;
        }
        return this.__dateToMax.getMinutes();
      }
    });
    Object.defineProperty(Chrono.prototype, 'hoursToMax', {
      get: function() {
        if (!this.settings.maxTicks) {
          return void 0;
        }
        return this.__dateToMax.getHours();
      }
    });
  }

  extend = function(object, properties) {
    var key, val;
    for (key in properties) {
      val = properties[key];
      object[key] = val;
    }
    return object;
  };

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.Chrono = Chrono;

}).call(this);
