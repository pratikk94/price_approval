const setupRoutes = (app, routes) => {
    routes.forEach(route => {
      app.use(route.path, route.route);
    });
  };
  
  module.exports = setupRoutes;
  