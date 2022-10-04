import React, { useState } from "react";
import Calendar from "react-calendar";

export default function CalendarComponent() {
  const [value, onChange] = useState(new Date());
  return (
    <div>
      <Calendar
        onChange={onChange}
        value={value}
        locale="ru"
        onClickDay={(value, event) => console.log(value.getDate())}
      />
    </div>
  );
}
