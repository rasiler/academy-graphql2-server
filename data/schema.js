import PostsList from './posts';
import UsersList from './users';
import CommentsList from './comments';

import {
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLEnumType,
  GraphQLNonNull,
  GraphQLInterfaceType,
} from 'graphql';

function toMap(userList) {
    let m = UsersList.reduce(function (map, user) {
        map[user.username.toLowerCase()] = user;
        return map;
    },{});

    console.log(m);
    return m;
}

const UsersMap = toMap(UsersList);

const GeoCoord = new GraphQLObjectType({
  name: 'GeoCoord',
  description: 'The address for a user',
  fields: () => ({
    lat: {type: GraphQLString},
    lng: {type: GraphQLString}
  })
});

const Address = new GraphQLObjectType({
  name: 'Address',
  description: 'The address for a user',
  fields: () => ({
    street: {type: GraphQLString},
    suite: {type: GraphQLString},
    city: {type: GraphQLString},
    zipcode: {type: GraphQLString},
    geo: {type: GeoCoord},
  })
});

const Company = new GraphQLObjectType({
  name: 'Company',
  description: 'The company for a user',
  fields: () => ({
    name: {type: GraphQLString},
    catchPhrase: {type: GraphQLString},
    bs: {type: GraphQLString}
  })
});

const User = new GraphQLObjectType({
  name: 'User',
  description: 'Respresents an user on the blog site',
   fields: () => ({
    id: {type: GraphQLInt},
    name: {type: GraphQLString},
    username: {type: GraphQLString},
    email: {type: GraphQLString},
    address: {type: Address},
    phone: {type: GraphQLString},
    website: {type: GraphQLString},
    company: {type: Company}
  })
});

const Category = new GraphQLEnumType({
  name: 'Category',
  description: 'A Category of the blog',
  values: {
    METEOR: {value: 'meteor'},
    PRODUCT: {value: 'product'},
    USER_STORY: {value: 'user-story'},
    OTHER: {value: 'other'}
  }
});


const Post = new GraphQLObjectType({
  name: 'Post',
  description: 'Represent the type of a blog post',
  fields: () => ({
    id: {type: GraphQLInt},
    userId: {type: GraphQLInt},
    title: {type: GraphQLString},
    category: {type: Category},
    likeCount: {type: GraphQLInt},
    body: {type: GraphQLString},
    date: {
      type: GraphQLFloat,
      resolve: function(post) {
        if(post.date) {
          return new Date(post.date.getTime());
        } else {
          return null;
        }
      }
    }
  })
});

const Query = new GraphQLObjectType({
  name: 'BlogSchema',
  description: 'Root of the Blog Schema',
  fields: () => ({
    posts: {
      type: new GraphQLList(Post),
      description: 'List of posts in the blog',
      args: {
        category: {type: Category}
      },
      resolve: function(source, {category}) {
        if(category) {
          return PostsList.filter(post => post.category === category);
        } else {
          return PostsList;
        }
      }
    },

    users: {
      type: new GraphQLList(User),
      description: 'List of users',
      args: {
        username: {type: GraphQLString}
      },
      resolve: function(source, {username}) {
        if (username) {
          return UsersMap[username];
        }
        return UsersList;
      }
    },

    latestPost: {
      type: Post,
      description: 'Latest post in the blog',
      resolve: function() {
        PostsList.sort((a, b) => {
          var bTime = new Date(b.date['$date']).getTime();
          var aTime = new Date(a.date['$date']).getTime();

          return bTime - aTime;
        });

        return PostsList[0];
      }
    },

    recentPosts: {
      type: new GraphQLList(Post),
      description: 'Recent posts in the blog',
      args: {
        count: {type: new GraphQLNonNull(GraphQLInt), description: 'Number of recent items'}
      },
      resolve: function(source, {count}) {
        PostsList.sort((a, b) => {
          var bTime = new Date(b.date['$date']).getTime();
          var aTime = new Date(a.date['$date']).getTime();

          return bTime - aTime;
        });

        return PostsList.slice(0, count);
      }
    },

    post: {
      type: Post,
      description: 'Post by id',
      args: {
        id: {type: new GraphQLNonNull(GraphQLInt)}
      },
      resolve: function(source, {id}) {
        return PostsList.filter(post => post.id === id)[0];
      }
    },
  })
});

const Mutation = new GraphQLObjectType({
  name: 'BlogMutations',
  fields: {
    createPost: {
      type: Post,
      description: 'Create a new blog post',
      args: {
        title: {type: new GraphQLNonNull(GraphQLString)},
        body: {type: new GraphQLNonNull(GraphQLString)},
        category: {type: Category},
        author: {type: new GraphQLNonNull(GraphQLString), description: 'username of the author'}
      },
      resolve: function(source, ...args) {
        let post = args;

        post.id = PostsList.size + 1;
        post.date = new Date();

        console.log(post);
        PostsList.push(post);
        return post;
      }
    }

  }
});

const Schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation
});

export default Schema;
