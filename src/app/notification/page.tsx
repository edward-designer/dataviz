"use client";
import { Notifications } from "react-push-notification";
import addNotification from "react-push-notification";

const NotificationPage = () => {
  const sendNotification = () => {
    addNotification({
      title: "Warning",
      subtitle: "This is a subtitle",
      message: "This is a very long message",
      theme: "darkblue",
      native: true, // when using native, your OS will handle theming.
    });
  };

  return (
    <>
      <Notifications />
      <button onClick={sendNotification}>Show Notification</button>
    </>
  );
};

export default NotificationPage;
