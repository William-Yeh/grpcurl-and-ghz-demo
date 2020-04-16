# gRPCurl & ghz Demo

A simple demo for 2 useful gRPC tools: [gRPCurl](https://github.com/fullstorydev/grpcurl) and [ghz](https://github.com/bojand/ghz).

An [article](https://william-yeh.net/post/2020/04/grpc-testing-tools/) (in Chinese) for this demo is also available.


## About the demo code

Some files of this demo are borrowed from "[the route guide server and client](https://github.com/grpc/grpc-go/tree/master/examples/route_guide)" in the "[gRPC-Go: The Go implementation of gRPC](https://github.com/grpc/grpc-go)" repo ("gRPC-Go" for short).

Directories and files:

- `routeguide/`: gRPC definition; copied from "gRPC-Go".
- `server/`: server code; copied from "gRPC-Go".

- `server-new/`: modified server code with reflection.
- `mock/`: mock server with [grpc-mock](https://github.com/William-Yeh/docker-grpc-mock).

- `testdata.dat`: 100 test data for gRPCurl.
- `testdata.json`: 100 test data for ghz.

- `out/`: generated executables.


## Environment requirements

The following software is required to run the demo:

 - Go 1.14 or above.
 - [gRPCurl](https://github.com/fullstorydev/grpcurl) 1.5.0 or above.
 - [ghz](https://github.com/bojand/ghz) 0.51.0 or above.
 

## Build

Execute the `build.sh` script:

```bash
$ ./build.sh
```

You'll obtain the generated executables in `out/` directory:

```bash
$ ls -l out
total 50408
-rwxr-xr-x   1 william.yeh  staff  12705500 Apr 11 14:52 server
-rwxr-xr-x   1 william.yeh  staff  13102252 Apr 11 14:52 server-new
```

## Run servers

Run the old server at `127.0.0.1:10000`:

```bash
$ out/server
```

Run the new server at `127.0.0.1:20000`:

```bash
$ out/server-new
```

Run the mock server at `127.0.0.1:50051`:

```
$ docker run -tid \
    --name mock --rm -p 50051:50051 \
    -v $(pwd)/routeguide:/proto \
    -v $(pwd)/mock:/mock        \
    williamyeh/grpc-mock /mock/mock.js
```


## Test with proto files

The old server doesn't support gRPC reflection, and clients should have knowledge of its interface definition in order to call it.

Test the old server (`127.0.0.1:10000`) with gRPCurl + proto files:

```bash
$ grpcurl -plaintext -d '@'    \
    -import-path ./routeguide  \
    -proto route_guide.proto   \
    127.0.0.1:10000  \
    routeguide.RouteGuide.RecordRoute  \
  < testdata.dat
```

## Test with proto files against mock server

The mock server with [grpc-mock](https://github.com/William-Yeh/docker-grpc-mock) doesn't support gRPC reflection, and clients should have knowledge of its interface definition in order to call it.

Test the mock server (`127.0.0.1:50051`) with gRPCurl + proto files:

```
$ grpcurl -plaintext \
    -d '{"latitude":407838351, "longitude":-746143763}' \
    -import-path ./routeguide  \
    -proto route_guide.proto   \
    127.0.0.1:50051   \
    routeguide.RouteGuide.GetFeature
```

## Test without proto files

The new server supports gRPC reflection, and clients don't need to have full knowledge of its interface definition in order to call it.

Get interface of the new server (`127.0.0.1:20000`) with gRPCurl:

```bash
$ grpcurl -plaintext \
    127.0.0.1:20000  \
    describe
```

Test the new server (`127.0.0.1:20000`) with gRPCurl:

```bash
$ grpcurl -plaintext -d '@' \
    127.0.0.1:20000         \
    routeguide.RouteGuide.RecordRoute  \
  < testdata.dat
```


## Benchmark

Benchmark the old server (`127.0.0.1:10000`) with ghz + proto files for 20 seconds:

```bash
$ ghz --insecure --data=@  -z 20s  \
      --import-paths ./routeguide  \
      --proto route_guide.proto    \
      --call routeguide.RouteGuide.RecordRoute  \
      127.0.0.1:10000  \
  < testdata.json
```

Benchmark the new server (`127.0.0.1:20000`) with ghz for 20 seconds:

```bash
$ ghz --insecure --data=@  -z 20s  \
      --call routeguide.RouteGuide.RecordRoute  \
      127.0.0.1:20000  \
  < testdata.json
```
