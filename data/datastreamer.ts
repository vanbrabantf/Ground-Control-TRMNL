import { LightstreamerClient, Subscription } from "lightstreamer-client-node";
import { subscribe } from "./subscriber.ts";

export function getSnapshot(): Promise<Record<string, Record<string, string>>> {
  const lsClient = new LightstreamerClient(
    "http://push.lightstreamer.com",
    "ISSLIVE"
  );

  addServerEventListeners(lsClient);
  const subscription = subscribe();

  const snapshot = getASnapshot(subscription, lsClient);

  lsClient.subscribe(subscription);
  lsClient.connect();

  return snapshot;
}

function addServerEventListeners(lsClient: LightstreamerClient): void {
  lsClient.addListener({
    onServerError: (errorCode: number, errorMessage: string) => {
      console.error(`Server error: [${errorCode}] ${errorMessage}`);
    },
  });
}

function getASnapshot(
  subscription: Subscription,
  lsClient: LightstreamerClient
): Promise<Record<string, Record<string, string>>> {
  return new Promise((resolve, reject) => {
    const snapshotData: Record<string, Record<string, string>> = {};

    subscription.addListener({
      onItemUpdate: (update) => {
        snapshotData[update.getItemName()] = {
          TimeStamp: update.getValue("TimeStamp"),
          Value: update.getValue("Value"),
        };
        // Check if all items have been processed
        if (
          Object.keys(snapshotData).length === subscription.getItems().length
        ) {
          lsClient.unsubscribe(subscription);
          lsClient.disconnect();

          resolve(snapshotData);
        }
      },
      onSubscriptionError: (errorCode, errorMessage) => {
        console.error(`Subscription error: [${errorCode}] ${errorMessage}`);
        reject(new Error(`Subscription error: [${errorCode}] ${errorMessage}`));
      },
    });
  });
}
