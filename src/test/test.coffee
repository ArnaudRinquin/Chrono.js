chai = require 'chai'
chai.should()
expect = chai.expect

Chrono = (require '../lib/chrono').Chrono

describe 'Chrono', ->
  describe 'Constructor', ->
    it 'is exported', ->
      expect(Chrono).to.exist

    it 'can be created with default values', ->
      c = new Chrono()
      c.should.be.ok
      c.settings.precision.should.equal 1000
      expect(c.settings.max).to.not.exist
      c.settings.continueAtMax.should.be.false

    describe 'can be created with specific precision', ->
      it 'as an integer (milliseconds)', ->
        c = new Chrono {precision:100}
        c.should.be.ok
        c.settings.precision.should.equal 100

      it 'or as an object', ->
        c = new Chrono {precision:{ms:100, s:1}}
        c.should.be.ok
        c.settings.precision.should.equal 1100

      it 'or as a string', ->
        c = new Chrono {precision:'1s 10ms'}
        c.should.be.ok
        c.settings.precision.should.equal 1010

    describe 'can be created with specific max value', ->
      it 'as an integer (milliseconds)', ->
        c = new Chrono
          precision: 100,
          max: 50
        c.settings.max.should.equal 50

      it 'or as an object', ->
        c = new Chrono
          precision: 100,
          max: {ms:50, s:3}
        c.settings.max.should.equal 3050

      it 'or as string', ->
        c = new Chrono
          precision: 100,
          max: '2min 3sec 10ms'
        c.settings.max.should.equal 123010

    it 'can be created with continueAtMax set to true', ->
      c = new Chrono
        precision: 100,
        max: 50,
        continueAtMax: true
      c.settings.continueAtMax.should.be.true

    it 'with one handler', ->
      handler = (ticks, chrono) -> this
      c = new Chrono {precision:200}, handler
      c.tickHandlers.should.not.be.empty
      c.tickHandlers.should.contain handler

    it 'or several handlers', ->
      handler2 = (time, chrono) -> this
      handler3 = (time, chrono) -> this
      c = new Chrono {precision:200}, handler2, handler3
      c.tickHandlers.should.not.be.empty
      c.tickHandlers.should.contain handler2, handler3

  describe 'Controls', ->
    c = new Chrono()
    it 'start', ->
      c.should.respondTo 'start'
      c.start().ticking.should.be.true
    it 'stop', ->
      c.should.respondTo 'stop'
      c.stop().ticking.should.be.false
    
    describe 'reset', ->
      
      it 'stops the ticking', ->
        c.start().reset().ticking.should.be.false
      
      it 'and set time to t-0', ->
        c.time().t.should.equal 0
      
      describe 'or to a specific time', ->
        
        it 'as an integer', ->
          c.reset(1010).time().t.should.equal 1010
        
        it 'or as an object', ->
          c.reset({s:1, ms:10}).time().t.should.equal 1010
        
        it 'or as a string', ->
          c.reset('1s10ms').time().t.should.equal 1010

    it 'start, stop, reset can be chained (returning the chrono)', ->
      c.start().stop().reset().should.equal c
  
  describe 'Handlers', ->
    it 'are called at t+0', (done) ->
      callDoneAndStopHandler = (time, chrono) ->
        c.ticking.should.be.false
        if time is 0
          done()
        else
          throw new Error 'time is not 0'
      
      c = new Chrono {precision:100}, callDoneAndStopHandler
      c.start().stop()

    it 'are all called', (done)->
      callbacksCalled = 0
      callback = (time, chrono)->
        callbacksCalled++
        if callbacksCalled is 4
          chrono.stop()
          done()
        if time > 0
          done new Error 'not all handlers were called'
      c = new Chrono({precision:100}, callback, callback, callback, callback)
      c.start().stop()

  describe 'max and stopAtMax', ->
    it 'triggers max flag on events', (done)->
      s =
        precision:10,
        max: 30

      c = new Chrono s, (time, chrono, maxReached)->
        if time is 30
          expect(maxReached).to.be.true
          c.stop()
          done()
      c.start()

    it 'stop when max is reached if stopAtMax is set true', (done)->
      s =
        precision:10,
        max: 50,
        continueAtMax: true

      c = new Chrono s, (time, chrono, maxReached)->
        if time is 50
          c.ticking.should.be.true
          maxReached.should.be.true
        if time is 60
          c.stop()
          done()
      c.start()

    it 'stops at max if continueAtMax is not specified', (done)->
      s =
        precision:10,
        max: 50

      c = new Chrono s, (time, chrono, maxReached)->
        if time is 50
          c.ticking.should.be.false
          done()
      c.start()

  describe 'time', ->
    describe 'returns a correct time object', ->
      it 'at t+0', ->
        c = new Chrono
        time = c.time()

        time.ms.should.equal 0
        time.s.should.equal 0
        time.m.should.equal 0
        time.h.should.equal 0
      
      it 'at any time', ->
        c = new Chrono
        c.reset 3750123 #1h2m30s
        time = c.time()
        
        time.ms.should.equal 123
        time.s.should.equal 30
        time.m.should.equal 2
        time.h.should.equal 1
    describe 'can change time unit values', ->
      it 'setting a unit', ->
        c = new Chrono
        
        time = c.time '5s'

        time.s.should.equal 5
        time.ms.should.equal 0
        time.m.should.equal 0
        time.h.should.equal 0

      it 'add to a unit value', ->
        c = new Chrono

        c.reset 30
        time = c.time '+5ms'

        time.ms.should.equal 35

      it 'substract to a unit value', ->
        c = new Chrono

        c.reset 30000
        time = c.time '-10s'

        time.s.should.equal 20

      it 'multiply a unit value', ->
        c = new Chrono

        c.reset 20000
        time = c.time '*2s'

        time.s.should.equal 40

      it 'divide a unit value', ->
        c = new Chrono

        c.reset 20000
        time = c.time '/4s'

        time.s.should.equal 5

      describe 'any number of changes can be applied at once', ->
        it 'with spaces between them', ->
          c = new Chrono
          time = c.time '43ms 15s 32m 6h'

          time.ms.should.equal 43
          time.s.should.equal 15
          time.m.should.equal 32
          time.h.should.equal 6
        
        it 'without any space between them', ->
          c = new Chrono
          time = c.time '1ms2s3m4h'

          time.ms.should.equal 1
          time.s.should.equal 2
          time.m.should.equal 3
          time.h.should.equal 4

        it 'even a mix of all available operations, spaced and not', ->
          c = new Chrono
          c.reset 3750300 #1h2m30s
          time = c.time '+100ms -3s5m *2h'

          time.ms.should.equal 400
          time.s.should.equal 27
          time.m.should.equal 5
          time.h.should.equal 2

          time = c.time '/2ms 3s *7m4h'

          time.ms.should.equal 200
          time.s.should.equal 3
          time.m.should.equal 35
          time.h.should.equal 4