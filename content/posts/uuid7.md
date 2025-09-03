+++
date = '2025-09-02'
title = 'uuid7 - indexable and time sortable'
summary = '50 nanosecond resolution'
readTime = true
math = true
hideBackToTop = false
+++

Whenever I think about uuids, my mind goes immediately to `uuid4`. It is somewhat of a developer's default choice for generating unique identifiers. Given it's almost negligible chance of a collision, it fits most use cases. However, there are some use cases where `uuid4` is not the best choice.

Today I found out about https://uuid7.com/, which offers a precise timestamp, up to 50 nanosecond resolution.

## UUID use cases

Different uuid versions have different use cases:

https://www.ntietz.com/blog/til-uses-for-the-different-uuid-versions/

## Snowflakes

This reminded me of Discord's [snowflakes](https://discord.com/developers/docs/reference#snowflakes).