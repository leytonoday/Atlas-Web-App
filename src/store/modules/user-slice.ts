import { ICreditTracker, IWhoAmI } from "@/types";
import { StateCreator } from "zustand";

/**
 * Used to store user specific data.
 */
export interface IUserSlice {
  whoAmI?: IWhoAmI;
  setWhoAmI: (whoAmI?: IWhoAmI) => void;

  creditTracker: ICreditTracker;
  setCreditTracker: (creditTracker: ICreditTracker) => void;
}

/**
 * The state creator that defines the initial state and actions for this slice.
 * @param set Setter function for this slice.
 * @param get Getter function for this slice.
 * @returns The initial state and actions for this slice.
 */
export const userSlice: StateCreator<IUserSlice> = (set, _) => ({
  whoAmI: undefined,
  setWhoAmI: (whoAmI) => set({ whoAmI }),

  creditTracker: {
    maxCreditCount: 0,
    currentCreditCount: 0,
  },

  setCreditTracker: (creditTracker) => set({ creditTracker }),
});
