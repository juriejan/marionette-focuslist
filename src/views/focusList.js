
import animation from 'animation'
import marionette from 'marionette'

import templates from '../templates'
import utils from '../utils'

const ListView = marionette.CollectionView.extend({
  tagName: 'ul',
  childEvents: {
    focus: 'onChildFocus',
    select: 'onChildSelect'
  },
  filter: function (child) {
    return !(child.get('visible') === false)
  },
  onChildFocus: function (child) {
    if (child.$el.is(':not(.disabled)')) {
      this.$el.children().removeClass('focus')
      child.$el.addClass('focus')
    }
  },
  onChildSelect: function (child) {
    this.trigger('select', child)
  }
})

export default marionette.LayoutView.extend({
  template: templates['focusList'],
  attributes: {
    class: 'focusList'
  },
  events: {
    'keydown': 'onKeyDown'
  },
  regions: {
    list: '[region=list]'
  },
  ui: {
    scroll: '.nano',
    content: '.nano-content'
  },
  keyEvents: {
    13: 'onEnterKey',
    32: 'onSpaceKey',
    38: 'onArrowUpKey',
    40: 'onArrowDownKey'
  },
  initialize: function (options) {
    this.childView = options.childView
    this.collection = options.collection
  },
  onShow: function () {
    this.refreshScroll()
  },
  onRender: function () {
    // Create child views
    this.listView = new ListView({
      childView: this.childView,
      collection: this.collection
    })
    // Render the list view when the collection changes
    this.listenTo(this.collection, 'change', () => this.listView.render())
    // Transfer list view events to parent
    utils.transfer(this.listView, this, 'render:collection')
    utils.transfer(this.listView, this, 'select')
    // Show child views
    this.showChildView('list', this.listView)
  },
  onKeyDown: function (e) {
    var method = this.keyEvents[e.keyCode]
    if (method !== undefined) {
      this[method]()
      e.preventDefault()
    }
  },
  onArrowUpKey: function () {
    let focusedView = this.findFocusedItem()
    if (focusedView === undefined) {
      this.listView.$el.children().last().addClass('focus')
    } else {
      let items = this.listView.$el.children(':not(.disabled)')
      let index = items.index(focusedView.el)
      index = index - 1
      index = (index < 0) ? (items.length - 1) : index
      this.focusItem(items, index)
    }
  },
  onArrowDownKey: function () {
    var focusedView = this.findFocusedItem()
    if (focusedView === undefined) {
      this.listView.$el.children().first().addClass('focus')
    } else {
      var items = this.listView.$el.children(':not(.disabled)')
      var index = items.index(focusedView.el)
      index = index + 1
      index = (index > (items.length - 1)) ? 0 : index
      this.focusItem(items, index)
    }
  },
  onEnterKey: function () {
    this.itemSelect()
  },
  onSpaceKey: function () {
    this.itemSelect()
  },
  serializeData: function () {
    return {scroll: this.options.scroll}
  },
  focusItem: function (items, index) {
    var item = items.eq(index)
    items.removeClass('focus')
    item.addClass('focus')
    animation.scroll(item, this.ui.content)
  },
  itemSelect: function (e) {
    var focusedView = this.findFocusedItem()
    this.listView.$el.children().removeClass('focus')
    if (focusedView !== undefined) {
      this.trigger('select', focusedView)
    }
  },
  findFocusedItem: function () {
    return this.listView.children.find(function (child) {
      return child.$el.hasClass('focus')
    })
  },
  findByModel: function (model) {
    return this.listView.children.findByModel(model)
  },
  refreshScroll: function () {
    if (this.options.scroll) {
      this.ui.scroll.nanoScroller({alwaysVisible: true})
    }
  },
  getListWidth: function () {
    var width = null
    this.ui.content.css({position: 'relative'})
    width = this.$el.outerWidth()
    this.ui.content.css({position: 'absolute'})
    return width
  }
})
