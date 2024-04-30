# ln.arma.events

Small service to create URL aliases for any URL. So for example one could create a URL `https://ln.arma.events/discord`, which redirects to our latest Discord invite.

A aliased URL has two main advantages over the original URL:

-   It is easy to remember & copy
-   The underlying URL can be easily swapped out while still ensuring that all old references remain functional

## Adding aliases

Simply add an entry to the [`links.yaml`](./links.yaml).

```yaml
index: # Alias (required)
    url: https://github.com/arma-events/ln # URL  (required)
    title: arma.events URL Aliases # Open Graph title (optional)
    description: Small service to create URL aliases for any URL. # Open Graph description (optional)
```
