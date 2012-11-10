chai = require 'chai'
chai.should()
expect = chai.expect

Chrono = require '../lib/chrono'

describe 'Chrono', ->
  describe 'Creation', ->
    it 'should be exported properly', ->
      expect(Chrono).to.exist
