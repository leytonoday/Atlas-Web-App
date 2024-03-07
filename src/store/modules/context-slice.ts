import { NotificationInfo } from "@/types";
import { StateCreator } from "zustand";

/**
 * Used to store data that is to be shared between components that are not directly related.
 */
export interface IContextSlice {
  /**
   * Used for managing notifications.
   */
  notification: {
    /**
     * The queue of notifications to be displayed.
     */
    queue: NotificationInfo[];

    /**
     * Adds a notification to the queue, which will be displayed by the NotificationHandler component.
     * @param notification The notification to be added to the queue.
     */
    enqueue: (notification: NotificationInfo) => void;

    /**
     * Removes the first notification from the queue.
     * @returns The first notification in the queue.
     */
    dequeue: () => void;
  };
}

/**
 * The state creator that defines the initial state and actions for this slice.
 * @param set Setter function for this slice.
 * @param get Getter function for this slice.
 * @returns The initial state and actions for this slice.
 */
export const contextSlice: StateCreator<IContextSlice> = (set, _) => ({
  notification: {
    queue: [],
    enqueue: (notification: NotificationInfo) =>
      set((state) => ({
        notification: {
          ...state.notification,
          queue: [...state.notification.queue, notification],
        },
      })),
    dequeue: () =>
      set((state) => ({
        notification: {
          ...state.notification,
          queue: state.notification.queue.slice(1),
        },
      })),
  },
});
