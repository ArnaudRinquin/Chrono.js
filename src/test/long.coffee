chai = require 'chai'
chai.should()
expect = chai.expect

Timer = (require '../lib/chrono').Timer

describe 'Timer', ->
  
  describe 'export and construction', ->
    it 'is exported as Timer', ->
      expect(Timer).to.exist

    it 'is constructed from precision and callback', ->
      t = new Timer 1000, ()->console.log('tick')

  describe 'precision', ->
    it 'callback is called every 20ms for 2 minutes', (done)->
      ticks = 0
      timer = new Timer 20, ()->ticks++ # tick every 20ms
      
      checkTicks = ()->
        timer.stop()
        ticks.should.equal 6000
        done()
      
      timer.start()
      setTimeout checkTicks, 120010