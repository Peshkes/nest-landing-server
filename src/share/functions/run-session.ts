import { ClientSession, Model } from "mongoose";
import { HttpException, HttpStatus } from "@nestjs/common";

export async function runSession<T>(
  model: Model<T>,
  callback: (session: ClientSession) => Promise<any>,
  customError: (message: string, status?: HttpStatus) => HttpException,
) {
  const session = await model.startSession();
  try {
    session.startTransaction();
    const result = await callback(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw customError(error.message, error.statusCode);
  } finally {
    await session.endSession();
  }
}
