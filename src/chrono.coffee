###
An easy chronometer. Provide start / stop / reset functions.
You may want to specificy the precision a.k.a the delay between ticks.
Passed handlers will be called at eahch tick. Current time can be read, write
or updated. All time inputs can be given as integer (milliseconds) detailed
object or human readable strings. A maximum time can be passed to raise a flag
when reached. Default behaviour when max is reached is to stop but you can
avoid that.
###

class Chrono

  constructor:(settings = {}, @tickHandlers...)->
    defaults = {
      precision: 1000,
      max: undefined,
      continueAfterMax: false
    }

    if settings.precision
      settings.precision = @toMilliseconds settings.precision
    if settings.max
      settings.max = @toMilliseconds settings.max

    @settings = extend defaults, settings
    @reset()
  
  ###
  Starts ticking, do nothing if already started
  ###
  start:->
    return this if @__handlers #handler means it's already stared so do nothing
    @__callHandlers() #call handlers @ start
    # make use of '=>' to ensure the scope
    @__handlers = setInterval ((args)=>@__tick args), @settings.precision
    @ticking = true
    this

  ###
  Stop will just stop ticking if already started
  Don't use it as a toggle function, no effect if already paused
  ###
  stop:->
    clearInterval @__handlers if @__handlers
    @__handlers = null
    @ticking = false
    this

  ###
  Reset will pause the time and set the time to 0 or given time
  ###
  reset:(@__ms = 0)->
    @__ms = @toMilliseconds @__ms unless @__ms is 0
    @stop()
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
  obect may have ms, s, m and h property corresponding to milliseconds, seconds,
  minutes and hours.
  string is made one or several of humanly readable value-unit substrings, they
  can be separated with spaced. Example : '1ms 2s 3m 4h'. Values may be greater
  than matching unit range (90 minutes), it will just overflow.
  Also, the order of the unit doesn't matter and, even if its hardly usefull, 
  a unit can appears twice. Here is very strange valid example : 
  '1h 2s1ms 90m 3h'. It equals to 1ms, 2s, 30min and 5h.
  ###
  toMilliseconds:(value)->
    millis = 0
    switch(typeof value)
      when 'number' then millis = value
      when 'string' then millis = @__stringToMilliseconds value
      when 'object' then millis = @__objectToMilliseconds value
      else throw new Error 'unknow format : ' + value
    millis

  ###
  Compute elapsed time, minute and seconds attributes (unless optimized)
  ###
  __tick:->
    @__ms+= @settings.precision
    @stop() if (not @settings.continueAtMax) and @__ms >= @settings.max
    @__callHandlers()
    this

  __callHandlers:->
    h @__ms, this, @__ms >= @settings.max for h in @tickHandlers
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

  __timeObject:(date)->
    time =
      ms:date.getMilliseconds(),
      s:date.getSeconds(),
      m:date.getMinutes(),
      h:date.getHours(),
      t:date.getTime() + 3600000

  ###
  Returns a zero-ed Date + milliseconds
  Needed because new Date(0) time is 01:00:00 and we want it 00:00:00
  ###
  __newDate:(milliseconds)->
    new Date milliseconds - 3600000

  __objectToMilliseconds:(obj)->
    millis = 0
    millis += obj.ms if typeof obj.ms is 'number'
    millis += obj.s * 1000 if typeof obj.s is 'number'
    millis += obj.m * 60000 if typeof obj.m is 'number'
    millis += obj.h * 3600000 if typeof obj.h is 'number'
    millis

  __stringToMilliseconds:(string)->
    reg = /(\d+)(ms|[tsmh])\s?/g
    millis = 0
    values = []
    values.push value while value = reg.exec string
    millis += @__subStringToMilliseconds value for value in values
    millis

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

extend = (object, properties)->
  for key, val of properties
    object[key] = val
  object

# Module exportation
root = exports ? this
root.Chrono = Chrono