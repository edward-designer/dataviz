"use client";

const NotificationPage = () => {
  const notifyMe = () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
    } else if (Notification.permission === "granted") {
      const notification = new Notification("Hi there!");
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          const notification = new Notification("Hi there!");
        }
      });
    }
  };

  const sendNotification = () => {
    Notification.requestPermission().then(
      (permision) =>
        new Notification("hello", {
          tag: "price",
          body: "This is a permission",
        })
    );
  };

  return <button onClick={sendNotification}>Show Notification</button>;
};

export default NotificationPage;
