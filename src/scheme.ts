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
      example: "bob",
      description: "Paystring ASCII",
    }),
});

const BodySchema = z.object({
  name: z
    .string()
    .regex(/^[\x00-\x7F]*$/)
    .openapi({
      example: "marley",
      description: "ASCII",
    }),
});

const UserSchema = z
  .object({
    result: z.object({
      id: z.string().openapi({
        example: "bob",
      }),
      name: z.string().openapi({
        example: "marley",
      }),
      uuid: z.string().openapi({
        example: "a891c2ad-3b5d-4e17-80bd-8da686cefb33",
        description: "Random uuid",
      }),
      ed25519: z.object({
        classicAddress: z.string().openapi({
          example: "rNN8RHBHXdShTECnUAWhym3GA7hG5TvJ7D",
          description: "XRPL Address",
        }),
        seed: z.string().optional().openapi({
          example: "sEdS5VLcCuaorVeVnj5dAus7siABU5Y",
          description: "XRPL Address Secret",
        }),
        publicKey: z.string().openapi({
          example:
            "EDBB650EE037B6A0349C2A2ED335134D3D95562E7D4F61DB0A9C2AE45E55332931",
          description: "ED25519 Public Key",
        }),
        privateKey: z.string().openapi({
          example:
            "EDDB1F0059D42F6FE327C6C99A358D9E9F7D32C8547A5635EE8171EED8F673FCA8",
          description: "ED25519 Private Key",
        }),
      }),
    }),
  })
  .openapi("User");

export const schema = createRoute({
  path: "/{id}",
  method: "post",
  request: {
    params: ParamsSchema,
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
