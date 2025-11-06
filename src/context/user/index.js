import createStore from "../../utils/createStore";
import USER_INIT from "./user";
import userReducer from "./userReducer";

const [UserProvider, useUserDispatcher, useUserStore] = createStore(
    userReducer,
    USER_INIT
);

export { UserProvider, useUserDispatcher, useUserStore };