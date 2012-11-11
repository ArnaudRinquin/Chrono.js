# An easy chronometer. Provide start / stop / reset functions.
# You may want to specificy the precision a.k.a the delay between ticks.
# Allow tick handlers to be called. Handlers can be push or remove by
# direct manipulation of @tickHandlers attribute.
class Chrono
  constructor:(@precision = 1000, @tickHandlers...)->
    @reset()

  # Start the ticking, do nothing if already started
  start:->
    return this if @__handlers #handler means it's already stared so do nothing
    @__callHandlers() #call handlers @ start
    # make use of '=>' to ensure the scope
    @__handlers = setInterval ((args)=>@__tick args), @precision
    @ticking = true
    this

  # Stop will just stop ticking if already started
  # Don't use it as a toggle function, no effect if already paused
  stop:->
    clearInterval @__handlers if @__handlers
    @__handlers = null
    @ticking = false
    this

  # Reset will pause the time and set the time to 0 or given time (in seconds)
  reset:(@__ticks = 0)->
    @stop()
    this

  # Compute elapsed time, minute and seconds attributes (unless optimized)
  __tick:->
    @__ticks++
    unless Chrono::optimized
      elapsedSeconds = Math.floor(@__ticks * precision / 1000)
      @seconds = elapsedSeconds % 60
      @minutes = Math.floor(elapsedSeconds / 60) % 60
      @hours = Math.floor elapsedSeconds / 3600
    @__callHandlers()
    this

  __callHandlers:->
    tickHandler @__ticks, this for tickHandler in @tickHandlers
    this


if Object.defineProperty

  Chrono::optimized = true

  Object.defineProperty Chrono.prototype, '__date',
    get:-> new Date @__ticks * @precision
    set:(date)->
      @__ticks = date.getTime() / @precision
      date

  Object.defineProperty Chrono.prototype, 'seconds',
    get:-> @__date.getSeconds()
    set:(seconds)->
      newDate = @__date
      newDate.setSeconds seconds
      @__date = newDate
      seconds

  Object.defineProperty Chrono.prototype, 'minutes',
    get:-> @__date.getMinutes()
    set:(minutes)->
      newDate = @__date
      newDate.setMinutes minutes
      @__date = newDate
      minutes

  Object.defineProperty Chrono.prototype, 'hours',
    get:-> @__date.getHours()
    set:(hours)->
      newDate = @__date
      newDate.setHours hours
      @__date = newDate
      hours

# Module exportation
root = exports ? this
root.Chrono = Chrono