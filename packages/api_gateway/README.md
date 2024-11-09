SOC IT support:

> Hi,
> 
> We are no longer supporting reverse proxies for transient uses such as for FYP. Please access your web services within SoC, or via SoC VPN is needed. Your present forwarding config will remain for time being.
>
> Regards,
> 
> .lzs

While we host within the NUS compute cluster, we can no longer configure the reverse proxy settings (https://trofos.comp.nus.edu.sg/, etc domain name). For now we keep to reverse proxy settings, that forward all traffic from domain/api -> VM port 3001. Now we make api gateway to port 3001 and forward to respective services

Note this is for deployment on SOC VM. Locally, if you start frontend with vite, vite config sets forwarding directly to backend/ hocus pocus

Deployed API traffic flow:

```
user browser -> SOC reverse proxy -*> API gateway ->  backend
                                                  |_> hocus pocus
```
For the above point `-*>`, we can't configure anymore according to SOC IT

Local (`pnpm run start-dev` directly on your machine) API traffic flow:

```
          * configured by vite
user browser ->  backend
             |-> hocus pocus
```

Local Docker traffic:

```
user browser -> local_dev_docker nginx server -> API gateway ->  backend
                                                             |_> hocus pocus
```
