export type TEnergyShiftReducerAction =
  | {
      type: "Update A Single Value";
      payload: { index: number; value: number };
    }
  | {
      type: "Update All Values";
      payload: number[];
    };

export const energyShiftReducer = (
  state: number[],
  { type, payload }: TEnergyShiftReducerAction
) => {
  switch (type) {
    case "Update A Single Value": {
      const nextState = [...state];
      nextState[payload.index] = payload.value / 1000;
      return nextState;
    }
    case "Update All Values": {
      return [...payload];
    }
    default:
      throw Error("Unknown action.");
  }
};
