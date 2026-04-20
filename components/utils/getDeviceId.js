const STORAGE_KEY = "deviceId";
const LEGACY_KEY = "deviceIdentifier";

const generateId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `dev_${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`;
  }
  const random = Math.random().toString(36).slice(2, 10);
  return `dev_${Date.now().toString(36)}_${random}`;
};

const safeStorage = () => {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return null;
  }
  return window.localStorage;
};

export const getDeviceId = () => {
  const storage = safeStorage();
  if (!storage) {
    return "";
  }

  let id = storage.getItem(STORAGE_KEY) || storage.getItem(LEGACY_KEY);
  if (!id) {
    id = generateId();
    storage.setItem(STORAGE_KEY, id);
  } else if (!storage.getItem(STORAGE_KEY)) {
    storage.setItem(STORAGE_KEY, id);
  }
  return id;
};

export const formatDeviceIdForDisplay = (value) => {
  if (value === null || value === undefined) {
    return "N/A";
  }
  const stringValue = String(value).trim();
  if (!stringValue) {
    return "N/A";
  }
  return stringValue;
};

export const resolveDeviceDisplayId = (device, fallbackCurrentDeviceId = "") => {
  if (!device) {
    return "N/A";
  }

  const candidate =
    device.deviceIdentifier ||
    device.deviceId ||
    (device.isCurrentDevice ? fallbackCurrentDeviceId : "") ||
    device.id;

  return formatDeviceIdForDisplay(candidate);
};

export default getDeviceId;
