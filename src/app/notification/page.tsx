"use client";
import { useEffect } from "react";
import OneSignal from "react-onesignal";

const NotificationPage = () => {
  useEffect(() => {
    OneSignal.init({
      appId: "e592b679-a956-4561-8f4d-6d86e790e35f",
    });
  }, []);

  return (
    <>
      <div className="onesignal-customlink-container"></div>
    </>
  );
};

export default NotificationPage;
