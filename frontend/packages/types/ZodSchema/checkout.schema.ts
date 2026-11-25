import { z } from "zod";

export const PaymentModeSchema = z.enum(["Cash", "Card", "UPI"]);
export type PaymentMode = z.infer<typeof PaymentModeSchema>;

export const CheckoutRequestSchema = z
  .object({
    paymentMode: PaymentModeSchema,
    payableAmount: z.number().nonnegative(),
    amountTendered: z.number().nonnegative(),
    changeDue: z.number().nonnegative(),
    notes: z.string().optional(),
  })
  .strict()
  .refine(
    (data) => {
      if (data.paymentMode === "Cash") {
        return data.amountTendered >= data.payableAmount;
      }
      return true;
    },
    {
      message: "Tendered amount cannot be less than payable total (zero negative balance submission)",
      path: ["amountTendered"],
    }
  );

export type CheckoutRequest = z.infer<typeof CheckoutRequestSchema>;
