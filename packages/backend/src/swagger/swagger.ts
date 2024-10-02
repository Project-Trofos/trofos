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
      description: 'Trofos External APIs documentation. *Note: schemas are for reference and may not be accurate',
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
        Sprint: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Unique identifier for the sprint',
            },
            name: {
              type: 'string',
              description: 'Name of the sprint',
            },
            duration: {
              type: 'integer',
              description: 'Duration of the sprint in weeks',
            },
            start_date: {
              type: 'string',
              format: 'date-time',
              description: 'Sprint start date and time',
            },
            end_date: {
              type: 'string',
              format: 'date-time',
              description: 'Sprint end date and time',
            },
            project_id: {
              type: 'integer',
              description: 'ID of the associated project',
            },
            goals: {
              type: 'string',
              nullable: true,
              description: 'Goals for the sprint',
            },
            status: {
              type: 'string',
              description: 'Current status of the sprint',
            },
            backlogs: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Backlog',
              },
            },
          },
          required: ['id', 'name', 'duration', 'start_date', 'end_date', 'project_id', 'status'],
        },
        Backlog: {
          type: 'object',
          properties: {
            backlog_id: {
              type: 'integer',
              description: 'Unique identifier for the backlog item',
            },
            summary: {
              type: 'string',
              description: 'Short summary of the backlog item',
            },
            type: {
              type: 'string',
              description: 'Type of backlog item (e.g., story, task, bug)',
            },
            sprint_id: {
              type: 'integer',
              description: 'ID of the associated sprint',
            },
            priority: {
              type: 'string',
              description: 'Priority level of the backlog item',
            },
            reporter_id: {
              type: 'integer',
              description: 'ID of the user who reported the backlog item',
            },
            assignee_id: {
              type: 'integer',
              description: 'ID of the user assigned to the backlog item',
            },
            project_id: {
              type: 'integer',
              description: 'ID of the associated project',
            },
            points: {
              type: 'integer',
              description: 'Story points associated with the backlog item',
            },
            description: {
              type: 'string',
              nullable: true,
              description: 'Detailed description of the backlog item',
            },
            status: {
              type: 'string',
              description: 'Current status of the backlog item',
            },
            epic_id: {
              type: 'integer',
              nullable: true,
              description: 'ID of the associated epic, if any',
            },
            assignee: {
              type: 'object',
              properties: {
                project_id: {
                  type: 'integer',
                  description: 'ID of the project the assignee belongs to',
                },
                user_id: {
                  type: 'integer',
                  description: 'Unique identifier for the assignee',
                },
                created_at: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Timestamp when the assignee was created',
                },
                user: {
                  type: 'object',
                  properties: {
                    user_display_name: {
                      type: 'string',
                      description: 'Display name of the assignee',
                    },
                    user_email: {
                      type: 'string',
                      format: 'email',
                      description: 'Email of the assignee',
                    },
                  },
                },
              },
            },
            epic: {
              type: 'object',
              nullable: true,
              description: 'Details of the associated epic, if any',
            },
          },
          required: ['backlog_id', 'summary', 'type', 'sprint_id', 'priority', 'reporter_id', 'assignee_id', 'project_id', 'points', 'status'],
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
  app.use('/api/external/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

export default setUpSwagger;
