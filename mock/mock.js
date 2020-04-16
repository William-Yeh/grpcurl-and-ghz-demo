//
// Mock server definition.
//
// This definition file is to be used with grpc-mock:
//    - https://github.com/William-Yeh/docker-grpc-mock
//

const {createMockServer} = require("grpc-mock");
const mockServer = createMockServer({
  protoPath: "/proto/route_guide.proto",
  packageName: "routeguide",
  serviceName: "RouteGuide",
  options: {
    keepCase: true  // fix: https://github.com/YoshiyukiKato/grpc-mock/issues/11
  },
  rules: [
    {
      method: "GetFeature",
      input: { // Point
        latitude: 407838351,
        longitude: -746143763
      },
      output: { // Feature
        name: "Patriots Path, Mendham, NJ 07945, USA",
        location: {
          latitude: 407838351,
          longitude: -746143763
        }
      }
    }
  ]
});
process.on('SIGINT', function() {
    console.log("Caught interrupt signal");
    process.exit();
});
mockServer.listen("0.0.0.0:50051");
