import _ from "lodash";

export const keyValueColumns = [
  {
    name: "Key",
    accessor: "key"
  },
  {
    name: "Value",
    accessor: "value"
  }
];

export const keyValueValue = value => {
  return _.values(
    _.mapValues(value, (v, k) => {
      return { key: k, value: v };
    })
  );
};
