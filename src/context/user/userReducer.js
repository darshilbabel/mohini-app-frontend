import USER_INIT from "./user";
import USER_ACTIONS from "./user-actions";

const userReducer = (state, action) => {
  const { type, payload } = action;
  switch (type) {
    case USER_ACTIONS.LOGIN:
      if (!!Object.keys(payload || {})?.length)
        return {
          ...payload,
        };
      else return {};
    case USER_ACTIONS.RESET:
      return USER_INIT;
    default:
      throw new Error(`Unknown action dispatched: ${action.type}`);
  }
};

export default userReducer;
