import { Fragment, useState, FC, useMemo, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { Tab } from "@headlessui/react";
import { Trans, HeadHrefLangs } from "astro-i18next/components";
import { useTranslation } from "react-i18next";
import {
  CheckCircleIcon,
  PlusIcon,
  MinusIcon,
} from "@heroicons/react/24/outline/index";
import * as gql from "gql-query-builder";
import dayjs from "dayjs";
import {
  orderFormData as orderFormDataStore,
  setProperty as setOrderFormData,
  filled,
  getData,
} from "../stores/orderForm";
import { IProductCategory } from "../interfaces/products";
import { client } from "../graphqlConnect";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

interface WashTypeComponentProps {
  categories: IProductCategory[];
}

const WashTypeComponent: FC<WashTypeComponentProps> = ({ categories }) => {
  const { t } = useTranslation("translation");
  const [accessElectricity, setAccessElectricity] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);

  const orderFormData = useStore(orderFormDataStore);
  const filledAllData = useStore(filled);
  const setProduct = (id: string) => {
    let products = [];
    if (orderFormData?.productIds) {
      products = [...orderFormData.productIds].filter((v) => v);
    }
    products[0] = id;
    setOrderFormData("productIds", products);
  };

  const firstSelectedProduct = useMemo(() => {
    if (orderFormData?.productIds && orderFormData?.productIds.length > 0) {
      return orderFormData.productIds[0];
    }
    return null;
  }, [orderFormData.productIds]);

  const increaseProductQuantity = (id: string) => {
    let products = [];
    // if orderFormData?.productIds contains object with product_id === id then increase quantity else add new object to array with product_id === id and quantity === 1
    if (orderFormData?.productIds) {
      products = [...orderFormData.productIds];
    }
    const product = products.find((v) => v.product_id === id);
    if (product) {
      product.quantity += 1;
    } else {
      products.push({ product_id: id, quantity: 1 });
    }
    console.log(products);
    setOrderFormData("productIds", products);
  };

  const decreaseProductQuantity = (id: string) => {
    let products = [];
    // if orderFormData?.productIds contains object with product_id === id then decrease quantity else add new object to array with product_id === id and quantity === 1
    if (orderFormData?.productIds) {
      products = [...orderFormData.productIds];
      const product = products.find((v) => v.product_id === id);
      if (product) {
        if (product.quantity > 0) {
          product.quantity -= 1;
        }
      } else {
        products.push({ product_id: id, quantity: 1 });
      }
    }
    setOrderFormData("productIds", products);
  };

  const selectedProducts = useMemo(() => {
    let res = {};
    if (orderFormData?.productIds && orderFormData?.productIds.length > 0) {
      orderFormData.productIds.forEach((v) => {
        res[v.product_id] = v;
      });
    }
    return res;
  }, [orderFormData.productIds]);

  useEffect(() => {
    if (filledAllData) {
      /** @ts-ignore */
      window.Telegram.WebApp.MainButton.enable();
      /** @ts-ignore */
      window.Telegram.WebApp.onEvent("mainButtonClicked", () => {
        if (filledAllData) {
          /** @ts-ignore */
          window.Telegram.WebApp.MainButton.showProgress();
          const { query, variables } = gql.mutation({
            operation: "createOrderTg",
            variables: {
              data: {
                value: {
                  tg: window.location.search.split("=")[1],
                  delivery_address: orderFormData.address,
                  delivery_time: dayjs(
                    `${orderFormData.date} ${orderFormData.time}`
                  ).toDate(),
                  location: [orderFormData.latitude, orderFormData.longitude],
                  payment_type: orderFormData.paymentMethod,
                },
                type: "CreateOrderTgInput",
                required: true,
              },
            },
            fields: ["id"],
          });
          client.request(query, variables).then((data) => {
            console.log(data);
            console.log(orderFormData.productIds);
            const readyData = getData();
            console.log(readyData.productIds);
            const id = data.createOrderTg.id;
            const { query, variables } = gql.mutation({
              operation: "assignOrderItem",
              variables: {
                id: {
                  value: +id,
                  type: "Int",
                  required: true,
                },
                order_items: {
                  type: "[order_itemsInput!]",
                  value: orderFormData.productIds.filter((v) => v.quantity > 0),
                  required: true,
                },
              },
              fields: ["id"],
            });

            const response = client.request(query, variables);
            /** @ts-ignore */
            window.Telegram.WebApp.MainButton.hideProgress();
            /** @ts-ignore */
            window.Telegram.WebApp.close();
          });
        }
      });
    } else {
      /** @ts-ignore */
      window.Telegram.WebApp.MainButton.disable();
    }
  }, [filledAllData]);

  return (
    <div className="">
      {categories && (
        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-gray-200 p-1">
            {categories.map((category: any) => (
              <Tab
                key={category.id}
                className={({ selected }) =>
                  classNames(
                    "w-full rounded-lg py-2.5  font-medium leading-5",
                    "focus:outline-none",
                    selected ? "bg-white shadow" : "bg-gray-200"
                  )
                }
              >
                {category.name}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels className="mt-8">
            {categories.map((category: IProductCategory) => (
              <Tab.Panel
                key={category.id}
                className="rounded-xl focus:outline-none "
              >
                <div className="grid grid-cols-2 gap-4">
                  {category.products_product_categories &&
                    category.products_product_categories.length > 0 &&
                    category.products_product_categories.map((vehicle) => (
                      <div
                        key={vehicle.id}
                        className={`border rounded-2xl p-4 hover:shadow-lg bg-white cursor-pointer relative transition ease-in-out   ${
                          selectedProducts[vehicle.id]?.quantity > 0
                            ? "shadow-lg border-primary border-4"
                            : "border-transparent border-4"
                        }`}
                        // onClick={() => setProduct(vehicle.id)}
                      >
                        {firstSelectedProduct == vehicle.id && (
                          <div className="absolute left-2 top-2">
                            <CheckCircleIcon className="h-6 w-6 text-blue-500" />
                          </div>
                        )}
                        <div className="flex flex-col text-center h-full">
                          <div className="flex-grow mb-3">
                            <div>
                              <img
                                className="h-20 w-20 mx-auto"
                                src={vehicle.icon}
                                alt=""
                              />
                            </div>
                            <div className="">
                              <div className="text-sm font-medium text-gray-900">
                                {vehicle.name}
                              </div>
                              <div className="font-bold text-xl">
                                {new Intl.NumberFormat("ru").format(
                                  vehicle.price
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              className="text-white bg-primary focus:ring-4 focus:outline-none font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center mr-2"
                              onClick={() =>
                                decreaseProductQuantity(vehicle.id)
                              }
                            >
                              <MinusIcon className="w-4 h-4" />
                            </button>
                            <span className="text-gray-700 font-semibold">
                              {selectedProducts[vehicle.id]?.quantity || 0}
                            </span>
                            <button
                              type="button"
                              className="text-white bg-primary focus:ring-4 focus:outline-none font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center mr-2"
                              onClick={() =>
                                increaseProductQuantity(vehicle.id)
                              }
                            >
                              <PlusIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  {categories[0].id === 1 && category.additionalOptions && (
                    <div className="font-semibold text-gray-500 col-span-2">
                      <span>{t("main.additionalOptions")}</span>
                    </div>
                  )}
                  {category.additionalOptions &&
                    category.additionalOptions.map((option) => (
                      <div key={option.id} className="border rounded-2xl p-4">
                        <div className="w-max mx-auto">
                          <div className="flex-shrink-0">
                            <img
                              className="h-20 w-20 rounded-full"
                              src={"/images/icons/1.png"}
                              alt=""
                            />
                          </div>
                          <div className="">
                            <div className="text-sm font-medium text-gray-900">
                              {option.title}
                            </div>
                            <div className="">{option.price}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      )}
      <div className="py-4 text-text font-semibold">
        {t("main.isThreeAccessToElectricity")}
      </div>
      <div className="flex space-x-1 rounded-xl bg-gray-200 p-1 mt-2 text-center">
        <div
          className={`w-full rounded-lg py-2.5  font-medium leading-5 cursor-pointer ${
            orderFormData.hasElectricity ? "bg-white shadow" : "bg-gray-200"
          }`}
          onClick={() => setOrderFormData("hasElectricity", true)}
        >
          {t("main.yes")}
        </div>
        <div
          className={`w-full rounded-lg py-2.5  font-medium leading-5 cursor-pointer ${
            orderFormData.hasElectricity == false
              ? "bg-white shadow"
              : "bg-gray-200"
          }`}
          onClick={() => setOrderFormData("hasElectricity", false)}
        >
          {t("main.no")}
        </div>
      </div>
      <div className="py-4 text-text font-semibold">
        {t("main.paymentMethod")}
      </div>
      <div className="flex space-x-1 rounded-xl bg-gray-200 p-1 mt-2 text-center">
        <div
          className={`w-full rounded-lg py-2.5  font-medium leading-5 cursor-pointer ${
            orderFormData.paymentMethod == "cash"
              ? "bg-white shadow"
              : "bg-gray-200"
          }`}
          onClick={() => setOrderFormData("paymentMethod", "cash")}
        >
          {t("main.inCash")}
        </div>
        <div
          className={`w-full rounded-lg py-2.5  font-medium leading-5 cursor-pointer ${
            orderFormData.paymentMethod == "card"
              ? "bg-white shadow"
              : "bg-gray-200"
          }`}
          onClick={() => setOrderFormData("paymentMethod", "card")}
        >
          {t("main.online")}
        </div>
      </div>
    </div>
  );
};

export default WashTypeComponent;
