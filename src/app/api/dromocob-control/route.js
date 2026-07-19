import {
  NextResponse,
} from "next/server";

import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";

import {
  getControlDb,
} from "@/lib/dromocob-control-admin";

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

const ALLOWED_STATUSES =
  new Set([
    "active",
    "maintenance",
    "disabled",
  ]);

const COMMAND_MAX_AGE_MS =
  60_000;

const NONCE_TTL_MS =
  24 * 60 * 60 * 1000;

const MAX_BODY_BYTES = 32 * 1024;
const SAFE_COMMAND_ID = /^[A-Za-z0-9._:-]{8,160}$/;

export async function GET() {
  const configured = Boolean(
    process.env.DROMOCOB_CONTROL_SECRET &&
    process.env.DROMOCOB_CONTROL_SITE_ID &&
    process.env.DROMOCOB_CONTROL_PROJECT_ID
  );

  return NextResponse.json(
    {
      ok: true,
      service: "dromocob-control-agent",
      version: 1,
      configured,
      siteId: process.env.DROMOCOB_CONTROL_SITE_ID || null,
      capabilities: ["active", "maintenance", "disabled"],
      signature: "HMAC-SHA256",
      timestamp: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}

function safeSignatureEqual(
  received,
  expected
) {
  if (
    !/^[a-f0-9]{64}$/i.test(
      received
    )
  ) {
    return false;
  }

  try {
    const receivedBuffer =
      Buffer.from(
        received,
        "hex"
      );

    const expectedBuffer =
      Buffer.from(
        expected,
        "hex"
      );

    if (
      receivedBuffer.length !==
      expectedBuffer.length
    ) {
      return false;
    }

    return timingSafeEqual(
      receivedBuffer,
      expectedBuffer
    );
  } catch {
    return false;
  }
}

export async function POST(request) {

  const controlSecret =

    process.env

      .DROMOCOB_CONTROL_SECRET;

  const expectedSiteId =

    process.env

      .DROMOCOB_CONTROL_SITE_ID;

  if (

    !controlSecret ||

    !expectedSiteId ||
    Buffer.byteLength(controlSecret, "utf8") < 32

  ) {

    return NextResponse.json(

      {

        ok: false,

        error:

          "CONTROL_AGENT_NOT_CONFIGURED",

      },

      {

        status: 500,

      }

    );

  }

  const rawBody =

    await request.text();

  if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
    return NextResponse.json(
      { ok: false, error: "PAYLOAD_TOO_LARGE" },
      { status: 413 }
    );
  }

  const receivedSignature =
    request.headers.get(
      "x-dromocob-signature"
    ) || "";

  const expectedSignature =
    createHmac(
      "sha256",
      controlSecret
    )
      .update(rawBody)
      .digest("hex");

  if (
    !safeSignatureEqual(
      receivedSignature,
      expectedSignature
    )
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "INVALID_SIGNATURE",
      },
      {
        status: 401,
      }
    );
  }

  let command;

  try {
    command =
      JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "INVALID_JSON",
      },
      {
        status: 400,
      }
    );
  }

  if (
    command.siteId !==
    expectedSiteId
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "SITE_ID_MISMATCH",
      },
      {
        status: 403,
      }
    );
  }

  if (
    !ALLOWED_STATUSES.has(
      command.status
    )
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "INVALID_STATUS",
      },
      {
        status: 400,
      }
    );
  }

  if (
    typeof command.nonce !==
      "string" ||
    !SAFE_COMMAND_ID.test(command.nonce) ||
    typeof command.commandId !==
      "string" ||
    !SAFE_COMMAND_ID.test(command.commandId)
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "COMMAND_METADATA_MISSING",
      },
      {
        status: 400,
      }
    );
  }

  const timestamp =
    Number(command.timestamp);

  if (
    !Number.isFinite(timestamp)
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "INVALID_TIMESTAMP",
      },
      {
        status: 400,
      }
    );
  }

  if (
    Math.abs(
      Date.now() - timestamp
    ) > COMMAND_MAX_AGE_MS
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "COMMAND_EXPIRED",
      },
      {
        status: 400,
      }
    );
  }

  const controlDb = getControlDb();

  const nonceRef =
    controlDb
      .collection(
        "system_control_nonces"
      )
      .doc(command.nonce);

  const stateRef =
    controlDb
      .collection(
        "system_control"
      )
      .doc("current");

  try {
    await controlDb.runTransaction(
      async (transaction) => {
        const nonceSnapshot =
          await transaction.get(
            nonceRef
          );

        if (nonceSnapshot.exists) {
          throw new Error(
            "REPLAY_DETECTED"
          );
        }

        const now =
          new Date();

        transaction.set(
          nonceRef,
          {
            nonce:
              command.nonce,

            commandId:
              command.commandId,

            siteId:
              command.siteId,

            receivedAt:
              now,

            expireAt:
              new Date(
                Date.now() +
                NONCE_TTL_MS
              ),
          }
        );

        transaction.set(
          stateRef,
          {
            status:
              command.status,

            source:
              "dromocob-control",

            siteId:
              command.siteId,

            commandId:
              command.commandId,

            updatedAt:
              now,
          },
          {
            merge: true,
          }
        );
      }
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "REPLAY_DETECTED"
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "REPLAY_DETECTED",
        },
        {
          status: 409,
        }
      );
    }

    console.error(
      "[DROMOCOB CONTROL] Write failed:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "STATE_WRITE_FAILED",
      },
      {
        status: 500,
      }
    );
  }

  return NextResponse.json(
    {
      ok: true,

      siteId:
        expectedSiteId,

      status:
        command.status,

      commandId:
        command.commandId,
    },
    {
      headers: {
        "Cache-Control":
          "no-store, max-age=0",
      },
    }
  );
}
