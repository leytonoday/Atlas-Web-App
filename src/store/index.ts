import { create } from "zustand";
import { IUserSlice, userSlice } from "./modules/user-slice";
import { IContextSlice, contextSlice } from "./modules/context-slice";

/**
 * A combined store interface for all store slices.
 */
interface IStore extends IUserSlice, IContextSlice {}

/**
 * A Zustand store that combines all store slices.
 */
export const useStore = create<IStore>()((...initialiser) => ({
  ...userSlice(...initialiser),
  ...contextSlice(...initialiser),
}));
