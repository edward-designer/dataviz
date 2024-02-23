"use client";

import { request, gql, GraphQLClient } from "graphql-request";
import { useQuery, useMutation } from "@tanstack/react-query";
import { UserContext } from "@/context/user";
import { useContext } from "react";

const gqlEndPoint = "https://api.octopus.energy/v1/graphql/";

interface GreennessForecast {
  greennessForecast: {
    greennessForecast: {
      validFrom: string;
      validTo: string;
      greennessScore: number;
      greennessIndex: string;
      highlightFlag: boolean;
    }[];
  };
}

interface ObtainJWT {
  obtainKrakenToken: {
    token: string;
  };
}

enum ConsumptionGroupings {
  DAY = "DAY",
}

const postsQueryDocument = gql`
  query GreennessForecast {
    greennessForecast {
      validFrom
      validTo
      greennessScore
      greennessIndex
      highlightFlag
    }
  }
`;

const getJwtMutation = gql`
  mutation ObtainKrakenToken($input: ObtainJSONWebTokenInput!) {
    obtainKrakenToken(input: $input) {
      token
      payload
      refreshToken
      refreshExpiresIn
    }
  }
`;

const getCostOfUsage = gql`
  query CostOfUsage(
    $accountNumber: String
    $meterId: String
    $fuelType: FuelType
    $startAt: DateTime
    $grouping: ConsumptionGroupings!
    $timezone: String
  ) {
    costOfUsage(
      accountNumber: $accountNumber
      meterId: $meterId
      fuelType: $fuelType
      startAt: $startAt
      grouping: $grouping
      timezone: $timezone
    ) {
      costEnabled
      direction
      details(grouping: $grouping) {
        cost
        usageKwh
      }
    }
  }
`;

const GraphQLContainer = () => {
  const { value } = useContext(UserContext);
  const APIKey = value.apiKey;

  const graphQLClient = new GraphQLClient(gqlEndPoint);

  const { data } = useQuery<GreennessForecast>({
    queryKey: ["testing"],
    queryFn: async () => request(gqlEndPoint, postsQueryDocument),
  });

  const { data: dataMutation } = useQuery<ObtainJWT>({
    queryKey: ["testing2"],
    queryFn: async () =>
      await graphQLClient.request(getJwtMutation, {
        input: { APIKey: "sk_live_4BI03o44WGHDztCW1u0nCx6Z" },
      }),
  });

  const graphQLClientWithJWT = new GraphQLClient(gqlEndPoint, {
    headers: {
      Authorization: dataMutation?.obtainKrakenToken?.token ?? "",
    },
  });

  console.log(dataMutation?.obtainKrakenToken?.token);

  const { data: dataCost } = useQuery({
    queryKey: ["testing3"],
    queryFn: async () =>
      await graphQLClientWithJWT.request(getCostOfUsage, {
        accountNumber: "A-C804AB66",
        meterId: "18L2112787",
        fuelType: "ELECTRICITY",
        startAt: "2023-01-01T00:00:00.000Z",
        grouping: "DAY" as ConsumptionGroupings,
        timezone: "Europe/London",
      }),
    enabled: !!dataMutation?.obtainKrakenToken?.token,
  });

  return (
    <div className="lg:col-[content] my-4">
      <div className="flex items-center justify-center">testing</div>
    </div>
  );
};

export default GraphQLContainer;
