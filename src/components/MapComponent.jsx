import { YMaps, Map, Placemark } from "@pbe/react-yandex-maps";

export default function MapComponent() {
  return (
    <div className="py-4">
      <YMaps>
        <div>
          <Map
            defaultState={{ center: [41.311153, 69.279729], zoom: 12 }}
            type="module"
            width={"100%"}
          >
            <Placemark geometry={[41.311153, 69.279729]} />
          </Map>
        </div>
      </YMaps>
    </div>
  );
}
