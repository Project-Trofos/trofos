import { Express } from "express";
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// TODO: find a better way to generate schema. Now prisma generated types cannot automatically
// be used in swagger schemas. zenstack/openapi conversion is being experimented with
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Trofos External API',
      version: '1.0.0',
      description: 'Trofos External APIs documentation',
    },
    servers: [
      {
        url: process.env.FRONTEND_BASE_URL + '/api/external' || 'http://localhost:3001/api/external',
        description: 'Server',
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
        }
      },
      schemas: {
        Project: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Unique identifier for the project',
            },
            pname: {
              type: 'string',
              description: 'Name of the project',
            },
            description: {
              type: 'string',
              nullable: true,
              description: 'Detailed description of the project',
            },
            course_id: {
              type: 'integer',
              description: 'ID of the related course',
            },
            course: {
              $ref: '#/components/schemas/Course',
              description: 'Course associated with this project',
            },
            public: {
              type: 'boolean',
              description: 'Whether the project is public or private',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp of the project',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Last updated timestamp of the project',
            },
            backlog_counter: {
              type: 'integer',
              description: 'The count of items in the backlog',
            },
          },
          required: ['id', 'pname', 'course_id', 'public', 'created_at', 'backlog_counter'],
        },
        Course: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Unique identifier for the course',
            },
            name: {
              type: 'string',
              description: 'Name of the course',
            },
            description: {
              type: 'string',
              nullable: true,
              description: 'Description of the course',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp of the course',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Last updated timestamp of the course',
            },
          },
          required: ['id', 'name', 'created_at'],
        },
      }
    },
    security: [
      {
        ApiKeyAuth: []
      }
    ]
  },
  apis: ['./src/routes/external/**/*.ts']
}

const swaggerSpec = swaggerJsdoc(options);

function setUpSwagger(app: Express) {
  app.use('/external/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

export default setUpSwagger;
