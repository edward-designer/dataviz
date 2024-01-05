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
  if (!("Notification" in window)) {
    throw new Error("Notification not supported");
  }
  if (Notification.permission !== "granted") {
    throw new Error("Permission not granted for Notification");
  }
  return new Notification(title, options);
};
