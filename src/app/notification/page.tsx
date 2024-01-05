"use client";

import { requestPermission, showNotification } from "../../../worker/utils";

const Notification = () => {
  return (
    <div>
      <div>
        <button onClick={() => requestPermission()}>
          Enable Notifications
        </button>
        <button onClick={() => showNotification("Yes, it worked!")}>
          Show Notification
        </button>
      </div>
    </div>
  );
};

export default Notification;
