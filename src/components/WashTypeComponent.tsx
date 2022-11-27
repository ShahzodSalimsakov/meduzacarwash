import { Fragment, useState, FC } from "react";
import { Tab } from "@headlessui/react";
import { Trans, HeadHrefLangs } from "astro-i18next/components";
import { useTranslation } from "react-i18next";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { IProductCategory } from "../interfaces/products";

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
                className={classNames(
                  "rounded-xl bg-white",
                  " focus:outline-none "
                )}
              >
                <div className="grid grid-cols-2 gap-10">
                  {category.products_product_categories &&
                    category.products_product_categories.length > 0 &&
                    category.products_product_categories.map((vehicle) => (
                      <div
                        key={vehicle.id}
                        className={`border rounded-2xl p-4 hover:shadow-lg cursor-pointer relative ${
                          selectedProduct == vehicle.id ? "shadow-lg" : ""
                        }`}
                        onClick={() => setSelectedProduct(vehicle.id)}
                      >
                        {selectedProduct == vehicle.id && (
                          <div className="absolute left-2 top-2">
                            <CheckCircleIcon className="h-6 w-6 text-blue-500" />
                          </div>
                        )}
                        <div className="flex items-center justify-center">
                          {/* <div className="flex-shrink-0">
                            <img
                              className="h-20 w-20 rounded-full"
                              src={vehicle.image}
                              alt=""
                            />
                          </div> */}
                          <div className="">
                            <div className="text-sm font-medium text-gray-900">
                              {vehicle.name}
                            </div>
                            <div className="">{vehicle.price}</div>
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
      <div className="py-4">{t("main.isThreeAccessToElectricity")}</div>
      <div className="flex space-x-1 rounded-xl bg-gray-200 p-1 mt-2 text-center">
        <div
          className={
            accessElectricity
              ? "w-full rounded-lg py-2.5  font-medium leading-5 bg-white shadow"
              : "w-full rounded-lg py-2.5  font-medium leading-5 shadow bg-gray-200"
          }
        >
          {t("main.yes")}
        </div>
        <div className="w-full rounded-lg py-2.5  font-medium leading-5 bg-gray-200">
          {t("main.no")}
        </div>
      </div>
      <div className="py-4">{t("main.paymentMethod")}</div>
      <div className="flex space-x-1 rounded-xl bg-gray-200 p-1 mt-2 text-center">
        <div
          className={
            accessElectricity
              ? "w-full rounded-lg py-2.5  font-medium leading-5 bg-white shadow"
              : "w-full rounded-lg py-2.5  font-medium leading-5 shadow bg-gray-200"
          }
        >
          {t("main.inCash")}
        </div>
        <div className="w-full rounded-lg py-2.5  font-medium leading-5 bg-gray-200">
          {t("main.online")}
        </div>
      </div>
    </div>
  );
};

export default WashTypeComponent;
