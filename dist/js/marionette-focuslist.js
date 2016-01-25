(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('lodash'), require('animation'), require('marionette'), require('handlebars')) :
    typeof define === 'function' && define.amd ? define(['lodash', 'animation', 'marionette', 'handlebars'], factory) :
    (global.focuslist = factory(global._,global.animation,global.Marionette,global.Handlebars));
}(this, function (_,animation,Marionette,handlebars) { 'use strict';

    _ = 'default' in _ ? _['default'] : _;
    animation = 'default' in animation ? animation['default'] : animation;
    Marionette = 'default' in Marionette ? Marionette['default'] : Marionette;
    handlebars = 'default' in handlebars ? handlebars['default'] : handlebars;

    var templates = {
        'focusList': handlebars.template({ "compiler": [7, ">= 4.0.0"], "main": function main(container, depth0, helpers, partials, data) {
                return "<div class=\"nano\">\n  <div class=\"nano-content\">\n    <ul></ul>\n  </div>\n</div>\n";
            }, "useData": true })
    };

    var FocusListView = Marionette.CompositeView.extend({
      template: templates['focusList'],
      attributes: {
        class: 'focusList'
      },
      events: {
        'keydown': 'onKeyDown'
      },
      childViewContainer: 'ul',
      childEvents: {
        focus: 'onChildFocus',
        select: 'onChildSelect'
      },
      ui: {
        scroll: '.nano',
        content: '.nano-content',
        list: 'ul'
      },
      keyEvents: {
        13: 'itemSelect',
        32: 'itemSelect',
        38: 'onArrowUpKey',
        40: 'onArrowDownKey'
      },
      initialize: function initialize(options) {
        this.maxSize = options.maxSize;
      },
      onShow: function onShow() {
        this.refreshScroll();
      },
      onChildFocus: function onChildFocus(child) {
        if (child.$el.is(':not(.disabled)')) {
          this.ui.list.children().removeClass('focus');
          child.$el.addClass('focus');
        }
      },
      onChildSelect: function onChildSelect(child) {
        this.trigger('select', child);
      },
      onKeyDown: function onKeyDown(e) {
        var method = this.keyEvents[e.keyCode];
        if (method !== undefined) {
          this[method]();
          e.preventDefault();
        }
      },
      onArrowUpKey: function onArrowUpKey() {
        var focusedView = this.findFocusedItem();
        if (focusedView === undefined) {
          this.ui.list.children().last().addClass('focus');
        } else {
          var items = this.ui.list.children(':not(.disabled)');
          var index = items.index(focusedView.el);
          index = index - 1;
          index = index < 0 ? items.length - 1 : index;
          this.focusItem(items, index);
        }
      },
      onArrowDownKey: function onArrowDownKey() {
        var focusedView = this.findFocusedItem();
        if (focusedView === undefined) {
          this.ui.list.children().first().addClass('focus');
        } else {
          var items = this.ui.list.children(':not(.disabled)');
          var index = items.index(focusedView.el);
          index = index + 1;
          index = index > items.length - 1 ? 0 : index;
          this.focusItem(items, index);
        }
      },
      focusItem: function focusItem(items, index) {
        var item = items.eq(index);
        items.removeClass('focus');
        item.addClass('focus');
        animation.scroll(item, this.ui.content);
      },
      filter: function filter(child) {
        return !(child.get('visible') === false);
      },
      itemSelect: function itemSelect(e) {
        var focusedView = this.findFocusedItem();
        this.ui.list.children().removeClass('focus');
        if (focusedView !== undefined) {
          this.trigger('select', focusedView);
        }
      },
      findFocusedItem: function findFocusedItem() {
        return this.children.find(function (child) {
          return child.$el.hasClass('focus');
        });
      },
      refreshScroll: function refreshScroll() {
        this.ui.scroll.nanoScroller({ alwaysVisible: true });
      },
      getListHeight: function getListHeight() {
        var el = this.ui.list;
        var height = el.height();
        el.css('height', '');
        // Calculate the height according to the maximum size
        if (this.maxSize) {
          var firstItem = el.find('li').eq(0);
          var itemHeight = firstItem.outerHeight();
          height = _.min([el.height(), itemHeight * this.maxSize]);
        }
        // Return the calculated height
        return height;
      },
      getListWidth: function getListWidth() {
        var width = null;
        this.ui.content.css({ position: 'relative' });
        width = this.$el.outerWidth();
        this.ui.content.css({ position: 'absolute' });
        return width;
      }
    });

    var index = {
      FocusListView: FocusListView
    };

    return index;

}));
//# sourceMappingURL=marionette-focuslist.js.map