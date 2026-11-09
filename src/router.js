const routes = {};

export function registerRoute(path, render) {
  routes[path] = render;
}

export function startRouter(container) {
  const render = () => {
    const path = location.hash.replace(/^#/, '') || '/';
    const screen = routes[path] || routes['/'];
    container.replaceChildren(screen());
    container.focus();
    window.scrollTo(0, 0);
  };
  window.addEventListener('hashchange', render);
  render();
}