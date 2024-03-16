import {
  addData,
  createObjectStore,
  deleteData,
  getAllData,
  getDataByKey,
  openDatabase
} from './db';

const DB_NAME = 'BearBit-Helper-DB';
const DB_VERSION = 1;
const DB_OBJECT_NAME = 'torrent';
const CACHE_VERSION = 'v1';

async function getCacheData(id: string): Promise<any> {
  const db = await openDatabase(
    DB_NAME,
    DB_VERSION,
    (event: IDBVersionChangeEvent) => {
      const db = (<IDBOpenDBRequest>event.target).result as IDBDatabase;
      createObjectStore(db, DB_OBJECT_NAME, 'id');
    }
  );

  const data = await getDataByKey(db, DB_OBJECT_NAME, id);

  // check expiration
  if (data) {
    const isExpire = new Date(data?.expirationDate) <= new Date();

    if (isExpire) {
      // delete data
      await deleteData(db, DB_OBJECT_NAME, id);
      return null;
    }

    return data;
  }

  return null;
}

async function addCacheData(
  data: any,
  expirationSeconds: number
): Promise<void> {
  const expirationDate = new Date(
    Date.now() + expirationSeconds * 1000
  ).toISOString();
  const version = CACHE_VERSION;
  const dataWithExpirationAndVersion = { ...data, expirationDate, version };

  const db = await openDatabase(
    DB_NAME,
    DB_VERSION,
    (event: IDBVersionChangeEvent) => {
      const db = (<IDBOpenDBRequest>event.target).result as IDBDatabase;
      createObjectStore(db, DB_OBJECT_NAME, 'id');
    }
  );

  await addData(db, DB_OBJECT_NAME, dataWithExpirationAndVersion);

  // try {
  //   await addData(db, DB_OBJECT_NAME, dataWithExpiration);
  // } catch (error: any) {
  //   const message = error.toString();
  //   if (message.includes('Key already exists in the object')) {
  //     await updateData(db, DB_OBJECT_NAME, dataWithExpiration);
  //   } else {
  //     throw error;
  //   }
  // }
}

async function removeExpiredOrWrongVersionCacheData(): Promise<void> {
  const currentDate = new Date();

  const db = await openDatabase(
    DB_NAME,
    DB_VERSION,
    (event: IDBVersionChangeEvent) => {
      const db = (<IDBOpenDBRequest>event.target).result as IDBDatabase;
      createObjectStore(db, DB_OBJECT_NAME, 'id');
    }
  );

  const items = await getAllData(db, DB_OBJECT_NAME);

  items.forEach(async item => {
    if (
      // expired
      new Date(item?.expirationDate) < currentDate ||
      // wrong version
      item?.version !== CACHE_VERSION
    ) {
      await deleteData(db, DB_OBJECT_NAME, item?.id);
    }
  });
}

export { getCacheData, addCacheData, removeExpiredOrWrongVersionCacheData };
