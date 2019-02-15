const sinon = require('sinon')
const dropCheckoutToken = require('../../../cart/dropCheckoutToken')

describe('dropCheckoutToken', () => {
  let sandbox
  const storage = {
    set: async () => {}
  }
  const context = {
    meta: {
      userId: null
    },
    storage: {
      user: storage,
      device: storage
    }
  }

  beforeEach(() => {
    context.meta.userId = null
    context.storage.user = storage
    context.storage.device = storage
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('should delete checkoutToken from the user storage for logged in users', async () => {
    context.meta.userId = 1
    const storageSetSpy = sandbox.spy(context.storage.user, 'set')

    await dropCheckoutToken(context)
    sinon.assert.calledWith(storageSetSpy, 'checkoutToken', null)
  })

  it('should delete checkoutToken from the device storage for NOT logged in users', async () => {
    const storageSetSpy = sandbox.spy(context.storage.device, 'set')

    await dropCheckoutToken(context)
    sinon.assert.calledWith(storageSetSpy, 'checkoutToken', null)
  })
})
