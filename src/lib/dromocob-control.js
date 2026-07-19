import {
  getControlDb,
} from "@/lib/dromocob-control-admin";

const DEFAULT_CONTROL_STATE = {
  status: "active",
  commandId: null,
  source: null,
  updatedAt: null,
};

const ALLOWED_STATUSES =
  new Set([
    "active",
    "maintenance",
    "disabled",
  ]);

export async function getControlState() {
  if (process.env.DROMOCOB_CONTROL_ENABLED !== "true") {
    return { ...DEFAULT_CONTROL_STATE };
  }

  try {
    const controlDb =
      getControlDb();

    const snapshot =
      await controlDb
        .collection(
          "system_control"
        )
        .doc("current")
        .get();

    if (!snapshot.exists) {
      return {
        ...DEFAULT_CONTROL_STATE,
      };
    }

    const data =
      snapshot.data() || {};

    if (
      !ALLOWED_STATUSES.has(
        data.status
      )
    ) {
      console.warn(
        "[DROMOCOB CONTROL] Geçersiz status:",
        data.status
      );

      return {
        ...DEFAULT_CONTROL_STATE,
      };
    }

    return {
      status:
        data.status,

      commandId:
        typeof data.commandId ===
        "string"
          ? data.commandId
          : null,

      source:
        typeof data.source ===
        "string"
          ? data.source
          : null,

      updatedAt:
        data.updatedAt ||
        null,
    };
  } catch (error) {
    console.error(
      "[DROMOCOB CONTROL] State read failed:",
      error
    );

    /*
     * FAIL-OPEN
     *
     * Control sistemi hata verdi diye
     * müşteri sitesini kapatmıyoruz.
     */
    return {
      ...DEFAULT_CONTROL_STATE,
    };
  }
}

export async function getControlStatus() {
  const state =
    await getControlState();

  return state.status;
}
