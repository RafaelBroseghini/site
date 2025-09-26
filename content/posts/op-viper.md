+++
date = '2025-09-25'
title = '1Password and Go Configuration'
summary = 'injecting 1Password values securely at runtime'
readTime = true
tags = ['go', '1Password']
showTags = true
hideBackToTop = false
+++

## Application Configuration

As with any application, we often need to configure a combination of settings. Some may be public and fixed, while others are sensitive and must be stored securely. Most will need different values across environments.

A common approach is to supply environment variables to the application via external processes—such as a `.env` file, shell scripts, or `sed` replacements. 

For remote deployments, the process might look a bit different. You might have a CI/CD pipeline that sets environment variables, or a secrets‑management solution that injects them into your deployment via a volume mount or other means.

I've used a combination of both approaches over the years. They work well and follow the [Twelve‑Factor App](https://www.12factor.net/config) guidance. Great!

For the sake of velocity, I set out to store configuration consistently across environments while still managing it securely. It was important to have the same experience in local development and remote deployment.

## Enter 1Password

[1Password](https://developer.1password.com/) is a password manager I've used for quite some time. They provide a great developer experience across the CLI, API, and SDKs.

They offer authorization via browseruser consent, service accounts, and the Connect server access token. I haven't used the Connect server access token, but I've used the [op CLI](https://developer.1password.com/docs/cli/) and [service accounts](https://developer.1password.com/docs/service-accounts) extensively.

With the CLI, you don't need additional secrets in your environment to authenticate with 1Password. However, it's harder to use in remote deployments because it requires the user to [authorize access](https://developer.1password.com/docs/cli/get-started#step-3-enter-any-command-to-sign-in) to the 1Password account, which it might be cumbersome to do in a remote environment.

## Enter op-viper

[op-viper](https://github.com/rafaelbroseghini/op-viper) is a tool I created to bridge 1Password and Go configuration using [viper](https://github.com/spf13/viper). It lets me store secrets in 1Password and inject them into my application at runtime via 1Password references.

## Installing op-viper

```bash
go get github.com/rafaelbroseghini/op-viper
```

## How it works

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

### Using op-viper with the CLI

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

As part of unmarshaling, `op-viper` replaces 1Password references with actual values and binds them to the `Config` struct. `NewDefaultLoader()` executes `op` shell commands to fetch values from 1Password. If the token has expired or is not present, it prompts the user to authorize access to their 1Password account.


### Using op-viper with service accounts

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
    ctx := context.Background()
    sdkClient := onepassword.NewOnePasswordSDKClient(
        ctx,
        "my-app",           // integration name
        "1.0.0",           // version
        "your-service-account-token",
    )

    loader := onepassword.NewLoader(
        onepassword.WithSDKClient(sdkClient),
        onepassword.WithPrefix("${"),  // Custom prefix
        onepassword.WithSuffix("}"),   // Custom suffix
    )

    v.Unmarshal(&config, viper.DecodeHook(loader.OnePasswordHookFunc(ctx)))
```

With this approach, `op-viper` uses the [onepassword-sdk-go](https://github.com/1Password/onepassword-sdk-go) client to fetch values from 1Password and bind them to the `Config` struct. This requires a service account token to be available (via `OP_SERVICE_ACCOUNT_TOKEN` environment variable) before running the application. 

In a real application, you may want to detect the runtime environment and choose between the CLI or SDK client loader.


```go
...
var loader onepassword.Loader
if isLocalEnvironment() {
    loader = onepassword.NewDefaultLoader()
} else {
    loader = onepassword.NewLoader(
        onepassword.WithSDKClient(sdkClient),
    )
}
```

## Conclusion

`op-viper` lets me ditch `.env` files, shell scripts, and other approaches for injecting configuration, and use a consistent approach to managing configuration across environments.

To be transparent, changes to 1Password references in your config files require redeploying the application, which might not be ideal for some use cases. If you work solo or in a small team where configuration doesn't change frequently, this might be a good fit for you 🙂

Check out the [repository](https://github.com/rafaelbroseghini/op-viper) for more details!