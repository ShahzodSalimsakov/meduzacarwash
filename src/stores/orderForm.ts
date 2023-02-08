import { action, atom, map, computed } from "nanostores";

export interface OrderProduct {
  product_id: string;
  quantity: number;
}
export interface OrderForm {
  latitude?: number;
  longitude?: number;
  address?: string;
  productIds?: OrderProduct[];
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

export const getData = () => orderFormData.get();
