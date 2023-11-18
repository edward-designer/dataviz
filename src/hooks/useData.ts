import { useState, useEffect } from "react";
import { json, csv } from "d3";

export interface IDataItem {}
export type IData = IDataItem[];

export const useData = (url: string): IData | null => {
  const [data, setData] = useState<null | IData>(null);

  useEffect(() => {
    try {
      const extension = url.substring(url.lastIndexOf(".") + 1);
      switch (extension) {
        case "json":
          json(url).then((data) => {
            if (data) {
              setData(data as IData);
            }
          });
          break;
        case "csv":
          csv(url).then((data) => {
            if (data) {
              setData(data as unknown as IData);
            }
          });
          break;
        default:
          break;
      }
    } catch (e) {
      console.error(e);
    }
  }, [url]);

  return data;
};
