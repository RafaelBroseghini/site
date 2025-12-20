+++
date = '2025-03-23'
title = 'Tailscale: Magic DNS, and Funnels'
summary = 'Accessing my homelab from anywhere in the world'
readTime = true
math = true
tags = ["homelab"]
showTags = true
hideBackToTop = false
+++

# Introduction

This is the second blog post in my [homelab](https://rafaelbroseghini.com/tags/homelab/) series! 

In part one I configured a Kubernetes cluster running on my Raspberry Pi 5 to allow inbound access using [Traefik](https://github.com/traefik/traefik) and continuously reconcile applications from a GitHub repository using [ArgoCD](https://argo-cd.readthedocs.io/en/stable/).

In this post I want to show how I can access my homelab from anywhere in the world using [Tailscale](https://tailscale.com/). What's the point of having a homelab if I can't access it from anywhere in the world at any time, right?

# Tailscale

One of my main goals with setting up a homelab was to be able to access it from anywhere in the world as if I was on my local network. I did not want to publicly expose my home network at all. I had looked into several solutions to solve this problem, including multiple VPN solutions and ultimately landed on Tailscale after seeing lots of great reviews and the ease of use.

I was pretty amazed at how easy it was to [set up and start using](https://tailscale.com/kb/1017/install) it. Within 5 to 10 minutes I was able to boot up my tailnet, add three devices and be able to securely communicate between them using IP addresses/hostnames. There are tons of features to Tailscale, but in this post I want to cover Tailscale's Magic DNS and Funnels.

The documentation is quite amazing! Along with the [official docs](https://tailscale.com/kb), their [YouTube channel](https://www.youtube.com/Tailscale) covers topics in great detail, and it was one of the main sources of information I used to get up and running with Tailscale as well as learn about all the features it has to offer.

# Magic DNS

`Magic DNS` is a feature of Tailscale that automatically registers names for devices on the tailnet. For example: when I installed Tailscale on my Raspberry Pi 5, I gave it the name `pi`. When I connect to my tailnet, I can now access the Raspberry Pi reverse proxy or SSH using the names `pi`, `pi.xxx.ts.net`, a IPv6 address, and a IPv4 address.

A few weeks ago I was in New York City and wanted to check on [PiHole](https://docs.pi-hole.net/). It was as simple as going to `pi:8880` (it's ok, no one else is on my tailnet) and being able to access the PiHole dashboard.

{{< figure
  src="/img/pihole.jpeg"
  alt="PiHole Dashboard"
  caption="PiHole Dashboard"
  
>}}

# Tailscale Funnels

Last week I was playing with my new [camera module V3](https://www.raspberrypi.com/products/camera-module-3/) on my `pi` to spin up a small web FFmpeg server and stream content. I wanted to show my mom what I had come up with, but the problem is: my parents live abroad and unless they were part of my tailnet, there was no way I could quickly share a live stream with them running on my Raspberry Pi. I also wanted to do this via HTTPS and not need to create special ACLs to allow access to the port.

But wait! Tailscale also solves that problem with a feature called `Tailscale Funnels`. If you're familiar with cloudflare tunnels, this is pretty much the same idea. You run the command `tailscale funnel <port>` and Tailscale creates a tunnel with IP routes from your machine up to the Tailscale servers which lets you route traffic from the broader internet to a local service running on a device in your tailnet.

At this point, anyone in the world can access the content running on my Raspberry Pi. Pretty cool, right? With that being said, use it responsibly as it is legitimately exposing your machine to the public internet.

{{< figure
  src="/img/funnel.jpeg"
  alt="Official Tailscale Docs - Funnel"
  caption="Official Tailscale Docs - Funnel"
  
>}}

The [official docs](https://tailscale.com/kb/1223/funnel#how-funnel-works) explains how it works in great detail.

# What's next?

I've recently discovered [selfh.st](https://selfh.st/apps/) which is a website that allows you to search for self-hosted apps and alternatives to SaaS products. I've added a few apps to my list:

- [Hoarder](https://hoarder.app/)
- [Paperless-ngx](https://paperless-ngx.com/)
- [Authentik](https://goauthentik.io/)

My plan is to continue to play around with my homelab and see what other cool things I can do with it. It's quite refreshing to play around, break things and learn from it, without it being mission critical :) See you in the next post!








