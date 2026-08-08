import { z } from "zod";

const safeText = (max: number) =>
  z.string().trim().max(max).transform((v) => v.replace(/[<>]/g, ""));

export const amountSchema = z
  .number()
  .finite()
  .positive("Amount must be greater than 0")
  .max(1_000_000_000, "Amount is too large");

export const transactionSchema = z.object({
  amount: amountSchema,
  description: safeText(200).optional(),
  date: z.string().refine((d) => !Number.isNaN(Date.parse(d)), "Invalid date"),
});

export const cardSchema = z.object({
  name: safeText(60).pipe(z.string().min(1, "Name is required")),
});

export const goalSchema = z.object({
  name: safeText(80).pipe(z.string().min(1, "Name is required")),
  target_amount: amountSchema,
});

export const categorySchema = z.object({
  name: safeText(40).pipe(z.string().min(1, "Name is required")),
});

export const profileSchema = z.object({
  name: safeText(80).pipe(z.string().min(1, "Name is required")),
});
