
import _ from 'lodash'

function transfer (sender, receiver, eventName) {
  sender.listenTo(sender, eventName, function () {
    var args = _([eventName]).concat(arguments).value()
    receiver.trigger.apply(receiver, args)
  })
}

export default {
  transfer
}
