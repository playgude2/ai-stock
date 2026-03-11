declare global {
  var sseClients: Set<ReadableStreamDefaultController>;
}
if (!global.sseClients) {
  global.sseClients = new Set();
}

export function broadcast(eventName: string, data: unknown) {
  const message = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
  const encoded = new TextEncoder().encode(message);

  for (const client of global.sseClients) {
    try {
      client.enqueue(encoded);
    } catch {
      global.sseClients.delete(client);
    }
  }
}

export function addClient(controller: ReadableStreamDefaultController) {
  global.sseClients.add(controller);
}

export function removeClient(controller: ReadableStreamDefaultController) {
  global.sseClients.delete(controller);
}
