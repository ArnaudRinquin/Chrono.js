
/*
Most simple example
*/


(function() {
  var chronometer, metronome, timer;

  metronome = function(containerId) {
    var chrono, container, controls, handler, tictacs;
    container = $(containerId);
    tictacs = container.find('.tictacs');
    controls = container.find('.controls');
    metronome = container.find('.metronome');
    chrono = new Chrono;
    handler = function(ms, chrono, flag) {
      switch (flag) {
        case 'start':
          return metronome.removeClass('stopped');
        case 'stop':
          return metronome.addClass('stopped');
        case 'tick':
          return metronome.toggleClass('tick');
      }
    };
    chrono.bind(handler);
    return metronome.bind('click', function() {
      if (chrono.ticking) {
        return chrono.stop();
      } else {
        return chrono.start();
      }
    });
  };

  chronometer = function(containerId) {
    var addZero, chrono, container, m, ms, reset, s, start, stop;
    container = $(containerId);
    m = container.find('.m');
    s = container.find('.s');
    ms = container.find('.ms');
    start = container.find('.start');
    stop = container.find('.stop');
    reset = container.find('.reset');
    chrono = new Chrono({
      precision: 10
    });
    addZero = function(number) {
      if (number > 9) {
        return number;
      } else {
        return '0' + number;
      }
    };
    chrono.bind(function() {
      var time;
      time = chrono.time();
      m.html(addZero(time.m));
      s.html(addZero(time.s));
      return ms.html(addZero(parseInt(time.ms / 10)));
    });
    start.bind('click', function() {
      return chrono.start();
    });
    stop.bind('click', function() {
      return chrono.stop();
    });
    return reset.bind('click', function() {
      chrono.reset();
      m.html('00');
      s.html('00');
      return ms.html('00');
    });
  };

  timer = function(containerId) {
    var addZero, alert, chrono, container, m, ms, reset, s, start, stop;
    container = $(containerId);
    m = container.find('.m');
    s = container.find('.s');
    ms = container.find('.ms');
    start = container.find('.start');
    stop = container.find('.stop');
    reset = container.find('.reset');
    alert = container.find('.alert');
    alert.hide();
    chrono = new Chrono({
      precision: 10,
      stopTo: '3m'
    });
    addZero = function(number) {
      if (number > 9) {
        return number;
      } else {
        return '0' + number;
      }
    };
    chrono.bind(function(millis, c, flag) {
      var time;
      time = chrono.remainingTime();
      m.html(addZero(time.m));
      s.html(addZero(time.s));
      ms.html(addZero(parseInt(time.ms / 10)));
      if (flag === 'end') {
        return alert.fadeIn();
      }
    });
    start.bind('click', function() {
      return chrono.start();
    });
    stop.bind('click', function() {
      return chrono.stop();
    });
    return reset.bind('click', function() {
      alert.hide();
      chrono.reset();
      m.html('03');
      s.html('00');
      return ms.html('00');
    });
  };

  window.prettyPrint && prettyPrint();

  /*
  Call demos inits
  */


  metronome('#metronome');

  chronometer('#chronometer');

  timer('#timer');

}).call(this);
