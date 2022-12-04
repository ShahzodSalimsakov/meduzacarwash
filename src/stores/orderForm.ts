import { action, atom, map } from "nanostores";

export interface OrderForm {
  latitude?: number;
  longitude?: number;
  address?: string;
  productIds?: string[];
  hasElectricity?: boolean;
  paymentMethod?: string;
}

export const orderFormData = map<OrderForm>({
  hasElectricity: true,
  paymentMethod: "cash",
});

export const setProperty = (key: string, value: any) => {
  orderFormData.setKey(key as keyof OrderForm, value);
};
