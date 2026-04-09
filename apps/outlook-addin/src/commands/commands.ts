/* global Office */

Office.onReady(() => {
  Office.actions.associate('onNewMessageComposeHandler', onNewMessageComposeHandler)
})

async function onNewMessageComposeHandler(event: Office.AddinCommands.Event) {
  try {
    const item = Office.context.mailbox.item
    if (item && 'body' in item) {
      item.body.setSignatureAsync(
        '<div style="font-family:Inter,Arial,sans-serif;color:#1f2430;">DH Signature placeholder. Rendered signature injection will be wired to the API next.</div>',
        { coercionType: Office.CoercionType.Html },
        () => event.completed(),
      )
      return
    }
  } catch {
    // Fall through to complete
  }
  event.completed()
}
