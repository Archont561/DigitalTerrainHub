export const URLs = {
  root: {
    name: "DjangoURLs",
    endpoints: ["", "profile"] as const,
    api: {
      core: {
        notifications: {
          pk: "id",
          endpoints: ["read"] as const,
        },
      },
      payment: {
        endpoints: ["webhook"] as const,
        stripe: {
          pk: "id",
          endpoints: ["cancel", "createSession", "success"] as const,
        },
      },
      pyodm: {
        endpoints: ["taskWebhook"] as const,
        presets: {
          pk: "id",
          endpoints: ["available"] as const,
        },
        workspaces: {
          endpoints: ["images"] as const,
          pk: "workspaceUUID",
          images: {
            pk: "filename",
          },
          upload: {
            pk: "resourceID",
          },
          gcpoints: {
            pk: "id",
          },
          tasks: {
            pk: "taskUUID",
            endpoints: ["cancel", "output", "restart", "status"] as const,
          },
        },
      },
      user: {
        endpoints: ["profile"] as const,
        auth: {
          endpoints: [
            "changePassword",
            "confirmEmailVerification",
            "confirmPasswordReset",
            "login",
            "logout",
            "register",
            "resetPassword",
            "updateEmail",
          ] as const,
        },
      },
    },
  },
} as const;
