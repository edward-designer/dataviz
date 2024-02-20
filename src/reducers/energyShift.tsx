export type TEnergyShiftReducerAction =
  | {
      type: "Update A Single Value";
      payload: { index: number; value: number };
    }
  | {
      type: "Update A Single Value With Battery";
      payload: { index: number; value: number; from: number[]; to: number[] };
    }
  | {
      type: "Update All Values";
      payload: number[];
    }
  | {
      type: "Reset";
      payload: number[] | undefined;
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
    }
  | {
      type: "Add Solar";
      payload: { addSolar: boolean; totalCapacity: number };
    };

export const energyShiftReducer = (
  state: number[],
  { type, payload }: TEnergyShiftReducerAction
) => {
  switch (type) {
    case "Reset": {
      if (payload === undefined)
        return [
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0,
        ];
      return [...payload];
    }
    case "Update A Single Value": {
      const nextState = [...state];
      nextState[payload.index] = payload.value / 1000;
      return nextState;
    }
    case "Update A Single Value With Battery": {
      const nextState = [...state];
      console.log( payload.from[payload.index])
      nextState[payload.index] =
        nextState[payload.index] +
        payload.value / 1000 -
        payload.from[payload.index];
      return nextState;
    }
    case "Update All Values": {
      return [...payload];
    }
    case "Add Solar": {
      if (payload.addSolar && payload.totalCapacity) {
        const defaultProfile = [
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 21, 71, 162,
          286, 404, 510, 590, 627, 644, 631, 643, 622, 609, 554, 511, 450, 358,
          266, 167, 97, 44, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ];
        const defaultProfileTotal = defaultProfile.reduce(
          (acc, cur) => cur + acc,
          0
        );
        const ratio = payload.totalCapacity / defaultProfileTotal / 1000;
        return defaultProfile.map((value) => value * ratio);
      }
      return [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ];
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
