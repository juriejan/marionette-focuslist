/* global mocha, describe, it */

import {expect} from 'chai'

import Backbone from 'backbone'
import {FocusListView} from 'focuslist'

describe('Marionette FocusList', function () {
  it('view can be created', function () {
    var collection = new Backbone.Collection()
    var view = new FocusListView({collection})
    expect(view).to.exists
  })
})

mocha.run()
