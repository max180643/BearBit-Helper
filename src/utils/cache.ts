import {
  addData,
  createObjectStore,
  deleteData,
  getAllData,
  getDataByKey,
  openDatabase,
  updateData
} from './db';

const DB_NAME = 'BearBit-Helper-DB';
const DB_VERSION = 1;
const DB_TORRENT_OBJECT_NAME = 'torrent';
const DB_POSTER_OBJECT_NAME = 'poster';
const CACHE_VERSION = 'v1';
const CACHE_DEFAULT_EXPIRE = 604800; // 7 days

interface TorrentDetails {
  id: string;
  downloadUrl: string;
  downloadFilename: string;
  isThanks: number;
}

interface PosterDetails {
  id: string;
  image: string;
}

async function getCacheData(id: string, objectName: string): Promise<any> {
  const db = await openDatabase(
    DB_NAME,
    DB_VERSION,
    (event: IDBVersionChangeEvent) => {
      const db = (<IDBOpenDBRequest>event.target).result as IDBDatabase;
      createObjectStore(db, objectName, 'id');
    }
  );

  const data = await getDataByKey(db, objectName, id);

  // check expiration
  if (data) {
    const isExpire = new Date(data?.expirationDate) <= new Date();

    if (isExpire) {
      // delete data
      await deleteData(db, objectName, id);
      return null;
    }

    return data;
  }

  return null;
}

async function addCacheData(
  data: any,
  expirationSeconds: number,
  objectName: string
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
      createObjectStore(db, objectName, 'id');
    }
  );

  await addData(db, objectName, dataWithExpirationAndVersion);
}

async function updateCacheData(
  data: any,
  expirationSeconds: number,
  objectName: string
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
      createObjectStore(db, objectName, 'id');
    }
  );

  await updateData(db, objectName, dataWithExpirationAndVersion);
}

async function removeExpiredOrWrongVersionCacheData(
  objectName: string[]
): Promise<void> {
  const currentDate = new Date();

  const db = await openDatabase(
    DB_NAME,
    DB_VERSION,
    (event: IDBVersionChangeEvent) => {
      const db = (<IDBOpenDBRequest>event.target).result as IDBDatabase;
      objectName.forEach(name => {
        createObjectStore(db, name, 'id');
      });
    }
  );

  objectName.forEach(async name => {
    const items = await getAllData(db, name);

    items.forEach(async item => {
      if (
        // expired
        new Date(item?.expirationDate) < currentDate ||
        // wrong version
        item?.version !== CACHE_VERSION
      ) {
        await deleteData(db, name, item?.id);
      }
    });
  });
}

export type { TorrentDetails, PosterDetails };
export {
  getCacheData,
  addCacheData,
  updateCacheData,
  removeExpiredOrWrongVersionCacheData,
  CACHE_DEFAULT_EXPIRE,
  DB_TORRENT_OBJECT_NAME,
  DB_POSTER_OBJECT_NAME
};
