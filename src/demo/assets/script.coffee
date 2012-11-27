###
Most simple example
###
metronome = (containerId)->
  container = $ containerId
  tictacs = container.find '.tictacs'
  controls = container.find '.controls'
  metronome = container.find '.metronome'

  chrono = new Chrono

  chrono.bind ()->metronome.toggleClass 'tic'

  metronome.bind 'click', ()->
    if chrono.ticking then chrono.stop()
    else chrono.start()

#Make code pretty
window.prettyPrint && prettyPrint()

###
Call demos inits
###
metronome '#metronome'