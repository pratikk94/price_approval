export const backend_url = "http://192.168.13.129:3001/";
export const backend_mvc = "http://192.168.13.129:3000/";

export const statusFilters = new Map([
  [0, "Draft"],
  [1, "Pending"],
  [2, "P Approved"],
  [3, "Rejected"],
  [4, "Rework"],
  [5, "Blocked"],
  [6, "Approved"],
]);

export const STATUS = Object.freeze({
  DRAFT: "-1",
  PENDING: "0",
  APPROVED: "1",
  REJECTED: "2",
  REWORK: "3",
  BLOCKED: "4",
  EXTENSION: "5",
  COPY: "6",
  MERGE: "7",
});
