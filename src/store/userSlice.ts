import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../models/uml/User";
import { LocalStorageProvider } from "../storage/LocalStorageProvider";

interface UserState {
    user: User | null;
}

const storage = new LocalStorageProvider();
const storedUser = storage.getItem("user");

const initialState: UserState = {
    user: storedUser ? JSON.parse(storedUser) : null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<User | null>) => {
            state.user = action.payload;
            if (action.payload) {
                storage.setItem("user", JSON.stringify(action.payload));
            } else {
                storage.removeItem("user");
            }
        },
        clearUser: (state) => {
            state.user = null;
            storage.removeItem("user");
            storage.removeItem("access_token");
            storage.removeItem("token_type");
        },
    },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;