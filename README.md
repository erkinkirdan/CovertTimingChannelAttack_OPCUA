# Covert Timing Channel Attack on OPC UA

This repository hosts a demonstration of a covert timing channel attack on OPC UA.

The demonstration involves two components:

- A server script that simulates an OPC UA server and encodes a secret into timing delays between notifications.
- A client script that connects to the OPC UA server and decodes the timing delays back into the original secret.

The server script (`server.js`) is written in JavaScript, and the client script (`client.ts`) is written in TypeScript.

## Installation

This project requires Node.js to run.

To install the project, follow these steps:

1. Clone the repository: `git clone https://github.com/erkinkirdan/CovertTimingChannelAttack_OPCUA.git`
2. Navigate into the cloned repository: `cd CovertTimingChannelAttack_OPCUA`
3. Install dependencies with `npm install node-opcua`

## Running

To run the server:

```bash
node src/server/server.js [secret]
```

To run the client:

```bash
ts-node src/client/client.ts
```
