###
An easy chronometer. Provide start / stop / reset functions.
You may want to specificy the precision a.k.a the delay between ticks.
Passed handlers will be called at eahch tick. Current time can be read, write
or updated. All time inputs can be given as integer (milliseconds) detailed
object or human readable strings.
###
class Chrono

  ###
  settings can be :
    precision : time between ticks (as a string or as an integer)
    or an object that include optionnal settings
      precision, same as above
      startFrom : the time the Chrono is initiated at start and when reset

  handlers are your callbacks, they also can be added through 'bind()' and
      removed with unbind. Note that they are NOT passed in an array

  ###
  constructor:(@settings = {}, @handlers...)->
    defaults = {
      precision: 1000,
      startFrom: 0
    }

    # Accept precision as a direct unique setting, pake it object
    if @settings and typeof @settings isnt 'object'
      @settings = precision: @toMilliseconds settings
   
    settings = extend defaults, settings # Apply defaults
    
    @reset(settings)
    
    this
  
  ###
  Starts ticking, do nothing if already started
  ###
  start:->
    return this if @ticking
    @ticking = true
    @__timer.start()
    @__callHandlers 'start'
    this

  ###
  Stop will just stop ticking if already started
  Don't use it as a toggle function, no effect if already paused
  ###
  stop:->
    @__timer.stop()
    @ticking = false
    @__callHandlers 'stop'
    this

  ###
  Reset will stop Chrono and set the given settings
  ###
  reset:(settings)->
    
    @stop() if @ticking

    # Overwrite settings if needed
    if settings

      # If sent settings isn't object, it's a new startFrom
      if typeof settings isnt 'object'
        settings = startFrom: settings

      # This loop translate time related settings to numbers if needed
      for key in ['precision', 'startFrom']
        value = settings[key]
        if value and typeof value isnt 'number'
          settings[key] = @toMilliseconds value

      @settings = extend @settings, settings
    
    # Take new settings into account
    @__timer = new Timer @settings.precision, ()=>@__tick()
    @__ms = @settings.startFrom

    this

  ###
  Add an handler. It will be called with 3 arguments:
     time: the current Chrono time in milliseconds
     chrono: the Chrono itself
     toIsReach: is the current time later than 'to'
  ###
  bind:(handlers...)->
    @handlers.push(handler) for handler in handlers

  ###
  Remove an handler.
  ###
  unbind:(handlers...)->
    for handler in handlers
      for h, index in @handlers
        @handlers.splice index, 1 if h is handler
    this


  ###
  time([changes])
    changes: (operation value unit)* concatenation
    opertation: +, -, *, / or nothing
    value: integer
    unit: ms, s, m or h
  ###
  time:(changes)->
    date = @__newDate @__ms
    if changes
      date = @__applyDateChanges date, changes
      @__ms = date.getTime()
    @__timeObject(date)

  ###
  Convert to milliseconds (integer) a given time object or string
  obect may have ms, s, m and h property corresponding to milliseconds,
  seconds, minutes and hours.
  ###
  toMilliseconds:(value)->
    millis = 0
    switch(typeof value)
      when 'number' then millis = value
      when 'string' then millis = @__stringToMilliseconds value
      when 'object' then millis = @__objectToMilliseconds value
      else throw new Error 'unknow format : ' + value
    Math.floor millis

  ###
  Compute elapsed time, minute and seconds attributes (unless optimized)
  ###
  __tick:->
    @__ms += @settings.precision
    @__callHandlers 'tick'
    this

  ###
  Just call handlers with current time in ms, this chrono, to is reached flag
  ###
  __callHandlers:(flag)->
    h @__ms, this, flag for h in @handlers
    this

  __applyDateChanges:(date, changes)->
    reg = /([+\-*\/]?)(\d+)(ms|[tsmh])\s?/g
    modifications = []
    modifications.push modif while modif = reg.exec changes
    date = @__dateSingleChange(date, modif) for modif in modifications
    date

  __dateSingleChange:(date, change)->
    [useless, operation, value, unit] = change
    value = parseInt value
    finalValue = 0

    unless operation is undefined
      switch unit
        when 'ms' then finalValue = date.getMilliseconds()
        when 's' then finalValue = date.getSeconds()
        when 'm' then finalValue = date.getMinutes()
        when 'h' then finalValue = date.getHours()

      switch operation
        when '+' then finalValue += value
        when '-' then finalValue -= value
        when '*' then finalValue *= value
        when '/' then finalValue /= value
        when '' then finalValue = value

    switch unit
      when 'ms' then date.setMilliseconds(finalValue)
      when 's' then date.setSeconds(finalValue)
      when 'm' then date.setMinutes(finalValue)
      when 'h' then date.setHours(finalValue)

    date

  ###
  Build the current time object
  ###
  __timeObject:(date)->
    time =
      ms:date.getMilliseconds(),
      s:date.getSeconds(),
      m:date.getMinutes(),
      h:date.getHours(),
      t:date.getTime()

  ###
  Returns a zero-ed Date + milliseconds
  Needed because new Date(0) time is 01:00:00 and we want it 00:00:00
  ###
  __newDate:(milliseconds)->
    new Duration milliseconds

  ###
  Convert a time object to a duration in milliseconds
  ###
  __objectToMilliseconds:(obj)->
    millis = 0
    millis += obj.ms if typeof obj.ms is 'number'
    millis += obj.s * 1000 if typeof obj.s is 'number'
    millis += obj.m * 60000 if typeof obj.m is 'number'
    millis += obj.h * 3600000 if typeof obj.h is 'number'
    millis

    ###
    Convert string such as '1s2m 3h' to corresponding duration in ms
    ###
  __stringToMilliseconds:(string)->
    reg = /(\d+)(ms|[tsmh])\s?/g
    millis = 0
    values = []
    values.push value while value = reg.exec string
    millis += @__subStringToMilliseconds value for value in values
    millis

    ###
    Convert string suc as '1s' or '2m' to duration in ms
    ###
  __subStringToMilliseconds:(value)->
    [useless, numbr, unit] = value
    numbr = parseInt numbr
    millis = 0
    switch unit
      when 'ms' then millis = numbr
      when 's' then millis = numbr * 1000
      when 'm' then millis = numbr * 60000
      when 'h' then millis = numbr * 3600000
    millis

###
Overwrite properties into object. Used to overwrite settings into defaults
###
extend = (object, properties)->
  for key, val of properties
    object[key] = val unless val is undefined
  object
  
###
Precise timer based on https://gist.github.com/1185904
###
class Timer
  constructor:(@precision = 1000, @callback)->
    @started = false
    this

  start:()->
    return this if @__handle
    @started = true
    @__baseline = new Date().getTime()
    @__setTimeout()
    this

  stop:()->
    @started = false
    clearTimeout @__handle
    @__handle = undefined
    this
    
  __setTimeout:()->
    now = new Date().getTime()
    nextTimeout = @precision - now + @__baseline
    nextTimeout = 0 if nextTimeout < 0
    
    cb = ()=>
      @__setTimeout()
      @callback()
    
    @__handle = setTimeout cb, nextTimeout
    @__baseline += @precision

###
Class covering the native Date functions I used to use. Same signatures except
it does not have this 1 hour dif to be dealt with. Not sure about a perf boost.
###
class Duration
  constructor:(@__ms = 0)->
    this

  getTime:()->
    @__ms

  getMilliseconds:()->
    @__ms % 1000

  getSeconds:()->
    Math.floor(@__ms / 1000) % 60

  getMinutes:()->
    Math.floor(@__ms / 60000) % 60

  getHours:()->
    Math.floor(@__ms / 3600000)

  setTime:(@__ms)->
    @__ms

  setMilliseconds:(milliseconds)->
    @__ms = @__ms - @getMilliseconds() + milliseconds

  setSeconds:(seconds)->
    delta = (seconds - @getSeconds()) * 1000
    @__ms = @__ms + delta

  setMinutes:(minutes)->
    delta = (minutes - @getMinutes()) * 60000
    @__ms = @__ms + delta

  setHours:(hours)->
    delta = (hours - @getHours()) * 3600000
    @__ms = @__ms + delta

# Module exportation
root = exports ? this
root.Chrono = Chrono
root.Timer = Timer
