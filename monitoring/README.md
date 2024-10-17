# Quick start

1. Create a `.env` based off the .env.example

1. `docker compose -f docker-compose-monitoring.yml up --build`

## Grafana

Used to visualize time series data stored in prometheus

### Grafana provisioning

Think of the files in grafana dir like IAC, storing dashboard and alerting configs as files. Alerts can be configured with terraform, but will likely need to change insignificant amounts of things compared to file provisioning

**TODO: set telegram_chat_id in env var when grafana fixes some parsing issue. Now chat id is written directly in alert_resources.contact points. Remember to change it for staging/production**

## Prometheus

Stores all the metric data from various sources like cadvisor (gets metrics on container related things) or node_exporter (metrics on the machine itself). Metrics on the actual application is added to the backend application code (`server.ts`).

## Deployment

Run `/home/sadm/hooks/monitoring_cd.sh`.
