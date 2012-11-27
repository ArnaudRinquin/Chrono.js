
/*
Most simple example
*/


(function() {
  var mostSimpleExample;

  mostSimpleExample = function(containerId) {
    var chrono, container, controls, handler, tictacs;
    container = $(containerId);
    tictacs = container.find('.tictacs');
    controls = container.find('.controls');
    handler = function(ms, chrono) {
      var html;
      html = tictacs.html();
      if (ms !== 0) {
        html += ',';
      }
      html += chrono.time().s % 2 === 0 ? ' tic' : ' tac';
      return tictacs.html(html);
    };
    chrono = new Chrono;
    chrono.bind(handler);
    controls.find('.start').bind('click', function(e) {
      e.preventDefault();
      return chrono.start();
    });
    controls.find('.stop').bind('click', function(e) {
      e.preventDefault();
      return chrono.stop();
    });
    return controls.find('.reset').bind('click', function(e) {
      e.preventDefault();
      tictacs.html('');
      return chrono.reset();
    });
  };

  /*
  Call demos inits
  */


  mostSimpleExample('#mostSimple');

}).call(this);
