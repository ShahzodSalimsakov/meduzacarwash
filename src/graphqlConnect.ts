import { GraphQLClient } from "graphql-request";
console.log(import.meta);
export const client = new GraphQLClient(
  "https://api.meduza-carwash.uz/graphql",
  {
    headers: {},
  }
);
