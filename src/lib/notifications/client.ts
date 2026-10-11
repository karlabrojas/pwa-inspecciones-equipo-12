export type NotificationPermissionState =
  | "granted"
  | "default"
  | "denied"
  | "unsupported";

export type InspectionNotificationEvent =
  | "inspection-synced"
  | "inspection-assigned";

export type NotificationResult = {
  status:
    | "shown"
    | "unsupported"
    | "denied"
    | "permission-required"
    | "error";
  message: string;
};

type NotificationApi = {
  readonly permission: NotificationPermission;
  requestPermission(): Promise<NotificationPermission>;
  new (title: string, options?: NotificationOptions): unknown;
};

export type NotificationEnvironment = {
  getApi(): NotificationApi | undefined;
};

const browserEnvironment: NotificationEnvironment = {
  getApi() {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return undefined;
    }

    return window.Notification;
  },
};

const eventContent: Record<InspectionNotificationEvent, { title: string; body: string }> = {
  "inspection-synced": {
    title: "Inspección sincronizada",
    body: "Una inspección se guardó correctamente en el sistema.",
  },
  "inspection-assigned": {
    title: "Inspección asignada",
    body: "Se asignó una inspección que requiere seguimiento.",
  },
};

export function getNotificationPermissionState(
  environment: NotificationEnvironment = browserEnvironment
): NotificationPermissionState {
  try {
    return environment.getApi()?.permission ?? "unsupported";
  } catch {
    return "unsupported";
  }
}

function showNotification(
  api: NotificationApi,
  title: string,
  body: string,
  tag: string
): NotificationResult {
  try {
    new api(title, { body, tag });
    return { status: "shown", message: "Notificación mostrada." };
  } catch {
    return {
      status: "error",
      message: "No se pudo mostrar la notificación. Puedes continuar usando la aplicación.",
    };
  }
}

/** Call only from a direct user action, such as clicking an enable button. */
export async function requestNotificationPermission(
  environment: NotificationEnvironment = browserEnvironment
): Promise<NotificationResult> {
  try {
    const api = environment.getApi();
    if (!api) {
      return {
        status: "unsupported",
        message: "Este navegador no admite notificaciones; puedes seguir usando la aplicación.",
      };
    }

    const permission =
      api.permission === "default" ? await api.requestPermission() : api.permission;

    if (permission === "denied") {
      return {
        status: "denied",
        message: "Las notificaciones están bloqueadas. Los cambios seguirán disponibles en la aplicación.",
      };
    }

    if (permission !== "granted") {
      return {
        status: "permission-required",
        message: "No se concedió el permiso. Puedes continuar usando la aplicación.",
      };
    }

    return showNotification(
      api,
      "Notificaciones activadas",
      "Te avisaremos cuando haya novedades sobre tus inspecciones.",
      "inspection-notifications-enabled"
    );
  } catch {
    return {
      status: "error",
      message: "No se pudo activar las notificaciones. Puedes continuar usando la aplicación.",
    };
  }
}

/** Does not request permission; call this only after the corresponding real event. */
export function showInspectionNotification(
  event: InspectionNotificationEvent,
  environment: NotificationEnvironment = browserEnvironment
): NotificationResult {
  try {
    const api = environment.getApi();
    if (!api) {
      return {
        status: "unsupported",
        message: "Este navegador no admite notificaciones; revisa las novedades en la aplicación.",
      };
    }

    if (api.permission === "denied") {
      return {
        status: "denied",
        message: "Las notificaciones están bloqueadas; revisa las novedades en la aplicación.",
      };
    }

    if (api.permission !== "granted") {
      return {
        status: "permission-required",
        message: "Activa las notificaciones desde la aplicación para recibir estos avisos.",
      };
    }

    const content = eventContent[event];
    return showNotification(api, content.title, content.body, event);
  } catch {
    return {
      status: "error",
      message: "No se pudo mostrar el aviso; la operación de inspección continúa.",
    };
  }
}
