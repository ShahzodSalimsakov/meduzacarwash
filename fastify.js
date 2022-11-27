import Fastify from "fastify";
import path from "path";
import fastifyStatic from "@fastify/static";
import middiePlugin from "@fastify/middie";
import { fileURLToPath } from "url";
import { handler as ssrHandler } from "./dist/server/entry.mjs";

async function build() {
  const fastify = Fastify();
  const __filename = fileURLToPath(import.meta.url);

  // 👇️ "/home/john/Desktop/javascript"
  const __dirname = path.dirname(__filename);
  fastify.register(fastifyStatic, {
    root: path.join(__dirname, "dist/client"),
  });
  await fastify.register(middiePlugin, {
    hook: "onRequest", // default
  });
  // do you know we also have cors support?
  // https://github.com/fastify/fastify-cors
  fastify.use(ssrHandler);
  return fastify;
}

build()
  .then((fastify) => fastify.listen({ port: process.env.PORT }))
  .catch(console.log);
