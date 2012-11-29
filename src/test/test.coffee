chai = require 'chai'
chai.should()
expect = chai.expect

ChronoJS = (require '../lib/chrono')
Chrono = ChronoJS.Chrono
Timer = ChronoJS.Timer

describe 'Chrono', ->
  describe 'Constructor', ->
    it 'is exported', ->
      expect(Chrono).to.exist

    it 'can be created with default values', ->
      c = new Chrono()
      c.should.be.ok
      c.settings.precision.should.equal 1000
      expect(c.settings.to).to.not.exist
      c.settings.keepGoing.should.be.false

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

    ### Removed from scope for now will be implemented in another way
    describe 'can be created with specific maximum value (to)', ->
      it 'as an integer (milliseconds)', ->
        c = new Chrono
          precision: 100,
          to: 50
        c.settings.to.should.equal 50

      it 'or as an object', ->
        c = new Chrono
          precision: 100,
          to: {ms:50, s:3}
        c.settings.to.should.equal 3050

      it 'or as string', ->
        c = new Chrono
          precision: 100,
          to: '2min 3sec 10ms'
        c.settings.to.should.equal 123010
    ###
    describe 'can be created with specific initial value (from)', ->
      it 'as an integer (milliseconds)', ->
        c = new Chrono
          precision: 100,
          from: 50
        c.settings.from.should.equal 50

      it 'or as an object', ->
        c = new Chrono
          precision: 100,
          from: {ms:50, s:3}
        c.settings.from.should.equal 3050

      it 'or as string', ->
        c = new Chrono
          precision: 100,
          from: '2min 3sec 10ms'
        c.settings.from.should.equal 123010

    it 'can be created with keepGoing set to true', ->
      c = new Chrono
        precision: 100,
        to: 50,
        keepGoing: true
      c.settings.keepGoing.should.be.true

    it 'allows to directly pass precision as a single setting', ->
      c = new Chrono 10000
      c.settings.precision.should.equal 10000

      c = new Chrono '15s'
      c.settings.precision.should.equal 15000

    it 'with one handler', ->
      handler = (ticks, chrono) -> this
      c = new Chrono {precision:200}, handler
      c.handlers.should.not.be.empty
      c.handlers.should.contain handler

    it 'or several handlers', ->
      handler2 = (time, chrono) -> this
      handler3 = (time, chrono) -> this
      c = new Chrono {precision:200}, handler2, handler3
      c.handlers.should.not.be.empty
      c.handlers.should.contain handler2, handler3

  describe 'Bindings', ->
    it 'can be added one by one', ->
      c = new Chrono
      handler = console.log
      c.bind handler
      c.handlers.should.contain handler

    it 'can be added several at once', ->
      c = new Chrono
      handler1 = console.log
      handler2 = console.log
      c.bind handler1, handler2
      c.handlers.should.contain handler1
      c.handlers.should.contain handler2

    it 'can be removed one by one', ->
      c = new Chrono
      handler = console.log
      c.bind handler
      c.unbind handler
      c.handlers.should.not.contain handler

    it 'can be removed several at once', ->
      c = new Chrono
      handler1 = console.log
      handler2 = console.log
      c.bind handler1, handler2
      c.unbind handler1, handler2
      c.handlers.should.not.contain handler1
      c.handlers.should.not.contain handler2

  describe 'Controls', ->
    c = new Chrono from:50
    it 'start', ->
      c.should.respondTo 'start'
      c.start().ticking.should.be.true
    it 'stop', ->
      c.should.respondTo 'stop'
      c.stop().ticking.should.be.false
    
    describe 'reset', ->
      
      it 'stops the ticking', ->
        c.start().reset().ticking.should.be.false
      
      it 'and set time to settings.from', ->
        c.time().t.should.equal c.settings.from
      
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
    it 'are called at t+0 with a -start- flag', (done) ->
      callDoneAndStopHandler = (time, chrono, flag) ->
        time.should.equal 0
        flag.should.equal 'start'
        chrono.stop()
        done()
      
      c = new Chrono {precision:100}, callDoneAndStopHandler
      c.start()

    it 'are all called', (done)->
      callbacksCalled = 0
      callback = (time, chrono, flag)->
        callbacksCalled++
        if callbacksCalled is 4
          chrono.stop()
          done()
        if time > 0
          done new Error 'not all handlers were called'
      c = new Chrono({precision:100}, callback, callback, callback, callback)
      c.start()

    it 'normal ticks have the -tick- flag', (done)->
      callbackCalledOnce = false
      callback = (time, chrono, flag)->
        if callbackCalledOnce
          flag.should.equal 'tick'
          chrono.stop()
          done()
        callbackCalledOnce = true
        
      c = new Chrono({precision:100}, callback)
      c.start()

  ### Removed from scope for now, will be implemented in another way
  describe 'to and keepGoing', ->
    it 'triggers to flag on events', (done)->
      s =
        precision:10,
        to: 30

      c = new Chrono s, (time, chrono, toReached)->
        if time is 30
          expect(toReached).to.be.true
          c.stop()
          done()
      c.start()

    it 'keep ticking if keepGoing is set true', (done)->
      s =
        precision:10,
        to: 50,
        keepGoing: true

      c = new Chrono s, (time, chrono, toReached)->
        if time is 50
          c.ticking.should.be.true
          toReached.should.be.true
        if time is 60
          c.stop()
          done()
      c.start()

    it 'stops at to if keepGoing is not specified', (done)->
      s =
        precision:10,
        to: 50

      c = new Chrono s, (time, chrono, toReached)->
        if time is 50
          c.ticking.should.be.false
          done()
      c.start()
  ###

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