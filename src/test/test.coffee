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
      c.settings.startFrom.should.equal 0

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

    describe 'can be created with specific stopTo value', ->
      it 'as an integer (milliseconds)', ->
        c = new Chrono
          precision: 100,
          stopTo: 50
        c.settings.stopTo.should.equal 50

      it 'or as an object', ->
        c = new Chrono
          precision: 100,
          stopTo: {ms:50, s:3}
        c.settings.stopTo.should.equal 3050

      it 'or as string', ->
        c = new Chrono
          precision: 100,
          stopTo: '2min 3sec 10ms'
        c.settings.stopTo.should.equal 123010
    
    describe 'can be created with specific startFrom value', ->
      it 'as an integer (milliseconds)', ->
        c = new Chrono
          precision: 100,
          startFrom: 50
        c.settings.startFrom.should.equal 50

      it 'or as an object', ->
        c = new Chrono
          precision: 100,
          startFrom: {ms:50, s:3}
        c.settings.startFrom.should.equal 3050

      it 'or as string', ->
        c = new Chrono
          precision: 100,
          startFrom: '2min 3sec 10ms'
        c.settings.startFrom.should.equal 123010

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

  describe 'Handlers binding', ->
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
    c = new Chrono startFrom:50
    it 'start', ->
      c.should.respondTo 'start'
      c.start().ticking.should.be.true
    it 'stop', ->
      c.should.respondTo 'stop'
      c.stop().ticking.should.be.false
    
    describe 'reset', ->
      
      it 'stops the ticking', ->
        c.start().reset().ticking.should.be.false
      
      it 'and set time to settings.startFrom', ->
        c.time().t.should.equal c.settings.startFrom
      
      describe 'accepts new settings', ->
        
        it 'precision as an integer', ->
          c.reset(1010).time().t.should.equal 1010
        
        it 'or as a string', ->
          c.reset('1s10ms').time().t.should.equal 1010

    it 'start, stop, reset can be chained (returning the chrono)', ->
      c.start().stop().reset().should.equal c

  describe 'Handlers', ->
    it 'are called at t+0 with a -start- flag', (done) ->
      callDoneAndStopHandler = (time, chrono, flag) ->
        time.should.equal 0
        flag.should.equal 'start'
        chrono.unbind callDoneAndStopHandler
        chrono.stop()
        done()
      
      c = new Chrono {precision:20}, callDoneAndStopHandler
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
      c = new Chrono({precision:20}, callback, callback, callback, callback)
      c.start()

    it 'normal ticks have the -tick- flag', (done)->
      callbackCalledOnce = false
      callback = (time, chrono, flag)->
        if callbackCalledOnce
          flag.should.equal 'tick'
          chrono.unbind callback
          chrono.stop()
          done()
        callbackCalledOnce = true
        
      c = new Chrono({precision:20}, callback)
      c.start()

    it 'called with a -stop- flag when stopped', (done)->
      called = 0
      cb = (ms, chrono, flag)->
        called++
        switch called
          when 1
            c.stop()
          when 2
            flag.should.equal 'stop'
            done()
          else
            throw new Error 'Handler called after stop()'
        
      c = new Chrono({precision:100}, cb)
      c.start()

  describe 'stopTo', ->
    it 'triggers -stop- flag and stops', (done)->
      s =
        precision:10,
        stopTo: 30

      c = new Chrono s, (time, chrono, flag)->
        if time is 30
          expect(flag).to.equal 'stop'
          chrono.ticking.should.be.false
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
    describe 'remainingTime()',->
      it 'returns undefined if stopTo is undefined',->
        c = new Chrono()
        expect(c.remainingTime()).not.to.exist

      it 'returns the right time at start',->
        c = new Chrono {
          stopTo:{
            m:1,
            s:30
          }
        }
        r = c.remainingTime()
        r.m.should.equal 1
        r.s.should.equal 30

      it 'returns the right time at an point of time',->
        c = new Chrono {
          startFrom:{
            m:1,
            s:13
          },
          stopTo:{
            m:2,
            s:30
          }
        }
        r = c.remainingTime()
        r.m.should.equal 1
        r.s.should.equal 17

      it 'takes changes into account',->
        c = new Chrono {
          stopTo:{
            m:2,
            s:30
          }
        }
        r = c.remainingTime '+1h 3m -15s'
        r.h.should.equal 1
        r.m.should.equal 3
        r.s.should.equal 15

        r = c.remainingTime '*5h +15m +90s 300ms'
        r.h.should.equal 5
        r.m.should.equal 19
        r.s.should.equal 45
        r.ms.should.equal 300