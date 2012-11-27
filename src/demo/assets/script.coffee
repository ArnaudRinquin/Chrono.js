###
Most simple example
###
mostSimpleExample = (containerId)->
  container = $ containerId
  tictacs = container.find '.tictacs'
  controls = container.find '.controls'

  handler = (ms, chrono)->
    html = tictacs.html()
    html += ',' unless ms is 0
    html += if chrono.time().s % 2 is 0 then ' tic' else ' tac'
    tictacs.html html

  chrono = new Chrono

  chrono.bind handler

  controls.find('.start').bind 'click', (e)->
    e.preventDefault()
    chrono.start()

  controls.find('.stop').bind 'click', (e)->
    e.preventDefault()
    chrono.stop()

  controls.find('.reset').bind 'click', (e)->
    e.preventDefault()
    tictacs.html ''
    chrono.reset()


###
Call demos inits
###
mostSimpleExample '#mostSimple'