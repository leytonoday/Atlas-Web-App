import { useStore } from "@/store";
import { capitalizeFirstLetter } from "@/utils";
import { notification } from "antd";
import { useEffect, useCallback } from "react";

/**
 * Monitors the notification queue and shows notifications when the queue is updated.
 */
export const NotificationHandler = () => {
  const [notificationApi, context] = notification.useNotification();

  const showNotification = useCallback(
    (description: string, status: "success" | "error" | "info" | "warning") => {
      const notificationObject = {
        message: capitalizeFirstLetter(status),
        description: description,
      };

      switch (status) {
        case "success": {
          notificationApi.success(notificationObject);
          break;
        }
        case "info": {
          notificationApi.info(notificationObject);
          break;
        }
        case "error": {
          notificationApi.error(notificationObject);
          break;
        }
        case "warning": {
          notificationApi.warning(notificationObject);
          break;
        }
      }
    },
    [],
  );

  useEffect(() => {
    useStore.subscribe((state, prevState) => {
      if (
        state.notification.queue.length !== prevState.notification.queue.length
      ) {
        const notification = state.notification.queue.shift();
        state.notification.dequeue();

        if (notification)
          showNotification(notification.description, notification?.status);
      }
    });
  }, []);

  return <>{context}</>;
};
