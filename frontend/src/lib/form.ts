export const parseOptionalBoolean = (value?: string) =>
  value === undefined ? undefined : value === "true";
