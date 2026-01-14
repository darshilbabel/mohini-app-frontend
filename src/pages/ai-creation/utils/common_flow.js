import { bot_routes, FLOW_TYPES } from "../../../configure";
import { sessionFlowName } from "../../ShikshalokamVoiceChat/enum";

export const getBotConfigForFlow = (flowType) => {
    switch (flowType) {
      case FLOW_TYPES.LFA:
        return { route: bot_routes.lfa_bot, flow_name: sessionFlowName.lfa };
      case FLOW_TYPES.LCF:
        return { route: bot_routes.lcf_bot, flow_name: sessionFlowName.lcf };
      case FLOW_TYPES.FREE_FLOW:
        return { route: bot_routes.free_flow_bot, flow_name: sessionFlowName.free_flow };
      default:
        return { route: bot_routes.free_flow_bot, flow_name: sessionFlowName.free_flow };
    }
};
