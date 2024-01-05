export const requestPermission = async () => {
  if (!("Notification" in window)) {
    throw new Error("Notification not supported");
  }
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Permission not granted for Notification");
  }
};

export const showNotification = async (title, options) => {
  const registration = await navigator.serviceWorker.getRegistration();

  if (!("Notification" in window)) {
    throw new Error("Notification not supported");
  }
  if (Notification.permission !== "granted") {
    throw new Error("Permission not granted for Notification");
  }
  if ("showNotification" in registration) {
    registration.showNotification(title, options);
  } else {
    new Notification(title, options);
  }
};
