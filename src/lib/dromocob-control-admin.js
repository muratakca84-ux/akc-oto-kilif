import {
  applicationDefault,
  cert,
  getApp,
  getApps,
  initializeApp,
} from "firebase-admin/app";

import {
  getFirestore,
} from "firebase-admin/firestore";

const CONTROL_APP_NAME =
  "dromocob-control-agent";

function getProjectId() {
  return (
    process.env.DROMOCOB_CONTROL_PROJECT_ID ||
    process.env.FIREBASE_PROJECT_ID ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.GCLOUD_PROJECT ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    null
  );
}

function getCredential() {
  const clientEmail = process.env.DROMOCOB_CONTROL_CLIENT_EMAIL;
  const privateKey = process.env.DROMOCOB_CONTROL_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (clientEmail && privateKey) {
    return cert({ projectId: getProjectId(), clientEmail, privateKey });
  }

  return applicationDefault();
}

function getControlAdminApp() {
  const existingApp =
    getApps().find(
      (app) =>
        app.name === CONTROL_APP_NAME
    );

  if (existingApp) {
    return getApp(
      CONTROL_APP_NAME
    );
  }

  const projectId =
    getProjectId();

  if (!projectId) {
    throw new Error(
      "[DROMOCOB CONTROL] Firebase project ID runtime ortamında bulunamadı."
    );
  }

  return initializeApp(
    {
      credential: getCredential(),

      projectId,
    },

    CONTROL_APP_NAME
  );
}

export function getControlDb() {
  return getFirestore(
    getControlAdminApp()
  );
}
