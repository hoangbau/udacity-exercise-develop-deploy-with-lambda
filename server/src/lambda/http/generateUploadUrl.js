import middy from "@middy/core";
import cors from "@middy/http-cors";
import httpErrorHandler from "@middy/http-error-handler";
import { getTodoFileUploadUrl } from "../../businessLogic/todos.mjs";
import { createLogger } from "../../utils/logger.mjs";
import { getUserId } from "../utils.mjs";

const logger = createLogger("http/generateUploadUrl");

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true,
    })
  )
  .handler(async (event) => {
    const todoId = event.pathParameters.todoId;
    const userId = getUserId(event);
    const uploadUrl = await getTodoFileUploadUrl(todoId, userId);
    logger.info(`uploadUrl = ${uploadUrl}`, { function: "handler()" });

    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl: uploadUrl,
      }),
    };
  });
