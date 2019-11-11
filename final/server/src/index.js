// require('dotenv').config();

const { ApolloServer } = require('apollo-server');
const isEmail = require('isemail');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const { createStore } = require('./utils');

const LaunchAPI = require('./datasources/launch');
const UserAPI = require('./datasources/user');

const internalEngineDemo = require('./engine-demo');

// creates a sequelize connection once. NOT for every request
const store = createStore();

// set up any dataSources our resolvers need
const dataSources = () => ({
  launchAPI: new LaunchAPI(),
  userAPI: new UserAPI({ store }),
});

// the function that sets up the global context for each resolver, using the req
const context = async ({ req }) => {
  // simple auth check on every request
  const auth = (req.headers && req.headers.authorization) || '';
  const email = new Buffer(auth, 'base64').toString('ascii');
  console.log(`🚀 email valid ${email}`);
  // if the email isn't formatted validly, return null for user
  if (!isEmail.validate(email)) return { user: null };
  console.log(`🚀🚀 after check email valid ${email}`);
  // find a user by their email
  const users = await store.users.findOrCreate({ where: { email } });
  const user = users && users[0] ? users[0] : null;
  console.log(`🚀🚀 after check user valid ${user.email}`);
  return { user: { ...user.dataValues } };
};
/*




*/


// Set up Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  engine: {
    apiKey: "service:ecomundo-scaffold:7NZBcW4aZ6GKyDFtr9qOjQ",
    schemaTag: "dev"
  },
  dataSources,
  context,
  engine: {
    apiKey: process.env.ENGINE_API_KEY,
    ...internalEngineDemo,
  },
  introspection: true,
  playground: true,
});
// The `listen` method launches a web server.
server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});

// export all the important pieces for integration/e2e tests to use
module.exports = {
  dataSources,
  context,
  typeDefs,
  resolvers,
  ApolloServer,
  LaunchAPI,
  UserAPI,
  store,
  server,
};