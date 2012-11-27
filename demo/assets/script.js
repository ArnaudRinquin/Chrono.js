
/*
Most simple example
*/


(function() {
  var metronome;

  metronome = function(containerId) {
    var chrono, container, controls, tictacs;
    container = $(containerId);
    tictacs = container.find('.tictacs');
    controls = container.find('.controls');
    metronome = container.find('.metronome');
    chrono = new Chrono;
    chrono.bind(function() {
      return metronome.toggleClass('tic');
    });
    return metronome.bind('click', function() {
      if (chrono.ticking) {
        return chrono.stop();
      } else {
        return chrono.start();
      }
    });
  };

  window.prettyPrint && prettyPrint();

  /*
  Call demos inits
  */


  metronome('#metronome');

}).call(this);
