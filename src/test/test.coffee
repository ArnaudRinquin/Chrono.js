chai = require 'chai'
chai.should()
expect = chai.expect

Chrono = (require '../lib/chrono').Chrono

describe 'Chrono', ->
  describe 'Creation', ->
    it 'should be exported properly', ->
      expect(Chrono).to.exist
    it 'can be created with default value', ->
      c1 = new Chrono()
      c1.should.be.ok
      c1.precision.should.equal 1000
    it 'can also be created with custom precision', ->
      c2 = new Chrono 100
      c2.should.be.ok
      c2.precision.should.equal 100
    it 'one handler can be passed', ->
      handler = (ticks, chrono) -> console.log ticks, chrono
      c3 = new Chrono 200, handler
      c3.tickHandlers.should.not.be.empty
      c3.tickHandlers.should.contain handler
    it 'several handlers can be passed', ->
      handler2 = (ticks, chrono) -> console.log ticks, chrono
      handler3 = (ticks, chrono) -> console.log chrono, ticks
      c4 = new Chrono 200, handler2, handler3
      c4.tickHandlers.should.not.be.empty
      c4.tickHandlers.should.contain handler2, handler3
  describe 'Controls', ->
    ct1 = new Chrono()
    it 'can be started', ->
      ct1.should.respondTo 'start'
      ct1.start()
      ct1.ticking.should.be.true
    it 'can be stopped', ->
      ct1.should.respondTo 'stop'
      ct1.stop()
      ct1.ticking.should.be.false
    it 'can be reset', ->
      ct1.should.respondTo 'reset'
      ct1.reset()
      ct1.ticking.should.be.false
    it 'start, stop, reset can be chained', ->
      ct1.start().stop().reset().should.equal ct1
  describe 'Handlers', ->
    it 'should call handlers', (done, err) ->
      callDoneAndStopHandler = (ticks, chrono) -> done(); h1.stop()
      h1 = new Chrono 100, callDoneAndStopHandler
      h1.start()
    it 'stop calling them after being stopped'
    it 'call all of them'