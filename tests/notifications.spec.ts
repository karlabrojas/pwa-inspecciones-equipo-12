import test from "node:test";
import assert from "node:assert/strict";
import {
  getNotificationPermissionState,
  requestNotificationPermission,
  showInspectionNotification,
} from "../src/lib/notifications/client.ts";

type FakeEnvironmentOptions = {
  permission?: NotificationPermission;
  permissionAfterRequest?: NotificationPermission;
  requestError?: boolean;
  notificationError?: boolean;
};

function createEnvironment({
  permission = "default",
  permissionAfterRequest = "granted",
  requestError = false,
  notificationError = false,
}: FakeEnvironmentOptions = {}) {
  let currentPermission = permission;
  let requestCount = 0;
  const notifications: { title: string; options?: NotificationOptions }[] = [];

  const api = class FakeNotification {
    static get permission() {
      return currentPermission;
    }

    static async requestPermission() {
      requestCount += 1;
      if (requestError) throw new Error("synthetic permission error");
      currentPermission = permissionAfterRequest;
      return currentPermission;
    }

    constructor(title: string, options?: NotificationOptions) {
      if (notificationError) throw new Error("synthetic notification error");
      notifications.push({ title, options });
    }
  };

  return {
    environment: { getApi: () => api },
    get requestCount() {
      return requestCount;
    },
    get notifications() {
      return notifications;
    },
  };
}

test("permission state: reports unsupported when the Notification API is absent", () => {
  assert.equal(
    getNotificationPermissionState({ getApi: () => undefined }),
    "unsupported"
  );
});

test("permission state: reads default, granted and denied without prompting", () => {
  for (const permission of ["default", "granted", "denied"] as const) {
    const browser = createEnvironment({ permission });
    assert.equal(
      getNotificationPermissionState(browser.environment),
      permission
    );
    assert.equal(browser.requestCount, 0);
  }
});

test("explicit request: asks for permission and shows confirmation when granted", async () => {
  const browser = createEnvironment();
  const result = await requestNotificationPermission(browser.environment);

  assert.equal(browser.requestCount, 1);
  assert.equal(result.status, "shown");
  assert.equal(browser.notifications.length, 1);
});

test("explicit request: denied permission returns a non-blocking fallback", async () => {
  const browser = createEnvironment({ permissionAfterRequest: "denied" });
  const result = await requestNotificationPermission(browser.environment);

  assert.equal(result.status, "denied");
  assert.match(result.message, /disponibles en la aplicación/);
  assert.equal(browser.notifications.length, 0);
});

test("explicit request: unsupported API returns fallback without throwing", async () => {
  const result = await requestNotificationPermission({ getApi: () => undefined });
  assert.equal(result.status, "unsupported");
  assert.match(result.message, /seguir usando la aplicación/);
});

test("event notification: default permission does not trigger an automatic prompt", () => {
  const browser = createEnvironment();
  const result = showInspectionNotification(
    "inspection-synced",
    browser.environment
  );

  assert.equal(result.status, "permission-required");
  assert.equal(browser.requestCount, 0);
  assert.equal(browser.notifications.length, 0);
});

test("event notification: shows generic synthetic message only when granted", () => {
  const browser = createEnvironment({ permission: "granted" });
  const result = showInspectionNotification(
    "inspection-assigned",
    browser.environment
  );

  assert.equal(result.status, "shown");
  assert.equal(browser.requestCount, 0);
  assert.match(browser.notifications[0].title, /Inspección asignada/);
  assert.doesNotMatch(JSON.stringify(browser.notifications[0]), /nombre|correo|matrícula/i);
});

test("errors: permission request and notification construction return fallbacks", async () => {
  const permissionFailure = await requestNotificationPermission(
    createEnvironment({ requestError: true }).environment
  );
  const notificationFailure = await requestNotificationPermission(
    createEnvironment({ permission: "granted", notificationError: true }).environment
  );

  assert.equal(permissionFailure.status, "error");
  assert.match(permissionFailure.message, /continuar usando/);
  assert.equal(notificationFailure.status, "error");
  assert.match(notificationFailure.message, /continuar usando/);
});
