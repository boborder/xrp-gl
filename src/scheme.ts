import { createRoute, z } from "@hono/zod-openapi";

const ParamsSchema = z.object({
  id: z
    .string()
    .min(3)
    .regex(/^[\x00-\x7F]*$/)
    .openapi({
      param: {
        name: "id",
        in: "path",
      },
      example: "lisaog3",
      description: "Paystring ASCII",
    }),
});

const UserSchema = z.object({
    result: z.object({
      id: z.string().openapi({
        example: "uuid",
        description: "response OK",
      }),
    }),
  })
  .openapi("User");

export const schema = createRoute({
  path: "/{id}",
  method: "post",
  request: {
    params: ParamsSchema,
    // body: {
    //   required: true,
    //   content: {
    //     "application/json": {
    //       schema: params,
    //     },
    //   },
    // },
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
