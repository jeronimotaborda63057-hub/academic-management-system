import type { Registration } from "../../models/Registration";

export type ResultModalState =
    | {
          registration?: Registration;
          type: "success";
      }
    | {
          registration?: Registration;
          type: "duplicate";
      }
    | null;

export type ToastState = {
    message: string;
    title: string;
    type: "success" | "error";
} | null;
