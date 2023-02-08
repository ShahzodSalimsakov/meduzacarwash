import React, { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { gql } from "graphql-request";
import dayjs from "dayjs";
import {
  orderFormData as orderFormDataStore,
  setProperty as setOrderFormData,
  filled,
} from "../stores/orderForm";
import { client } from "../graphqlConnect";

export default function CalendarComponent() {
  const [value, onChange] = useState(new Date());
  const [times, setTimes] = useState([]);

  const orderFormData = useStore(orderFormDataStore);
  const loadTimesToDate = async (date) => {
    console.log("davr query");
    const query = gql`
      query {
        getTimesForDate(date: "${dayjs(date).format("YYYY-MM-DD")}") {
          value
        }
      }
    `;
    const { getTimesForDate } = await client.request(query);
    setTimes(getTimesForDate);
  };

  const onSelectedDate = (date) => {
    setOrderFormData("date", date.toDateString());
    loadTimesToDate(date);
    onChange(date);
  };

  useEffect(() => {
    loadTimesToDate(value);
    setOrderFormData("date", value.toDateString());
  }, []);

  return (
    <div className="flex items-center justify-center flex-col space-y-5">
      <Calendar
        onChange={onSelectedDate}
        value={value}
        onClickDay={(value, event) => console.log(value)}
        className="shadow-md rounded-xl"
        tileClassName="rounded-xl"
        showNeighboringMonth={false}
        minDate={new Date()}
        prevLabel={<FontAwesomeIcon icon={faChevronLeft} />}
        nextLabel={<FontAwesomeIcon icon={faChevronRight} />}
        prev2Label={null}
        next2Label={null}
        locale="ru-RU"
      />
      <div className="flex flex-wrap justify-center gap-4">
        {times.map((time) => (
          <button
            key={time.value}
            className={`font-bold py-2 px-4 rounded ${
              orderFormData && orderFormData.time === time.value
                ? "bg-primary text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            }`}
            onClick={() => setOrderFormData("time", time.value)}
          >
            {time.value}
          </button>
        ))}
      </div>
    </div>
  );
}
