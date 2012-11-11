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

    it 'call all of them'

  describe 'Time attributes', ->
    describe 'Read', ->
      it 'should be correct before start', ->
        c = new Chrono 100
        c.seconds.should.equal 0
        c.minutes.should.equal 0
        c.hours.should.equal 0

      it 'should be correct after a non-default reset', ->
        c = new Chrono 1000
        c.reset 60 * 60 * 2 + 34 * 60 + 56 #set to 2h34min56 seconds
        c.seconds.should.equal 56
        c.minutes.should.equal 34
        c.hours.should.equal 2

    describe 'Write', ->
      it 'can be written before start', ->
        c = new Chrono 1000, (ticks, chrono)->
          #check tick is right and stop()
          ticks.should.equal(60 * 60 * 2 + 34 * 60 + 56)
          c.stop()
        c.seconds = 56
        c.minutes = 34
        c.hours = 2
        c.start()
      it 'can be written while ticking'