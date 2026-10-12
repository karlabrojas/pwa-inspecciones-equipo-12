"use client";

import { useEffect, useState } from "react";
import {
  getNotificationPermissionState,
  requestNotificationPermission,
  type NotificationPermissionState,
} from "@/lib/notifications/client";

export function NotificationControls() {
  const [permission, setPermission] =
    useState<NotificationPermissionState>("default");
  const [feedback, setFeedback] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    const currentPermission = getNotificationPermissionState();
    setPermission(currentPermission);

    if (currentPermission === "unsupported") {
      setFeedback(
        "Este navegador no admite notificaciones; puedes consultar los cambios en la aplicación."
      );
    }
  }, []);

  async function handleEnableNotifications() {
    setIsRequesting(true);
    const result = await requestNotificationPermission();
    setPermission(getNotificationPermissionState());
    setFeedback(result.message);
    setIsRequesting(false);
  }

  const isUnavailable = permission === "unsupported" || permission === "denied";
  const buttonLabel =
    permission === "granted"
      ? "Notificaciones activadas"
      : permission === "denied"
        ? "Permiso bloqueado"
        : "Activar notificaciones";

  return (
    <div className="notification-controls">
      <button
        type="button"
        className="detail-button"
        onClick={handleEnableNotifications}
        disabled={isUnavailable || permission === "granted" || isRequesting}
      >
        {isRequesting ? "Solicitando permiso…" : buttonLabel}
      </button>
      {feedback && (
        <p className="notification-feedback" role="status" aria-live="polite">
          {feedback}
        </p>
      )}
    </div>
  );
}
