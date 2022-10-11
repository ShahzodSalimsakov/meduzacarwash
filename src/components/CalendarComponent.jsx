import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

export default function CalendarComponent() {
  const [value, onChange] = useState(new Date());
  return (
    <div className="mx-6">
      <Calendar
        onChange={onChange}
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
    </div>
  );
}
