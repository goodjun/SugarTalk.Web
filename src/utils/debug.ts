import moment from "moment";

export const dd = (message?: any, ...optionalParams: any[]) => {
  const datetime = moment().format("HH:mm:ss");
  console.log(datetime, message, ...optionalParams);
};
