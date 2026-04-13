import mongoose from "mongoose";

function getMongoUri(): string | undefined {
  return process.env.NODE_ENV === "production"
    ? process.env.MONGODB_URI_PROD
    : process.env.MONGODB_URI;
}

interface MongooseGlobal {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseGlobal: MongooseGlobal | undefined;
}

const globalCache: MongooseGlobal = global.mongooseGlobal || {
  conn: null,
  promise: null,
};
if (!global.mongooseGlobal) global.mongooseGlobal = globalCache;

async function connect(): Promise<typeof mongoose> {
  const rawUri = getMongoUri();

  if (!rawUri) {
    throw new Error(
      "Missing MongoDB URI for this environment. Set MONGODB_URI for development or MONGODB_URI_PROD for production.",
    );
  }

  const uri: string = rawUri;

  if (globalCache.conn) return globalCache.conn;

  if (!globalCache.promise) {
    globalCache.promise = mongoose.connect(uri, { bufferCommands: false });
  }

  globalCache.conn = await globalCache.promise;
  return globalCache.conn;
}

export const connectDB = connect;
export default connect;
