const { OPCUAServer, Variant, DataType } = require("node-opcua");

const serverSetup = async () => {
    const server = new OPCUAServer({
        port: 4334,
        resourcePath: "/UA/MyLittleServer",
        buildInfo: {
            productName: "MySampleServer1",
            buildNumber: "7658",
            buildDate: new Date(2014, 5, 2)
        }
    });

    await server.initialize();
    console.log("Server initialized");

    const addressSpace = server.engine.addressSpace;
    const namespace = addressSpace.getOwnNamespace();

    const device = namespace.addObject({
        organizedBy: addressSpace.rootFolder.objects,
        browseName: "MyDevice"
    });

    let x = 11;
    const secret = process.argv[2];
    const encodedSecret = Array.from(Buffer.from(secret)).map(e => e.toString(2).padStart(8, '0')).join('');
    const delimiter = "111111110";
    const signal = delimiter + encodedSecret;
    let currentBitIndex = 0;

    const toggleX = () => {
        x = x === 11 ? 12 : 11;
        const delay = signal[currentBitIndex] === '1' ? 1000 : 2000;
        console.log(`Encoded delay: ${delay / 1000} seconds for bit: ${signal[currentBitIndex]}`);
        currentBitIndex = (currentBitIndex + 1) % signal.length;
        setTimeout(toggleX, delay);
    };

    toggleX();

    const return_value = () => x;

    namespace.addVariable({
        componentOf: device,
        nodeId: "s=my_node",
        browseName: "MyNode",
        dataType: "Double",
        value: {
            get: () => new Variant({ dataType: DataType.Double, value: return_value() })
        }
    });

    server.start(() => {
        console.log("Server is now listening ... (press CTRL+C to stop)");
        console.log("port", server.endpoints[0].port);
        const endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl;
        console.log("The primary server endpoint URL is", endpointUrl);
    });
};

serverSetup();
