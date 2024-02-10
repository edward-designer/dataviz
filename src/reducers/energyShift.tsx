export type TEnergyShiftReducerAction =
  | {
      type: "Update A Single Value";
      payload: { index: number; value: number };
    }
  | {
      type: "Update All Values";
      payload: number[];
    }
  | {
      type: "Reset";
      payload: number[];
    }
  | {
      type: "Remove All Peak Use";
      payload: boolean[] | undefined;
    }
  | {
      type: "Offset Import with Export";
      payload: { from: number[]; to: number[] };
    }
  | {
      type: "Shift Import to Only Cheap Periods";
      payload: boolean[] | undefined;
    }
  | {
      type: "Double Export";
      payload: "";
    };

export const energyShiftReducer = (
  state: number[],
  { type, payload }: TEnergyShiftReducerAction
) => {
  switch (type) {
    case "Reset": {
      return [...payload];
    }
    case "Update A Single Value": {
      const nextState = [...state];
      nextState[payload.index] = payload.value / 1000;
      return nextState;
    }
    case "Update All Values": {
      return [...payload];
    }
    case "Remove All Peak Use": {
      if (payload) return state.map((data, i) => (payload[i] ? 0 : data));
      return state;
    }
    case "Offset Import with Export": {
      return payload.from.map((data, i) =>
        data - payload.to[i] > 0 ? data - payload.to[i] : 0
      );
    }
    case "Shift Import to Only Cheap Periods": {
      if (payload) {
        const totalImport = state.reduce((acc, cur) => acc + cur, 0);
        const totalGoodPeriods = payload.reduce(
          (acc, cur) => acc + (cur ? 1 : 0),
          0
        );
        return state.map((data, i) =>
          payload[i] ? totalImport / totalGoodPeriods : 0
        );
      }
      return state;
    }
    case "Double Export": {
      return state.map((data) => data * 2);
    }
    default:
      throw Error("Unknown action.");
  }
};
