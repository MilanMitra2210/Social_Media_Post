import { Client } from "pg";


// PostgreSQL connection parameters
const client = new Client({
  host: "localhost",
  user: "postgres",
  port: 5432,
  password: "1234",
  database: "assignment2"
})
export default client;
// client.connect();
