import { createRoute, z } from "@hono/zod-openapi";

const BodySchema = z.object({
  name: z
    .string()
    .regex(/^[\x00-\x7F]*$/)
    .openapi({
      example: "bob",
      description: "ASCII",
    }),
})
.openapi("Body");

const UserSchema = z
  .object({
    result: z.object({
      name: z.string().openapi({
        example: "bob",
      }),
      uuid: z.string().openapi({
        example: "a891c2ad-3b5d-4e17-80bd-8da686cefb33",
        description: "Random uuid",
      }),
    }),
  })
  .openapi("User");

export const schema = createRoute({
  path: "/api/post",
  method: "post",
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: BodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: UserSchema,
        },
      },
      description: "OK",
    },
  },
});
