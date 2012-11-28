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

chronometer = (containerId)->
  container = $ containerId
  m = container.find '.m'
  s = container.find '.s'
  ms = container.find '.ms'
  start = container.find '.start'
  stop = container.find '.stop'
  reset = container.find '.reset'
  
  chrono = new Chrono precision:100

  addZero = (number)-> if number > 9 then number else '0' + number

  chrono.bind ()->
    time = chrono.time()
    m.html addZero(time.m)
    s.html addZero(time.s)
    ms.html addZero(parseInt(time.ms/10))

  start.bind 'click', ()-> chrono.start()
  stop.bind 'click', ()-> chrono.stop()
  reset.bind 'click', ()->
    chrono.reset()
    m.html '00'
    s.html '00'
    ms.html '00'


#Make code pretty
window.prettyPrint && prettyPrint()

###
Call demos inits
###
metronome '#metronome'
chronometer '#chronometer'