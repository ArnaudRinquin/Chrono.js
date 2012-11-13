chai = require 'chai'
chai.should()
expect = chai.expect

Chrono = (require '../lib/chrono').Chrono

describe 'Chrono', ->
  describe 'Constructor', ->
    it 'is exported properly', ->
      expect(Chrono).to.exist

    it 'can be created with default value', ->
      c = new Chrono()
      c.should.be.ok
      c.settings.precision.should.equal 1000
      expect(c.settings.maxTicks).to.not.exist
      c.settings.stopAtMaxTicks.should.be.false
    
    it 'can be created with specific precision', ->
      c = new Chrono {precision:100}
      c.should.be.ok
      c.settings.precision.should.equal 100
    
    it 'can be created with specific maxTicks value', ->
      c = new Chrono
        precision: 100,
        maxTicks: 50
      c.settings.maxTicks.should.equal 50

    it 'one handler can be passed', ->
      handler = (ticks, chrono) -> console.log ticks, chrono
      c = new Chrono {precision:200}, handler
      c.tickHandlers.should.not.be.empty
      c.tickHandlers.should.contain handler
    
    it 'several handlers can be passed', ->
      handler2 = (ticks, chrono) -> console.log ticks, chrono
      handler3 = (ticks, chrono) -> console.log chrono, ticks
      c = new Chrono {precision:200}, handler2, handler3
      c.tickHandlers.should.not.be.empty
      c.tickHandlers.should.contain handler2, handler3
  
  describe 'Controls', ->
    c = new Chrono()
    it 'can be started', ->
      c.should.respondTo 'start'
      c.start().ticking.should.be.true
    it 'can be stopped', ->
      c.should.respondTo 'stop'
      c.stop().ticking.should.be.false
    it 'can be reset', ->
      c.should.respondTo 'reset'
      c.reset().ticking.should.be.false
    it 'start, stop, reset can be chained (returning the chrono)', ->
      c.start().stop().reset().should.equal c
  
  describe 'Handlers', ->
    it 'should call handlers at 0 ticks', (done) ->
      callDoneAndStopHandler = (ticks, chrono) ->
        c.ticking.should.be.false
        if ticks is 0
          done()
        else
          throw new Error 'ticks is not 0'
      c = new Chrono {precision:100}, callDoneAndStopHandler
      c.start().stop()

    it 'call all of them', (done)->
      callbacksCalled = 0
      callback = (ticks, chrono)->
        callbacksCalled++
        if callbacksCalled is 4
          chrono.stop()
          done()
        if ticks > 0
          done new Error 'not all handlers were called'
      c = new Chrono({precision:100}, callback, callback, callback, callback)
      c.start().stop()

  describe 'Time attributes', ->
    describe 'Read', ->
      it 'should be correct before start', ->
        c = new Chrono {precision:100}
        c.seconds.should.equal 0
        c.minutes.should.equal 0
        c.hours.should.equal 0

      it 'should be correct after a non-default reset', ->
        c = new Chrono
        c.reset 60 * 60 * 2 + 34 * 60 + 56 #set to 2h34min56 seconds
        c.seconds.should.equal 56
        c.minutes.should.equal 34
        c.hours.should.equal 2

    describe 'Write', ->
      it 'can be written before start', ->
        c = new Chrono {precision:1000}, (ticks, chrono)->
          #check tick is right and stop()
          ticks.should.equal(60 * 60 * 2 + 34 * 60 + 56)
        c.seconds = 56
        c.minutes = 34
        c.hours = 2
        c.start().stop()
      it 'can be written while ticking', (done)->
        c = new Chrono {precision:10}, (ticks, chrono)->
          return if ticks < 2 #wait 2 ticks
          if ticks is 2
            chrono.seconds = 3
            chrono.minutes = 4
            chrono.hours = 5
            return
          ticks.should.equal 3 + 3 * 100 + 4 * 6000 + 5 * 360000
          c.stop()
          done()
        c.start()
  describe 'Max Ticks event', ->
    it 'should call handlers with maxTicks reached flag', (done)->
      s =
        precision:10,
        maxTicks: 3

      c = new Chrono s, (ticks, chrono, maxTicksReached)->
        if ticks is 3
          expect(maxTicksReached).to.be.true
          c.stop()
          done()
      c.start()
  describe 'stopAtMaxTicks', ->
    it 'by default should not stop when maxTicks is reached', (done)->
      s =
        precision:10,
        maxTicks: 5

      c = new Chrono s, (ticks, chrono, maxTicksReached)->
        if ticks is 6
          c.stop()
          done()
      c.start()
    it 'it should stop when maxTicks is reached if specified', (done)->
      s =
        precision:10,
        maxTicks: 5,
        stopAtMaxTicks: true

      c = new Chrono s, (ticks, chrono, maxTicksReached)->
        if ticks is 5
          c.ticking.should.be.false
          c.stop()
          done()
      c.start()

  describe 'toMax Time Attributes', ->
    it 'are undefined when maxTicks is undefined', ->
      c = new Chrono
      expect(c.secondsToMax).to.not.exist
      expect(c.minutesToMax).to.not.exist
      expect(c.hoursToMax).to.not.exist

    it 'are be right when maxTicks is set, while ticking', ->
      s =
        precision:1000,
        maxTicks:7200 + 1200 + 40 #2h20min40sec
      c = new Chrono s
      c.reset(3600 + 720 + 10) #1h12min10sec
      c.secondsToMax.should.equal 30
      c.minutesToMax.should.equal 8
      c.hoursToMax.should.equal 1
