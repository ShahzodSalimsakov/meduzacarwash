import { useState } from "react";
import { useStore } from "@nanostores/react";
import { useTranslation } from "react-i18next";

export default function ClientCommentComponent() {
  const { t } = useTranslation("translation");
  const [comment, setComment] = useState("");

  const onCommentChange = (e) => {
    setComment(e.target.value);
  };

  console.log(comment);

  return (
    <div className="flex flex-col space-y-5">
      <div className="py-4 text-text font-semibold">
        <label className="text-gray-700 font-semibold">
          {t("main.comment")}
        </label>
      </div>
      <textarea
        className="shadow-lg rounded-xl p-2 textarea textarea-info border-grey-300 border-2 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent"
        onChange={onCommentChange}
        value={comment}
      />
    </div>
  );
}
