let app;
let isFocused = false;

export function setupDock(_app) {
  app = _app;

  app.on('browser-window-blur', function browserWindowBlur() {
    isFocused = false;
  });

  app.on('browser-window-focus', function browserWindowFocus() {
    isFocused = true;
  });
}

export function setBadge(text) {
  app.dock.setBadge(text);
}

export function getBadge() {
  app.dock.getBadge();
}

export function bounce(critical = false) {
  console.log('bounce', critical);
  return app.dock.bounce(critical ? 'critical' : 'informational');
}

export function cancelBounce(id) {
  console.log('cancelBounce', id);
  return app.dock.cancelBounce(id);
}
