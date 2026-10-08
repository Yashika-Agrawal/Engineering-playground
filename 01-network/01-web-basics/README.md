# Web basics: how the browser makes sense of a response

**Where this fits:** the start of the request journey, the moment a response
comes back from a server and the browser has to decide what to do with it.
Module: [01-network](../README.md).

## What was I trying to understand?

I wanted to see how a request flows between a browser and a server, without
going deep into DNS or TCP yet. My starting question was simple: when a
server sends back text, how does the browser know whether it is a web page,
a stylesheet or something else?

![Request and response](diagrams/request-response.png)

## What did I see?

The server tells the browser what it sent using a `Content-Type` header.
When the header says `text/html`, the browser parses the text as a page.
When it says `text/css`, the browser treats it as a stylesheet. The bytes
themselves don't carry that information, the header does.

The second thing I noticed was in the Network tab. I only ever asked for
`index.html`, but `index.css` showed up in the list too. In the Initiator
tab, `index.html` was listed as the reason. The browser read the HTML, found
the `<link>` to the stylesheet and requested it by itself. So one page
load is really several requests, each one discovered while parsing the
previous response.

![Initiator chain](diagrams/initiator-chain.png)

I also tried pasting three separate lines into an online HTML viewer.
They came out as one line. HTML ignores line breaks and extra spaces,
which is part of why it needs its own markup, like `<br>` and `<p>`, to
describe layout.

TODO: put `<br>` between the lines and compare. Then serve the same text as
`text/plain` and write down what changes.

## What did I get wrong at first?

I thought the `www` at the start of a site name meant "this is a web server
that returns HTML". It turns out `www` is just a subdomain, a name that
sites conventionally use for their website. Nothing technical requires it.
When `chaicode.com` sends me to `www.chaicode.com`, that is the site owner
choosing one main address and redirecting the other to it.

I also wrote that a web server is one that returns HTML. A web server is
really a program that answers HTTP requests. What it sends back can be
HTML, JSON, images, files or video, which my own diagram already shows.

I also assumed the server removes the formatting from text files. It is
actually the browser's HTML parser that collapses whitespace.

## Something I read but haven't tried yet

Big files like a large CSS file slow down the first display of a page,
since the browser needs the stylesheet before it can paint. A CDN helps by
keeping copies of static files like images and CSS on servers near the
user, so repeat loads come from a nearby cache instead of the origin server.

## Questions I still have

These are tracked in the [backlog](../../BACKLOG.md).

## Leads to

Next I want to build a tiny HTTP server with Node's `http` module, to
produce these headers myself instead of just reading them.