
import _ from 'lodash'

import animation from 'animation'
import marionette from 'marionette'

import templates from '../templates'

const ListView = marionette.CollectionView.extend({
  tagName: 'ul',
  childEvents: {
    focus: 'onChildFocus',
    select: 'onChildSelect'
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
    13: 'itemSelect',
    32: 'itemSelect',
    38: 'onArrowUpKey',
    40: 'onArrowDownKey'
  },
  initialize: function (options) {
    this.maxSize = options.maxSize
    this.childView = options.childView
    this.collection = options.collection
  },
  onShow: function () {
    this.refreshScroll()
  },
  onAttach: function () {
    this.resetHeight()
  },
  onRender: function () {
    this.listView = new ListView({
      childView: this.childView,
      collection: this.collection
    })
    this.listenTo(this.listView, 'select', (child) => {
      this.trigger('select', child)
    })
    this.showChildView('list', this.listView)
    this.resetHeight()
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
  focusItem: function (items, index) {
    var item = items.eq(index)
    items.removeClass('focus')
    item.addClass('focus')
    animation.scroll(item, this.ui.content)
  },
  filter: function (child) {
    return !(child.get('visible') === false)
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
    this.ui.scroll.nanoScroller({alwaysVisible: true})
  },
  resetHeight: function () {
    this.$el.css('height', `${this.getListHeight()}px`)
  },
  getListHeight: function () {
    var el = this.listView.$el
    var height
    if (this.maxSize) {
      // Calculate the height according to the maximum size
      var firstItem = el.find('li').eq(0)
      var itemHeight = firstItem.outerHeight()
      height = _.min([el.height(), (itemHeight * this.maxSize)])
    } else {
      height = el.outerHeight()
    }
    // Determine and add the outer border widths
    var topBorderWidth = this.$el.css('border-top-width')
    var bottomBorderWidth = this.$el.css('border-bottom-width')
    topBorderWidth = parseInt(topBorderWidth, 10)
    bottomBorderWidth = parseInt(bottomBorderWidth, 10)
    height += (topBorderWidth + bottomBorderWidth)
    // Determine and add the list padding
    var paddingTop = this.$el.css('padding-top')
    var paddingBottom = this.$el.css('padding-bottom')
    paddingTop = parseInt(paddingTop, 10)
    paddingBottom = parseInt(paddingBottom, 10)
    height += paddingTop + paddingBottom
    // Return the calculated height
    return height
  },
  getListWidth: function () {
    var width = null
    this.ui.content.css({position: 'relative'})
    width = this.$el.outerWidth()
    this.ui.content.css({position: 'absolute'})
    return width
  }
})
