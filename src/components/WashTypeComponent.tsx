import { Fragment, useState } from "react";
import i18next, { t } from "i18next";
import { Tab } from "@headlessui/react";

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
        },
        {
          id: 2,
          title: "pickup",
          price: "100000 sum",
        },
      ],
    },
    {
      id: 2,
      title: t("main.other"),
    },
  ]);
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
          <Tab.Panels className="mt-2">
            {categories.map((category) => (
              <Tab.Panel
                key={category.id}
                className={classNames(
                  "rounded-xl bg-white p-3",
                  " focus:outline-none "
                )}
              >
                {category.title}
                <div className="grid grid-cols-2">
                  {category.vehicles &&
                    category.vehicles.map((vehicle) => (
                      <div key={vehicle.id}>
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-full"
                              src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
                              alt=""
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {vehicle.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {vehicle.price}
                            </div>
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
    </div>
  );
}
