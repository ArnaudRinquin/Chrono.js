
/*
An easy chronometer. Provide start / stop / reset functions.
You may want to specificy the precision a.k.a the delay between ticks.
Passed handlers will be called at eahch tick. Current time can be read, write
or updated. All time inputs can be given as integer (milliseconds) detailed
object or human readable strings.
*/


(function() {
  var Chrono, Duration, Timer, extend, root,
    __slice = [].slice;

  Chrono = (function() {
    /*
      settings can be :
        precision : time between ticks (as a string or as an integer)
        or an object that include optionnal settings
          precision, same as above
          startFrom : the time the Chrono is initiated at start and when reset
    
      handlers are your callbacks, they also can be added through 'bind()' and
          removed with unbind. Note that they are NOT passed in an array
    */

    function Chrono() {
      var defaults, handlers, settings;
      settings = arguments[0], handlers = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      this.settings = settings != null ? settings : {};
      this.handlers = handlers;
      defaults = {
        precision: 1000,
        startFrom: 0
      };
      if (this.settings && typeof this.settings !== 'object') {
        this.settings = {
          precision: this.toMilliseconds(settings)
        };
      }
      settings = extend(defaults, settings);
      this.reset(settings);
      this;

    }

    /*
      Starts ticking, do nothing if already started
    */


    Chrono.prototype.start = function() {
      if (this.ticking) {
        return this;
      }
      this.ticking = true;
      this.__timer.start();
      this.__callHandlers('start');
      return this;
    };

    /*
      Stop will just stop ticking if already started
      Don't use it as a toggle function, no effect if already paused
    */


    Chrono.prototype.stop = function() {
      this.__timer.stop();
      this.ticking = false;
      this.__callHandlers('stop');
      return this;
    };

    /*
      Reset will stop Chrono and set the given settings
    */


    Chrono.prototype.reset = function(settings) {
      var key, value, _i, _len, _ref,
        _this = this;
      if (this.ticking) {
        this.stop();
      }
      if (settings) {
        if (typeof settings !== 'object') {
          settings = {
            startFrom: settings
          };
        }
        _ref = ['precision', 'startFrom'];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          key = _ref[_i];
          value = settings[key];
          if (value && typeof value !== 'number') {
            settings[key] = this.toMilliseconds(value);
          }
        }
        this.settings = extend(this.settings, settings);
      }
      this.__timer = new Timer(this.settings.precision, function() {
        return _this.__tick();
      });
      this.__ms = this.settings.startFrom;
      this.__time = void 0;
      return this;
    };

    /*
      Add an handler. It will be called with 3 arguments:
         time: the current Chrono time in milliseconds
         chrono: the Chrono itself
         toIsReach: is the current time later than 'to'
    */


    Chrono.prototype.bind = function() {
      var handler, handlers, _i, _len, _results;
      handlers = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _results = [];
      for (_i = 0, _len = handlers.length; _i < _len; _i++) {
        handler = handlers[_i];
        _results.push(this.handlers.push(handler));
      }
      return _results;
    };

    /*
      Remove an handler.
    */


    Chrono.prototype.unbind = function() {
      var h, handler, handlers, index, _i, _j, _len, _len1, _ref;
      handlers = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      for (_i = 0, _len = handlers.length; _i < _len; _i++) {
        handler = handlers[_i];
        _ref = this.handlers;
        for (index = _j = 0, _len1 = _ref.length; _j < _len1; index = ++_j) {
          h = _ref[index];
          if (h === handler) {
            this.handlers.splice(index, 1);
          }
        }
      }
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
      if (!(changes || !this.__time)) {
        return this.__time;
      }
      date = this.__newDate(this.__ms);
      if (changes) {
        date = this.__applyDateChanges(date, changes);
        this.__ms = date.getTime();
      }
      this.__time = this.__timeObject(date);
      return this.__time;
    };

    /*
      Convert to milliseconds (integer) a given time object or string
      obect may have ms, s, m and h property corresponding to milliseconds,
      seconds, minutes and hours.
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
      this.__time = void 0;
      this.__ms += this.settings.precision;
      this.__callHandlers('tick');
      return this;
    };

    /*
      Just call handlers with current time in ms, this chrono, to is reached flag
    */


    Chrono.prototype.__callHandlers = function(flag) {
      var h, _i, _len, _ref;
      _ref = this.handlers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        h = _ref[_i];
        h(this.__ms, this, flag);
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

    /*
      Build the current time object
    */


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

    /*
      Convert a time object to a duration in milliseconds
    */


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
      /*
          Convert string such as '1s2m 3h' to corresponding duration in ms
      */

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
      /*
          Convert string suc as '1s' or '2m' to duration in ms
      */

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

  /*
  Overwrite properties into object. Used to overwrite settings into defaults
  */


  extend = function(object, properties) {
    var key, val;
    for (key in properties) {
      val = properties[key];
      if (val !== void 0) {
        object[key] = val;
      }
    }
    return object;
  };

  /*
  Precise timer based on https://gist.github.com/1185904
  */


  Timer = (function() {

    function Timer(precision, callback) {
      this.precision = precision != null ? precision : 1000;
      this.callback = callback;
      this.started = false;
      this;

    }

    Timer.prototype.start = function() {
      if (this.__handle) {
        return this;
      }
      this.started = true;
      this.__baseline = new Date().getTime();
      this.__setTimeout();
      return this;
    };

    Timer.prototype.stop = function() {
      this.started = false;
      clearTimeout(this.__handle);
      this.__handle = void 0;
      return this;
    };

    Timer.prototype.__setTimeout = function() {
      var cb, nextTimeout, now,
        _this = this;
      now = new Date().getTime();
      nextTimeout = this.precision - now + this.__baseline;
      if (nextTimeout < 0) {
        nextTimeout = 0;
      }
      cb = function() {
        _this.__setTimeout();
        return _this.callback();
      };
      this.__handle = setTimeout(cb, nextTimeout);
      return this.__baseline += this.precision;
    };

    return Timer;

  })();

  /*
  Class covering the native Date functions I used to use. Same signatures except
  it does not have this 1 hour dif to be dealt with. Not sure about a perf boost.
  */


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

  root.Timer = Timer;

}).call(this);
