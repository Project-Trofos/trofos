import { FetchTransport, getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

const isTestEnv = import.meta.env.VITE_APP_ENV === 'test' || import.meta.env.MODE === 'test';
const faroEndpoint = '/api/faro/collect';

export const faro = !isTestEnv
  ? initializeFaro({
      app: {
        name: 'frontend',
        environment: import.meta.env.VITE_APP_ENV || import.meta.env.MODE || 'development',
      },
      transports: [
        new FetchTransport({
          url: faroEndpoint,
        }),
      ],
      instrumentations: [...getWebInstrumentations(), new TracingInstrumentation()],
      sessionTracking: {
        enabled: true,
      },
      experimental: {
        trackNavigation: true,
      },
    })
  : null;
