# Quick start

1. `docker compose -f docker-compose-monitoring.yml up --build`

## Grafana

Used to visualize time series data stored in prometheus

## Prometheus

Stores all the metric data from various sources like cadvisor (gets metrics on container related things) or node_exporter (metrics on the machine itself). Metrics on the actual application is added to the backend application code (`server.ts`).
