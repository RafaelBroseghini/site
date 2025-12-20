+++
date = '2025-04-29T22:12:06-05:00'
title = 'Watching the LAN with Netalertx'
summary = "network topology"
readTime = true
math = true
tags = ["homelab"]
showTags = true
hideBackToTop = false
+++

A few weeks ago I had an itch. I wanted to be able to watch my LAN and see exactly what devices were connected to it. I can login to my router and see the devices connected, but I honestly wanted to use a tool that I could run on my Raspberry Pi 5. Something with a nice UI and easily deployable.

I headed over to [r/selfhosted](https://www.reddit.com/r/selfhosted/) and searched for something like "watch my network" and [Netalertx](https://github.com/jokob-sk/netalertx) had pretty good reviews. [WatchYourLAN](https://github.com/aceberg/WatchYourLAN) was another tool with positive reviews! NetAlertX looked like it had a more feature rich UI, so I went with that.

## Installation

```bash
docker run -d --rm --network=host \
  -v local_path/config:/app/config \
  -v local_path/db:/app/db \
  --mount type=tmpfs,target=/app/api \
  -e PUID=200 -e PGID=300 \
  -e TZ=America/Chicago \
  -e PORT=20211 \
  ghcr.io/jokob-sk/netalertx:latest
```

I did need to set the correct network interface in the UI and after a few minutes I was able to see the LAN topology!

{{< figure
  src="/img/netalert.png"
  alt="Netalertx"
  caption="Netalertx"
  
>}}

## Next steps

I haven't explored all Netalertx features yet, but notifications stuck out to me as pretty useful. I'm planning on setting up notifications so I can get alerts when new devices connect to the network. Either an email or a push notification would work.



