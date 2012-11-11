chai = require 'chai'
chai.should()
expect = chai.expect

Chrono = (require '../lib/chrono').Chrono

describe 'Chrono, long tests', ->
  describe 'Handlers', ->
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
  describe 'Time attributes', ->
    describe 'Read', ->
      it 'should be correct while ticking', (done)->
        c = new Chrono 1000, (ticks, chrono)->
          chrono.seconds.should.equal ticks
          chrono.minutes.should.equal 0
          chrono.hours.should.equal 0
          if ticks > 1
            chrono.stop()
            done()
        c.start()

      it 'should be correct after a stop', (done)->
        c = new Chrono 1000
        timeoutCallback = ->
          c.stop()
          c.seconds.should.equal 2
          c.minutes.should.equal 0
          c.hours.should.equal 0
          done()
        c.start()
        setTimeout timeoutCallback, 2010

      it 'should be correct after a default reset', (done)->
        c = new Chrono 1000, (ticks, chrono)->
          c.seconds.should.equal ticks
          if (ticks > 0)
            c.reset()
            c.seconds.should.equal 0
            done()
        c.start()