import { create } from 'zustand'
import { createSessionStore } from 'store/store.config'
import { STORE_NAME_CONSTANTS } from 'store/constants'
import { INITIAL_STATE } from './state';

const initialState = INITIAL_STATE;

const useChatDataSessionStore = create(
    createSessionStore(
        STORE_NAME_CONSTANTS.CHAT_DATA,
        initialState 
    )
)

export default useChatDataSessionStore;