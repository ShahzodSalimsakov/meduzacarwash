import { useStore } from "@nanostores/react";
import { useMemo, useState } from "react";
import { YMaps, Map, Placemark } from "@pbe/react-yandex-maps";
import * as gql from "gql-query-builder";
import { client } from "../graphqlConnect";
import {
  orderFormData as orderFormDataStore,
  setProperty as setOrderFormData,
} from "../stores/orderForm";

export default function MapComponent() {
  const orderFormData = useStore(orderFormDataStore);
  const [isLoading, setIsLoading] = useState(false);
  const requestLocation = async () => {
    setIsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          console.log(position);
          setOrderFormData("latitude", position.coords.latitude);
          console.log(position);
          setOrderFormData("longitude", position.coords.longitude);

          const { query, variables } = gql.query({
            operation: "getAddressForCoordinates",
            variables: {
              lat: {
                value: position.coords.latitude,
                required: true,
              },
              lng: {
                value: position.coords.longitude,
                required: true,
              },
            },
          });
          const { getAddressForCoordinates } = await client.request(
            query,
            variables
          );
          setOrderFormData("address", getAddressForCoordinates);
          setIsLoading(false);
        },
        (error) => {
          setIsLoading(false);
          console.log("error", error);
        }
      );
    } else {
      setIsLoading(false);
      console.log("davr");
    }
  };

  const mapState = useMemo(() => {
    if (orderFormData.latitude && orderFormData.longitude) {
      return {
        center: [orderFormData.latitude, orderFormData.longitude],
        zoom: 17,
      };
    }

    return { center: [41.311153, 69.279729], zoom: 12 };
  }, [orderFormData.latitude, orderFormData.longitude]);

  const locationCoords = useMemo(() => {
    if (orderFormData.latitude && orderFormData.longitude) {
      return [orderFormData.latitude, orderFormData.longitude];
    }
    return [41.311153, 69.279729];
  }, [orderFormData]);
  console.log("mapState", mapState);
  return (
    <div className={`${isLoading ? "animate-pulse pointer-events-none" : ""}`}>
      <button
        className="bg-primary w-full h-14 rounded-lg text-white"
        onClick={() => requestLocation()}
      >
        Определить местоположение
      </button>
      <div className="my-4 rounded-md overflow-hidden">
        <YMaps>
          <div>
            <Map state={mapState} type="module" width={"100%"}>
              <Placemark geometry={locationCoords} />
            </Map>
          </div>
        </YMaps>
      </div>
      <label
        htmlFor="address"
        className="block mb-2 text-sm font-medium text-text"
      >
        Адрес
      </label>
      <input
        type="text"
        name="address"
        id="address"
        placeholder="Адрес"
        value={orderFormData.address}
        onChange={(e) => setOrderFormData("address", e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
      />
    </div>
  );
}
