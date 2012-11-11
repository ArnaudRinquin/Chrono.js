chai = require 'chai'
chai.should()
expect = chai.expect

Chrono = (require '../lib/chrono').Chrono

describe 'Chrono', ->
  describe 'Creation', ->
    it 'should be exported properly', ->
      expect(Chrono).to.exist
    it 'can be created with default value', ->
      c = new Chrono()
      c.should.be.ok
      c.precision.should.equal 1000
    it 'can also be created with custom precision', ->
      c = new Chrono 100
      c.should.be.ok
      c.precision.should.equal 100
    it 'one handler can be passed', ->
      handler = (ticks, chrono) -> console.log ticks, chrono
      c = new Chrono 200, handler
      c.tickHandlers.should.not.be.empty
      c.tickHandlers.should.contain handler
    it 'several handlers can be passed', ->
      handler2 = (ticks, chrono) -> console.log ticks, chrono
      handler3 = (ticks, chrono) -> console.log chrono, ticks
      c = new Chrono 200, handler2, handler3
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
      c = new Chrono 100, callDoneAndStopHandler
      c.start().stop()

    it 'should call them afterward with right values', (done)->
      ticksAlready = 0
      timeoutHandle = 0
      setErrTimeout = ->
        setTimeout (-> throw new Error 'handler not called soon enough'), 110
          
      callDone = (ticks, chrono) ->
        clearTimeout(timeoutHandle) if timeoutHandle
        timeoutHandle = setErrTimeout()
        if ticks isnt ticksAlready++
          done new Error 'ticks are not incremented correcly'
        if chrono isnt c
          done new Error 'chrono is not passed as expected'
        if ticks is 2
          c.stop()
          clearTimeout(timeoutHandle) if timeoutHandle
          done()
      c = new Chrono 100, callDone

      timeoutHandle = setErrTimeout()
      c.start()

    it 'stop calling them after being stopped', (done)->
      ticksAlready = -1 #start at -1 as the first tick is 0
      callDone = (ticks, chrono) ->
        ticksAlready++
        if ticks is 2
          c.stop()
          checkChrono = ->
            c.ticking.should.be.false
            ticksAlready.should.equal 2
            done()
          setTimeout checkChrono , 200
        if ticks > 2
          done new Error 'handler has been called after chrono has been stopped'
      c = new Chrono 100, callDone
      c.start()

    it 'call all of them'
  describe 'Time attributes', ->
    describe 'Read', ->
      it 'should be correct before start', ->
        c = new Chrono 100
        c.seconds.should.equal 0
        c.minutes.should.equal 0
        c.hours.should.equal 0
      it 'should be correct while ticking'
      it 'should be correct after a stop'
      it 'should be correct after a default reset'
      it 'should be correct after a non-default reset'
    describe 'Write', ->
      it 'can be written before start'
      it 'can be written while ticking'