export function startRiskFeed(
  wsServer: any
) {
  setInterval(() => {
    wsServer.clients.forEach(
      (client: any) => {
        client.send(
          JSON.stringify({
            type: "RISK_FEED_EVENT",

            data: {
              message:
                "Live contract scan processed",

              score: Math.floor(
                Math.random() * 100
              ),

              timestamp: Date.now(),
            },
          })
        );
      }
    );
  }, 4000);
}
