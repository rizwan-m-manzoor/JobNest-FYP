export const toPKRCurrency = (amount: number) => {
  let formatter = new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
  });

  return formatter.format(amount).toString().slice(0, -3);
};
