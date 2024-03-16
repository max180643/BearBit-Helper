async function openDatabase(
  databaseName: string,
  version: number,
  upgradeCallback: (event: IDBVersionChangeEvent) => void
): Promise<IDBDatabase> {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(databaseName, version);

    request.onerror = (event: Event) => {
      reject(
        `Failed to open database: ${(<IDBOpenDBRequest>event.target).error}`
      );
    };

    request.onsuccess = (event: Event) => {
      const db = (<IDBOpenDBRequest>event.target).result as IDBDatabase;
      resolve(db);
    };

    request.onupgradeneeded = upgradeCallback;
  });
}

async function createObjectStore(
  db: IDBDatabase,
  storeName: string,
  keyPath: string
): Promise<IDBObjectStore> {
  return new Promise<IDBObjectStore>((resolve, reject) => {
    if (!db.objectStoreNames.contains(storeName)) {
      const objectStore = db.createObjectStore(storeName, { keyPath });
      resolve(objectStore);
    } else {
      reject(`Object store '${storeName}' already exists.`);
    }
  });
}

async function addData(
  db: IDBDatabase,
  storeName: string,
  data: any
): Promise<IDBValidKey> {
  return new Promise<IDBValidKey>((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const objectStore = transaction.objectStore(storeName);

    const request = objectStore.add(data);

    request.onerror = event => {
      reject(`Failed to add data: ${(<IDBRequest>event.target).error}`);
    };

    request.onsuccess = event => {
      resolve((<IDBRequest>event.target).result as IDBValidKey);
    };
  });
}

async function getAllData(db: IDBDatabase, storeName: string): Promise<any[]> {
  return new Promise<any[]>((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const objectStore = transaction.objectStore(storeName);

    const request = objectStore.getAll();

    request.onerror = event => {
      reject(`Failed to get data: ${(event.target as IDBRequest).error}`);
    };

    request.onsuccess = event => {
      resolve((event.target as IDBRequest).result);
    };
  });
}

async function getDataByKey(
  db: IDBDatabase,
  storeName: string,
  key: any
): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const objectStore = transaction.objectStore(storeName);

    const request = objectStore.get(key);

    request.onerror = event => {
      reject(`Failed to get data: ${(event.target as IDBRequest).error}`);
    };

    request.onsuccess = event => {
      resolve((event.target as IDBRequest).result);
    };
  });
}

async function updateData(
  db: IDBDatabase,
  storeName: string,
  newData: any
): Promise<IDBValidKey> {
  return new Promise<IDBValidKey>((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const objectStore = transaction.objectStore(storeName);

    const request = objectStore.put(newData);

    request.onerror = event => {
      reject(`Failed to update data: ${(event.target as IDBRequest).error}`);
    };

    request.onsuccess = event => {
      resolve((event.target as IDBRequest).result as IDBValidKey);
    };
  });
}

async function deleteData(
  db: IDBDatabase,
  storeName: string,
  key: any
): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const objectStore = transaction.objectStore(storeName);

    const request = objectStore.delete(key);

    request.onerror = event => {
      reject(`Failed to delete data: ${(event.target as IDBRequest).error}`);
    };

    request.onsuccess = () => {
      resolve(true);
    };
  });
}

export {
  openDatabase,
  createObjectStore,
  addData,
  getAllData,
  getDataByKey,
  updateData,
  deleteData
};
