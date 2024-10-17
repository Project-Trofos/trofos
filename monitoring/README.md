# Quick start

1. Create a `.env` based off the .env.example

1. `docker compose -f docker-compose-monitoring.yml up --build`

## Grafana

Used to visualize time series data stored in prometheus

### Grafana provisioning

Think of the files in grafana dir like IAC, storing dashboard and alerting configs as files. Alerts can be configured with terraform, but will likely need to change insignificant amounts of things compared to file provisioning

* Telegram alerting: To get bot api token, use @bot_father on telegram. Any default newly generated bot should work. Add the bot to a group. To get group id, go `https://api.telegram.org/bot<api-token>/getUpdates`. Find :

```
"chat": {
          "id": -4591565687, <----- find this
          "title": "Trofos monitoring",
          "type": "group",
          "all_members_are_administrators": true
        },
```

Set the env vars according to .env.example to set telegram bot contact point's information, in a new `.env` file

* Adding new charts

Find pre-made dashboards online in grafana labs/ create new and export it. You can set the datasource uid to `ds-prometheus` as this datasource is provisioned/ preconfigured

Put the exported dashboard json into `./grafana/provisioning/dashboards`

* Adding new alerting

Create new alert rules on grafana using the UI, then export and append the new alert yml to `./grafana/provisioning/alerting/alert_rules.yml`. Do the same for contact points/ notification templates to `./grafana/provisioning/alerting/alert_resources.yml`. Take note grafana doesn't allow you to edit provisioned alert rules/ contact points/ notification templates. If there is a provisioned policy, you cannot add any new policies at all. So for policies, see grafana documentation and add on directly to `alert_resources.yml`

## Prometheus

Stores all the metric data from various sources like cadvisor (gets metrics on container related things) or node_exporter (metrics on the machine itself). Metrics on the actual application is added to the backend application code (`server.ts`).

## Deployment

Run `/home/sadm/hooks/monitoring_cd.sh`.
