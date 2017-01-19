(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('animation'), require('marionette'), require('handlebars'), require('lodash')) :
    typeof define === 'function' && define.amd ? define(['animation', 'marionette', 'handlebars', 'lodash'], factory) :
    (global.focuslist = factory(global.animation,global.Marionette,global.Handlebars,global._));
}(this, function (animation,marionette,handlebars,_) { 'use strict';

    animation = 'default' in animation ? animation['default'] : animation;
    marionette = 'default' in marionette ? marionette['default'] : marionette;
    handlebars = 'default' in handlebars ? handlebars['default'] : handlebars;
    _ = 'default' in _ ? _['default'] : _;

    var templates = {
        'focusList': handlebars.template({ "1": function _(container, depth0, helpers, partials, data) {
                return "  <div class=\"nano\">\n    <div class=\"nano-content\" region=\"list\"></div>\n  </div>\n";
            }, "3": function _(container, depth0, helpers, partials, data) {
                return "  <div region=\"list\"></div>\n";
            }, "compiler": [7, ">= 4.0.0"], "main": function main(container, depth0, helpers, partials, data) {
                var stack1;

                return (stack1 = helpers["if"].call(depth0 != null ? depth0 : {}, depth0 != null ? depth0.scroll : depth0, { "name": "if", "hash": {}, "fn": container.program(1, data, 0), "inverse": container.program(3, data, 0), "data": data })) != null ? stack1 : "";
            }, "useData": true })
    };

    function transfer(sender, receiver, eventName) {
      sender.listenTo(sender, eventName, function () {
        var args = _([eventName]).concat(arguments).value();
        receiver.trigger.apply(receiver, args);
      });
    }

    var utils = {
      transfer: transfer
    };

    var ListView = marionette.CollectionView.extend({
      tagName: 'ul',
      childEvents: {
        focus: 'onChildFocus',
        select: 'onChildSelect'
      },
      filter: function filter(child) {
        return !(child.get('visible') === false);
      },
      onChildFocus: function onChildFocus(child) {
        if (child.$el.is(':not(.disabled)')) {
          this.$el.children().removeClass('focus');
          child.$el.addClass('focus');
        }
      },
      onChildSelect: function onChildSelect(child) {
        this.trigger('select', child);
      }
    });

    var FocusListView = marionette.LayoutView.extend({
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
      initialize: function initialize(options) {
        this.childView = options.childView;
        this.collection = options.collection;
      },
      onShow: function onShow() {
        this.refreshScroll();
      },
      onRender: function onRender() {
        var _this = this;

        // Create child views
        this.listView = new ListView({
          childView: this.childView,
          collection: this.collection
        });
        // Render the list view when the collection changes
        this.listenTo(this.collection, 'change', function () {
          return _this.listView.render();
        });
        // Transfer list view events to parent
        utils.transfer(this.listView, this, 'render:collection');
        utils.transfer(this.listView, this, 'select');
        // Show child views
        this.showChildView('list', this.listView);
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
          this.listView.$el.children().last().addClass('focus');
        } else {
          var items = this.listView.$el.children(':not(.disabled)');
          var index = items.index(focusedView.el);
          index = index - 1;
          index = index < 0 ? items.length - 1 : index;
          this.focusItem(items, index);
        }
      },
      onArrowDownKey: function onArrowDownKey() {
        var focusedView = this.findFocusedItem();
        if (focusedView === undefined) {
          this.listView.$el.children().first().addClass('focus');
        } else {
          var items = this.listView.$el.children(':not(.disabled)');
          var index = items.index(focusedView.el);
          index = index + 1;
          index = index > items.length - 1 ? 0 : index;
          this.focusItem(items, index);
        }
      },
      onEnterKey: function onEnterKey() {
        this.itemSelect();
      },
      onSpaceKey: function onSpaceKey() {
        this.itemSelect();
      },
      serializeData: function serializeData() {
        return { scroll: this.options.scroll };
      },
      focusItem: function focusItem(items, index) {
        var item = items.eq(index);
        items.removeClass('focus');
        item.addClass('focus');
        animation.scroll(item, this.ui.content);
      },
      itemSelect: function itemSelect(e) {
        var focusedView = this.findFocusedItem();
        this.listView.$el.children().removeClass('focus');
        if (focusedView !== undefined) {
          this.trigger('select', focusedView);
        }
      },
      findFocusedItem: function findFocusedItem() {
        return this.listView.children.find(function (child) {
          return child.$el.hasClass('focus');
        });
      },
      findByModel: function findByModel(model) {
        return this.listView.children.findByModel(model);
      },
      refreshScroll: function refreshScroll() {
        if (this.options.scroll) {
          this.ui.scroll.nanoScroller({ alwaysVisible: true });
        }
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