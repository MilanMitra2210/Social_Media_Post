import express, { Application, Request, Response } from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import router from './routes/authRoute';

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import postRoute from './routes/postRoute';
import fileUpload from 'express-fileupload';

// configure env
dotenv.config();

// database config

// rest object
const app : Application = express();

app.use(cors());
app.use(express.json());
app.use(fileUpload({useTempFiles:true}));

// Swagger definition options
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Assignment 1 APIs',
      version: '1.0.0',
      description: 'Register Form | Login | CRUD Operations ',
    },
      servers:[
        {
          url: 'http://localhost:8080/api/v1/auth'
        }
      ]
  },
  apis: ['./src/routes/*.ts'],
};
// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(options)
;



// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// routes
app.use('/api/v1/auth', router);
app.use('/api/', postRoute);




app.get('/', (req: Request, res: Response ) => {// rest api
  res.send('Server running');
});

// PORT
const PORT: number = parseInt(process.env.PORT!) || 8080;


// run listen
app.listen(PORT, () => {
  console.log(`Server is running on mode ${process.env.DEV_MODE} on port ${PORT}`);
  
});
