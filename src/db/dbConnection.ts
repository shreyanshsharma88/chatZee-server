import { Sequelize } from "sequelize";
import { DB_PASS } from "../utils/constants";

const connectionString = `postgresql://neondb_owner:${DB_PASS}@ep-gentle-waterfall-a5jytag7.us-east-2.aws.neon.tech/neondb?sslmode=require`;
const sequelize = new Sequelize(`postgresql://neondb_owner:${DB_PASS}@ep-gentle-waterfall-a5jytag7.us-east-2.aws.neon.tech/neondb?sslmode=require`
  // dialect: "postgres",
  // logging: false,
);

// export { sequelize };


// import { Sequelize } from "sequelize";

// const sequelize = new Sequelize('logiwise_v1', 'warehouseuser', '1234', {
//   host: 'localhost',  // Since it's running locally in Docker
//   dialect: 'postgres',
//   port: 5435,         // Use port 5435, which maps to container's 5432
//   logging: false,     // Disable logging (optional)
// });

// export { sequelize };

// import { Sequelize } from "sequelize";

// const sequelize = new Sequelize('neondb', 'neondb_owner', '6swIvLl0nceJ', {
//   host: 'ep-gentle-waterfall-a5jytag7.us-east-2.aws.neon.tech',  // Since it's running locally in Docker
//   dialect: 'postgres',
//   port: 5432,         // Use port 5435, which maps to container's 5432
//   logging: false,     // Disable logging (optional)
// });

// export { sequelize };

// const sequelize = new Sequelize('neondb', 'neondb_owner', DB_PASS, {
//     host: 'ep-gentle-waterfall-a5jytag7.us-east-2.aws.neon.tech',
//     dialect: 'postgres', // or 'postgres' if using pg
//     logging: false, // Set to true to see SQL queries
//     dialectOptions: {
//         connectTimeout: 60000, // Increase timeout (in milliseconds)
//     },
// });

export { sequelize };