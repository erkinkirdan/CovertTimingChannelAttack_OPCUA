import {
    OPCUAClient,
    MessageSecurityMode,
    SecurityPolicy,
    AttributeIds,
    ClientSubscription,
    TimestampsToReturn,
    MonitoringParametersOptions,
    ReadValueIdOptions,
    ClientMonitoredItem,
    DataValue
} from "node-opcua";
import os from "os";

const connectionStrategy = {
    initialDelay: 1000,
    maxRetry: 1
};

const client = OPCUAClient.create({
    applicationName: "MyClient",
    connectionStrategy: connectionStrategy,
    securityMode: MessageSecurityMode.None,
    securityPolicy: SecurityPolicy.None,
    endpointMustExist: false
});

const endpointUrl = "opc.tcp://" + os.hostname() + ":4334/UA/MyLittleServer";

async function timeout(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
    try {
        await client.connect(endpointUrl);
        console.log("connected !");

        const session = await client.createSession();
        console.log("session created !");

        const subscription = ClientSubscription.create(session, {
            requestedPublishingInterval: 1000,
            requestedLifetimeCount: 100,
            requestedMaxKeepAliveCount: 10,
            maxNotificationsPerPublish: 100,
            publishingEnabled: true,
            priority: 10
        });

        subscription.on("started", () => {
            console.log("subscription started - subscriptionId=", subscription.subscriptionId);
        }).on("keepalive", () => {
            console.log("keepalive");
        }).on("terminated", () => {
            console.log("terminated");
        });

        const itemToMonitor: ReadValueIdOptions = {
            nodeId: "ns=1;s=my_node",
            attributeId: AttributeIds.Value
        };

        const parameters: MonitoringParametersOptions = {
            samplingInterval: 100,
            discardOldest: true,
            queueSize: 10
        };

        const monitoredItem = ClientMonitoredItem.create(subscription, itemToMonitor, parameters, TimestampsToReturn.Both);

        let lastChange = Date.now();
        let binaryString = "";
        const delimiter = "111111110";

        monitoredItem.on("changed", (dataValue: DataValue) => {
            let delay = Date.now() - lastChange;
            lastChange = Date.now();
            let bit = delay > 1500 ? '0' : '1';
            console.log(`Observed delay: ${delay / 1000} seconds, decoded bit: ${bit}`);
            binaryString += bit;
            if (binaryString.endsWith(delimiter)) {
                binaryString = binaryString.slice(0, -delimiter.length);
                let charBits = binaryString.match(/.{1,8}/g);
                if (charBits) {
                    let message = charBits.map(bits => String.fromCharCode(parseInt(bits, 2))).join('');
                    console.log(`Decoded message: ${message}`);
                    binaryString = "";
                }
            }
        });
        
        await timeout(1000000)

        console.log("now terminating subscription");
        await subscription.terminate();

        await session.close();

        await client.disconnect();
        console.log("done !");
    } catch (err) {
        console.log("An error has occurred : ", err);
    }
}

main();
