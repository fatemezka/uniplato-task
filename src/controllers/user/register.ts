import { JSONSchemaType } from "ajv";
import bcrypt from "bcrypt";
import { FastifyRequest, FastifyReply } from "fastify";
import { create, getByEmail, getByUsername } from "../../services/user";

// BodySchema
interface Data {
  name: string;
  family: string;
  username: string;
  email: string;
  password: string;
}
export const bodySchema: JSONSchemaType<Data> = {
  type: "object",
  properties: {
    name: { type: "string" },
    family: { type: "string" },
    username: { type: "string" },
    email: { type: "string" }, // todo email validation
    password: { type: "string" },
  },
  required: ["name", "family", "username", "email", "password"],
};

// Handler
export const handler = async (
  req: FastifyRequest<{ Body: Data }>,
  reply: FastifyReply
) => {
  try {
    const { name, family, username, email, password } = req.body;

    // check if email exists
    let existing_user = await getByEmail(email);
    if (existing_user) {
      return reply.code(401).send("This email does exist.");
    }

    // check if username exists
    existing_user = await getByUsername(username);
    if (existing_user) {
      return reply.code(401).send("This username does exist.");
    }

    // hash the plain password
    const salt = process.env.BCRYPT_SALT ?? "";
    const hash_password = await bcrypt.hash(password, salt);

    // create user
    const user = await create(name, family, username, email, hash_password);

    return reply.code(201).send(user);
  } catch (error) {
    console.log(error);
    return reply.code(500).send(error);
  }
};
