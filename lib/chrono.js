
/*
An easy chronometer. Provide start / stop / reset functions.
You may want to specificy the precision a.k.a the delay between ticks.
Passed handlers will be called at eahch tick. Current time can be read, write
or updated. All time inputs can be given as integer (milliseconds) detailed
object or human readable strings. A toimum time can be passed to raise a flag
when reached. Default behaviour when to is reached is to stop but you can
avoid that.
*/


(function() {
  var Chrono, Duration, extend, root,
    __slice = [].slice;

  Chrono = (function() {

    function Chrono() {
      var defaults, settings, tickHandlers, typeofSettings;
      settings = arguments[0], tickHandlers = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (settings == null) {
        settings = {};
      }
      this.tickHandlers = tickHandlers;
      typeofSettings = typeof settings;
      if (typeofSettings === 'number' || typeofSettings === 'string') {
        settings = {
          precision: this.toMilliseconds(settings)
        };
      }
      defaults = {
        precision: 1000,
        from: 0,
        to: void 0,
        keepGoing: false
      };
      if (settings.precision) {
        settings.precision = this.toMilliseconds(settings.precision);
      }
      if (settings.from) {
        settings.from = this.toMilliseconds(settings.from);
      }
      if (settings.to) {
        settings.to = this.toMilliseconds(settings.to);
      }
      this.settings = extend(defaults, settings);
      this.reset();
    }

    /*
      Starts ticking, do nothing if already started
    */


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

    /*
      Stop will just stop ticking if already started
      Don't use it as a toggle function, no effect if already paused
    */


    Chrono.prototype.stop = function() {
      if (this.__handlers) {
        clearInterval(this.__handlers);
      }
      this.__handlers = null;
      this.ticking = false;
      return this;
    };

    /*
      Reset will pause the time and set the time to 0 or given time
    */


    Chrono.prototype.reset = function(__ms) {
      this.__ms = __ms != null ? __ms : this.settings.from;
      this.__ms = this.toMilliseconds(this.__ms);
      this.stop();
      return this;
    };

    /*
      time([changes])
        changes: (operation value unit)* concatenation
        opertation: +, -, *, / or nothing
        value: integer
        unit: ms, s, m or h
    */


    Chrono.prototype.time = function(changes) {
      var date;
      date = this.__newDate(this.__ms);
      if (changes) {
        date = this.__applyDateChanges(date, changes);
        this.__ms = date.getTime();
      }
      return this.__timeObject(date);
    };

    /*
      Convert to milliseconds (integer) a given time object or string
      obect may have ms, s, m and h property corresponding to milliseconds,
      seconds, minutes and hours.
      string is made one or several of humanly readable value-unit substrings.
      They can be separated with spaced. Example : '1ms 2s 3m 4h'.
      Values may be greater than matching unit range (90 minutes), it will just
      overflow.
      Also, the order of the unit doesn't matter and, even if its hardly usefull,
      a unit can appears twice. Here is very strange valid example :
      '1h 2s1ms 90m 3h'. It equals to 1ms, 2s, 30min and 5h.
    */


    Chrono.prototype.toMilliseconds = function(value) {
      var millis;
      millis = 0;
      switch (typeof value) {
        case 'number':
          millis = value;
          break;
        case 'string':
          millis = this.__stringToMilliseconds(value);
          break;
        case 'object':
          millis = this.__objectToMilliseconds(value);
          break;
        default:
          throw new Error('unknow format : ' + value);
      }
      return Math.floor(millis);
    };

    /*
      Compute elapsed time, minute and seconds attributes (unless optimized)
    */


    Chrono.prototype.__tick = function() {
      this.__ms += this.settings.precision;
      if ((!this.settings.keepGoing) && this.__ms >= this.settings.to) {
        this.stop();
      }
      this.__callHandlers();
      return this;
    };

    Chrono.prototype.__callHandlers = function() {
      var h, _i, _len, _ref;
      _ref = this.tickHandlers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        h = _ref[_i];
        h(this.__ms, this, this.__ms >= this.settings.to);
      }
      return this;
    };

    Chrono.prototype.__applyDateChanges = function(date, changes) {
      var modif, modifications, reg, _i, _len;
      reg = /([+\-*\/]?)(\d+)(ms|[tsmh])\s?/g;
      modifications = [];
      while (modif = reg.exec(changes)) {
        modifications.push(modif);
      }
      for (_i = 0, _len = modifications.length; _i < _len; _i++) {
        modif = modifications[_i];
        date = this.__dateSingleChange(date, modif);
      }
      return date;
    };

    Chrono.prototype.__dateSingleChange = function(date, change) {
      var finalValue, operation, unit, useless, value;
      useless = change[0], operation = change[1], value = change[2], unit = change[3];
      value = parseInt(value);
      finalValue = 0;
      if (operation !== void 0) {
        switch (unit) {
          case 'ms':
            finalValue = date.getMilliseconds();
            break;
          case 's':
            finalValue = date.getSeconds();
            break;
          case 'm':
            finalValue = date.getMinutes();
            break;
          case 'h':
            finalValue = date.getHours();
        }
        switch (operation) {
          case '+':
            finalValue += value;
            break;
          case '-':
            finalValue -= value;
            break;
          case '*':
            finalValue *= value;
            break;
          case '/':
            finalValue /= value;
            break;
          case '':
            finalValue = value;
        }
      }
      switch (unit) {
        case 'ms':
          date.setMilliseconds(finalValue);
          break;
        case 's':
          date.setSeconds(finalValue);
          break;
        case 'm':
          date.setMinutes(finalValue);
          break;
        case 'h':
          date.setHours(finalValue);
      }
      return date;
    };

    Chrono.prototype.__timeObject = function(date) {
      var time;
      return time = {
        ms: date.getMilliseconds(),
        s: date.getSeconds(),
        m: date.getMinutes(),
        h: date.getHours(),
        t: date.getTime()
      };
    };

    /*
      Returns a zero-ed Date + milliseconds
      Needed because new Date(0) time is 01:00:00 and we want it 00:00:00
    */


    Chrono.prototype.__newDate = function(milliseconds) {
      return new Duration(milliseconds);
    };

    Chrono.prototype.__objectToMilliseconds = function(obj) {
      var millis;
      millis = 0;
      if (typeof obj.ms === 'number') {
        millis += obj.ms;
      }
      if (typeof obj.s === 'number') {
        millis += obj.s * 1000;
      }
      if (typeof obj.m === 'number') {
        millis += obj.m * 60000;
      }
      if (typeof obj.h === 'number') {
        millis += obj.h * 3600000;
      }
      return millis;
    };

    Chrono.prototype.__stringToMilliseconds = function(string) {
      var millis, reg, value, values, _i, _len;
      reg = /(\d+)(ms|[tsmh])\s?/g;
      millis = 0;
      values = [];
      while (value = reg.exec(string)) {
        values.push(value);
      }
      for (_i = 0, _len = values.length; _i < _len; _i++) {
        value = values[_i];
        millis += this.__subStringToMilliseconds(value);
      }
      return millis;
    };

    Chrono.prototype.__subStringToMilliseconds = function(value) {
      var millis, numbr, unit, useless;
      useless = value[0], numbr = value[1], unit = value[2];
      numbr = parseInt(numbr);
      millis = 0;
      switch (unit) {
        case 'ms':
          millis = numbr;
          break;
        case 's':
          millis = numbr * 1000;
          break;
        case 'm':
          millis = numbr * 60000;
          break;
        case 'h':
          millis = numbr * 3600000;
      }
      return millis;
    };

    return Chrono;

  })();

  extend = function(object, properties) {
    var key, val;
    for (key in properties) {
      val = properties[key];
      object[key] = val;
    }
    return object;
  };

  Duration = (function() {

    function Duration(__ms) {
      this.__ms = __ms != null ? __ms : 0;
      this;

    }

    Duration.prototype.getTime = function() {
      return this.__ms;
    };

    Duration.prototype.getMilliseconds = function() {
      return this.__ms % 1000;
    };

    Duration.prototype.getSeconds = function() {
      return Math.floor(this.__ms / 1000) % 60;
    };

    Duration.prototype.getMinutes = function() {
      return Math.floor(this.__ms / 60000) % 60;
    };

    Duration.prototype.getHours = function() {
      return Math.floor(this.__ms / 3600000);
    };

    Duration.prototype.setTime = function(__ms) {
      this.__ms = __ms;
      return this.__ms;
    };

    Duration.prototype.setMilliseconds = function(milliseconds) {
      return this.__ms = this.__ms - this.getMilliseconds() + milliseconds;
    };

    Duration.prototype.setSeconds = function(seconds) {
      var delta;
      delta = (seconds - this.getSeconds()) * 1000;
      return this.__ms = this.__ms + delta;
    };

    Duration.prototype.setMinutes = function(minutes) {
      var delta;
      delta = (minutes - this.getMinutes()) * 60000;
      return this.__ms = this.__ms + delta;
    };

    Duration.prototype.setHours = function(hours) {
      var delta;
      delta = (hours - this.getHours()) * 3600000;
      return this.__ms = this.__ms + delta;
    };

    return Duration;

  })();

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.Chrono = Chrono;

}).call(this);
