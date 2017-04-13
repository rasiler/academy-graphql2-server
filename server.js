import express from 'express';
import GraphQLHTTP from 'express-graphql';
import schema from './data/schema';

const app = express();
const PORT = 8888;

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  if (req.method === "OPTIONS") {
        return res.status(200).end();
    }
  next();
});

app.use("/GraphQL", GraphQLHTTP({
    schema,
    graphiql: true
  })
);

app.listen(PORT, () => {
  console.log("GraphQL server running.  listening on port", PORT);
});
