import { Express } from "express";
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Trofos External API',
      version: '1.0.0',
      description: 'Trofos External APIs documentation',
    },
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
        }
      }
    },
    security: {
      ApiKeyAuth: []
    }
  },
  apis: ['./src/routes/external/**/*.ts']
}

const swaggerSpec = swaggerJsdoc(options);

function setUpSwagger(app: Express) {
  app.use('/external/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

export default setUpSwagger;
