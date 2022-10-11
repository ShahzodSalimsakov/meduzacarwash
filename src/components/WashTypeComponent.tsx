import { Fragment, useState } from "react";
import i18next, { t } from "i18next";
import { Tab } from "@headlessui/react";
import { Trans, HeadHrefLangs } from "astro-i18next/components";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
export default function WashTypeComponent() {
  let [categories] = useState([
    {
      id: 1,
      title: t("main.standard"),
      vehicles: [
        {
          id: 1,
          title: "Sedan",
          price: "80000 sum",
          image: "/images/icons/1.png",
        },
        {
          id: 2,
          title: "pickup",
          price: "100000 sum",
          image: "/images/icons/2.png",
        },
        {
          id: 3,
          title: "Sedan",
          price: "80000 sum",
          image: "/images/icons/3.png",
        },
        {
          id: 4,
          title: "pickup",
          price: "100000 sum",
          image: "/images/icons/4.png",
        },
      ],
      additionalOptions: [
        {
          id: 1,
          title: "Interior",
          price: "10000 sum",
          image: "/images/icons/5.png",
        },
        {
          id: 2,
          title: "Exterior",
          price: "10000 sum",
          image: "/images/icons/6.png",
        },
      ],
    },
    {
      id: 2,
      title: t("main.other"),
      vehicles: [
        {
          id: 1,
          title: "area",
          price: "80000 kv.m",
        },
      ],
    },
  ]);
  const [accessElectricity, setAccessElectricity] = useState(true);
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
                {category.id}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels className="mt-8">
            {categories.map((category) => (
              <Tab.Panel
                key={category.id}
                className={classNames(
                  "rounded-xl bg-white",
                  " focus:outline-none "
                )}
              >
                <div className="grid grid-cols-2 gap-10">
                  {category.vehicles &&
                    category.vehicles.map((vehicle) => (
                      <div key={vehicle.id} className="border rounded-2xl p-4">
                        <div className="w-max mx-auto">
                          <div className="flex-shrink-0">
                            <img
                              className="h-20 w-20 rounded-full"
                              src={vehicle.image}
                              alt=""
                            />
                          </div>
                          <div className="">
                            <div className="text-sm font-medium text-gray-900">
                              {vehicle.title}
                            </div>
                            <div className="">{vehicle.price}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  {categories[0].id === 1 && category.additionalOptions && (
                    <div className="font-semibold text-gray-500 col-span-2">
                      {t("main.additionalOptions")}
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
}
