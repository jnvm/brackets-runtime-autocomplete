## Runtime Autocomplete for Brackets

_(intended for [browser-based brackets](https://www.npmjs.com/package/brackets) usage)_

If you add [this route](https://github.com/jnvm/runtime-autocomplete) to your node express project, and your brackets instance can XHR to it, upon pressing ```Ctrl+Shift+A``` to toggle on this plugin, it will ask that endpoint for runtime code completion suggestions.

It does not execute the current line of code, only retrieve properties in the app's runtime context.

```Ctrl+Shift+A``` will toggle this feature on/off.  It is on when the cursor glows aqua.

The plugin looks for the app's JSON endpoint at the same origin it is at, but on port :8000/repl. To change this, edit main.js or redefine ```localStorage.runtimeEndpoint```.