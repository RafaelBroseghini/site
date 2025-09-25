+++
date = '2025-09-25T18:11:08-05:00'
title = '1Password and Go Configuration'
summary = 'injecting 1password values securely at runtime'
readTime = true
tags = ['go', '1password']
showTags = true
hideBackToTop = false
+++

## Why I Created op-viper

As with any application, I needed to configure it with a variety of settings. Some could be public and fixed, others were sensitive and needed to be stored securely.

The common approach is to bring environment variables into the application using some process. Maybe a `.env` file, bash scripts, etc. When it comes to remote deployment your process might actually look slightly different. You might have a CI/CD pipeline that takes care of setting the environment variables or a secret management solution that injects them into your deployment.

I have used a combination of both approaches over the years. They work fine and follow the 12 factor app principles. Great!

For the sake of velocity, I wanted to find a way to store my configuration homogeneously across environments while still being able to manage them securely.

## Enter 1Password

1Password is a password manager that I have been using for quite some time now. They provide a great developer experience across the CLI, API, and SDKs.

## Enter op-viper

[op-viper](https://github.com/rafaelbroseghini/op-viper) is a tool that I created to bridge 1Password and Go configuration using `viper`. It's a simple tool that allows me to store my configuration in 1Password and inject it into my application at runtime.

## How it works

```bash
go get github.com/rafaelbroseghini/op-viper
```

Let's say I have a configuration file like this:

```yaml
database:
  host: "localhost"
  port: 5432
  username: "{{ op://vault/item/username }}"
  password: "{{ op://vault/item/password }}"

api:
  key: "{{ op://production/api-key }}"
  secret: "{{ op://production/api-secret }}"
```

Let's say I have the following Go code:

```go
package main

import (
    "context"
    "github.com/spf13/viper"
    "github.com/rafaelbroseghini/op-viper/pkg/onepassword"
)

type Config struct {
    DatabaseURL string `mapstructure:"database_url"`
    APIKey      string `mapstructure:"api_key"`
}

func main() {
    v := viper.New()
    v.SetConfigType("yaml")
    v.SetConfigName("config.yaml")
    v.AddConfigPath(".")
    
    v.ReadInConfig()
    
    var config Config
    l := onepassword.NewDefaultLoader()
    v.Unmarshal(&config, viper.DecodeHook(l.OnePasswordHookFunc(context.Background())))
}
```

As part of the unmarshalling, `op-viper` will replace 1password references with the actual values and bind them to the `Config` struct.

This allows me to ditch `.env` files, bash scripts, and other approaches to inject configuration into my application and use a consistent approach to managing my configuration.

I have to be transparent and say that I changes to 1password references would require a re-deployment of the application, which might not be ideal for some use cases. If you work solo or in a small team where configuration might not change frequently, this might be a good fit for you :)

Check out the [repository](https://github.com/rafaelbroseghini/op-viper) for more details!