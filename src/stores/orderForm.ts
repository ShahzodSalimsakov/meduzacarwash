import { action, atom, map, computed } from "nanostores";

export interface OrderForm {
  latitude?: number;
  longitude?: number;
  address?: string;
  productIds?: string[];
  hasElectricity?: boolean;
  paymentMethod?: string;
  date?: string;
  time?: string;
}

export const orderFormData = map<OrderForm>({
  hasElectricity: true,
  paymentMethod: "cash",
});

export const setProperty = (key: string, value: any) => {
  orderFormData.setKey(key as keyof OrderForm, value);
};

export const filled = computed(orderFormData, (data) => {
  const {
    address,
    productIds,
    date,
    time,
    hasElectricity,
    latitude,
    longitude,
    paymentMethod,
  } = data;
  console.log(
    "computed",
    address &&
      productIds &&
      date &&
      time &&
      hasElectricity != undefined &&
      latitude &&
      longitude &&
      paymentMethod
  );
  return (
    address &&
    productIds &&
    date &&
    time &&
    hasElectricity != undefined &&
    latitude &&
    longitude &&
    paymentMethod
  );
});
