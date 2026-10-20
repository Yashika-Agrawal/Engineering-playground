# Content-Type and how the browser reads a response

Stage: a response arrives at the browser

![Request and response](diagrams/request-response.png)

- The server sends bytes plus headers. The `Content-Type` header tells the browser how to treat them: `text/html` renders as a page, `text/css` as a stylesheet, `application/json` as data.
- A web server is a program that answers HTTP requests on a port. It can return HTML, JSON, images, files or video, not only HTML.
- A URL has a fixed shape: `scheme://host:port/path?query#fragment`. The fragment never leaves the browser.
- The WWW was three ideas designed together: HTML (documents with links), URLs (addresses) and HTTP (the protocol to fetch them).
- `www` is just a subdomain that sites use by convention, not a type of server. `chaicode.com` sending me to `www.chaicode.com` is the owner picking one main address and redirecting the other (a 301 with a `Location` header).
- The browser's HTML parser collapses newlines and extra spaces into one space, which is why plain text lines ran together. Layout needs markup like `<br>` and `<p>`.

**Key takeaway:** The browser decides what a response is from the Content-Type header, not from the content itself.

Next: [Browser page load](browser-page-load.md)
