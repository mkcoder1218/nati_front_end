import { configureStore, combineReducers, AnyAction } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import officeReducer from "./slices/officeSlice";
import reviewReducer from "./slices/reviewSlice";
import serviceGuideReducer from "./slices/serviceGuideSlice";
import sentimentReducer from "./slices/sentimentSlice";
import uiReducer from "./slices/uiSlice";
import governmentStatsReducer from "./slices/governmentStatsSlice";
import adminReducer from "./slices/adminSlice";
import voteReducer from "./slices/voteSlice";
import officeVoteReducer from "./slices/officeVoteSlice";
import notificationReducer from "./slices/notificationSlice";
import commentReducer from "./slices/commentSlice";
import reviewReplyReducer from "./slices/reviewReplySlice";
import reportReducer from "./slices/reportSlice";
import scheduledReportReducer from "./slices/scheduledReportSlice";

// Define a root action to reset the entire store
export const RESET_STATE = "RESET_STATE";

// Create a root reducer that can handle the reset action
const appReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  office: officeReducer,
  review: reviewReducer,
  serviceGuide: serviceGuideReducer,
  sentiment: sentimentReducer,
  ui: uiReducer,
  governmentStats: governmentStatsReducer,
  admin: adminReducer,
  vote: voteReducer,
  officeVote: officeVoteReducer,
  notification: notificationReducer,
  comment: commentReducer,
  reviewReply: reviewReplyReducer,
  report: reportReducer,
  scheduledReport: scheduledReportReducer,
});

// Root reducer that wraps the app reducer and handles the reset action
const rootReducer = (
  state: ReturnType<typeof appReducer> | undefined,
  action: AnyAction
) => {
  // When the RESET_STATE action is dispatched, return a fresh state
  if (action.type === RESET_STATE) {
    return appReducer(undefined, action);
  }

  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializable check for development
    }),
  devTools: process.env.NODE_ENV !== "production",
});

// Action creator for resetting the state
export const resetState = () => ({
  type: RESET_STATE,
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof appReducer>;
export type AppDispatch = typeof store.dispatch;
