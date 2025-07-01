import { Handler } from '@netlify/functions';
import express from 'express';
import { registerRoutes } from '../../server/routes';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Registrar las rutas de la API
registerRoutes(app);

// Convertir Express app a función serverless
const handler: Handler = async (event, context) => {
  return new Promise((resolve, reject) => {
    const { httpMethod, path, queryStringParameters, body, headers } = event;
    
    // Crear request object para Express
    const req = {
      method: httpMethod,
      url: path,
      path: path,
      query: queryStringParameters || {},
      body: body ? JSON.parse(body) : {},
      headers: headers || {},
      params: {},
      originalUrl: path,
    } as any;

    // Crear response object para Express
    const res = {
      statusCode: 200,
      headers: {},
      body: '',
      status: function(code: number) {
        this.statusCode = code;
        return this;
      },
      json: function(data: any) {
        this.body = JSON.stringify(data);
        this.headers['Content-Type'] = 'application/json';
        return this;
      },
      send: function(data: any) {
        this.body = typeof data === 'string' ? data : JSON.stringify(data);
        return this;
      },
      set: function(key: string, value: string) {
        this.headers[key] = value;
        return this;
      },
      end: function(data?: any) {
        if (data) this.body = typeof data === 'string' ? data : JSON.stringify(data);
        resolve({
          statusCode: this.statusCode,
          headers: this.headers,
          body: this.body,
        });
      },
    } as any;

    // Manejar la request
    app(req, res, (err: any) => {
      if (err) {
        resolve({
          statusCode: 500,
          body: JSON.stringify({ error: err.message }),
        });
      }
    });
  });
};

export { handler }; 