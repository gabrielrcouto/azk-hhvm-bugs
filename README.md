AZK issue: https://github.com/azukiapp/azk/issues/595

## AZK + HHVM bug example

I found a bug when trying to do some HTTP requests. The AZK HTTP Balancer is not working with NGINX + HHVM for some HTTP 1.1 methods (like OPTIONS, PATCH).

Lets see an example:

- Clone my repository, and start the containers

```bash
git clone https://github.com/gabrielrcouto/azk-hhvm-bugs.git

azk start

azk: ↑ starting `hhvm` system, 1 new instances...
azk: ✓ checking `diegomarangoni/hhvm:latest` image...
azk: ◴ waiting for `hhvm` system to start, trying connection to port fastcgi/tcp...
azk: ↑ starting `nginx` system, 1 new instances...
azk: ✓ checking `library/nginx:latest` image...
azk: ◴ waiting for `nginx` system to start, trying connection to port http/tcp...

┌───┬────────┬───────────┬────────────────────────┬───────────────────────────┬─────────────┐
│   │ System │ Instances │ Hostname/url           │ Instances-Ports           │ Provisioned │
├───┼────────┼───────────┼────────────────────────┼───────────────────────────┼─────────────┤
│ ↑ │ nginx  │ 1         │ http://hhvm.dev.azk.io │ 1-http:32795, 1-443:32794 │ -           │
│   │        │           │                        │                           │             │
├───┼────────┼───────────┼────────────────────────┼───────────────────────────┼─────────────┤
│ ↑ │ hhvm   │ 1         │ dev.azk.io             │ 1-fastcgi:9000            │ -           │
└───┴────────┴───────────┴────────────────────────┴───────────────────────────┴─────────────┘
```

- Now, send some requests to the application:

```bash
curl 'http://hhvm.dev.azk.io/index.php' -X GET
Works%

curl 'http://hhvm.dev.azk.io/index.php' -X PATCH
<html>
<head><title>502 Bad Gateway</title></head>
<body bgcolor="white">
<center><h1>502 Bad Gateway</h1></center>
<hr><center>nginx/1.9.9</center>
</body>
</html>

curl 'http://hhvm.dev.azk.io/index.php' -X DELETE
Works%

curl 'http://hhvm.dev.azk.io/index.php' -X OPTIONS
<html>
<head><title>502 Bad Gateway</title></head>
<body bgcolor="white">
<center><h1>502 Bad Gateway</h1></center>
<hr><center>nginx/1.9.9</center>
</body>
</html>

curl 'http://hhvm.dev.azk.io/index.php' -X PUT
<html>
<head><title>502 Bad Gateway</title></head>
<body bgcolor="white">
<center><h1>502 Bad Gateway</h1></center>
<hr><center>nginx/1.9.9</center>
</body>
</html>
```

As you can see, some methods works, some not. 

Lets bypass the AZK HTTP Balancer requesting directly to the container, using the HTTP port mapped by AZK (port 32795, as we can see on the AZK table above)

```bash
curl 'http://dev.azk.io:32795/index.php' -X GET
Works%

curl 'http://dev.azk.io:32795/index.php' -X PATCH
Works%

curl 'http://dev.azk.io:32795/index.php' -X DELETE
Works%

curl 'http://dev.azk.io:32795/index.php' -X OPTIONS
Works%

curl 'http://dev.azk.io:32795/index.php' -X PUT
Works%
```

Now, lets test using PHP:

- Stop the containers

```bash
azk stop
```

- Rename the Azkfile-php.js 

```bash
mv Azkfile.js Azkfile-hhvm.js
mv Azkfile-php.js Azkfile.js
```

- Start the containers

```bash
azk start

azk: ↑ starting `php` system, 1 new instances...
azk: ✓ checking `library/php:fpm` image...
azk: ◴ waiting for `php` system to start, trying connection to port fastcgi/tcp...
azk: ↑ starting `nginx` system, 1 new instances...
azk: ✓ checking `library/nginx:latest` image...
azk: ◴ waiting for `nginx` system to start, trying connection to port http/tcp...

┌───┬────────┬───────────┬───────────────────────┬───────────────────────────┬─────────────┐
│   │ System │ Instances │ Hostname/url          │ Instances-Ports           │ Provisioned │
├───┼────────┼───────────┼───────────────────────┼───────────────────────────┼─────────────┤
│ ↑ │ nginx  │ 1         │ http://php.dev.azk.io │ 1-http:32797, 1-443:32796 │ -           │
│   │        │           │                       │                           │             │
├───┼────────┼───────────┼───────────────────────┼───────────────────────────┼─────────────┤
│ ↑ │ php    │ 1         │ dev.azk.io            │ 1-fastcgi:9000            │ -           │
└───┴────────┴───────────┴───────────────────────┴───────────────────────────┴─────────────┘
```

- Send some requests to the application:

```bash
curl 'http://php.dev.azk.io/index.php' -X GET
Works%

curl 'http://php.dev.azk.io/index.php' -X PATCH
Works%

curl 'http://php.dev.azk.io/index.php' -X DELETE
Works%

curl 'http://php.dev.azk.io/index.php' -X OPTIONS
Works%

curl 'http://php.dev.azk.io/index.php' -X PUT
Works%
```
