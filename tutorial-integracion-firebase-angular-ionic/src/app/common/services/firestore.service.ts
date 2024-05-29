import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collectionData,
  collection,
  doc,
  docData,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  DocumentReference,
  DocumentData,
  WithFieldValue,
  UpdateData,
  getDocs
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
// import { v4 as uuidv4 } from 'uuid';


// Convertidor genérico para Firestore
const converter = <T>() => ({
  toFirestore: (data: WithFieldValue<T>) => data,
  fromFirestore: (snapshot: any) => snapshot.data() as T
});

const docWithConverter = <T>(firestore: Firestore, path: string) =>
  doc(firestore, path).withConverter(converter<T>());

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  private firestore: Firestore = inject(Firestore);

  constructor() { }

  getFirestoreInstance(): Firestore {
    return this.firestore;
  }

  getDocument<T>(enlace: string): Promise<DocumentData> {
    const document = docWithConverter<T>(this.firestore, enlace);
    return getDoc(document);
  }

  getDocumentChanges<T>(enlace: string): Observable<T> {
    const document = docWithConverter<T>(this.firestore, enlace);
    return docData(document) as Observable<T>;
  }

  getCollectionChanges<T>(path: string): Observable<T[]> {
    const itemCollection = collection(this.firestore, path);
    return collectionData(itemCollection, { idField: 'id' }) as Observable<T[]>;
  }

  createDocument<T>(data: T, enlace: string): Promise<void> {
    const document = docWithConverter<T>(this.firestore, enlace);
    return setDoc(document, data);
  }

  async createDocumentWithAutoId<T>(data: T, enlace: string): Promise<void> {
    const itemCollection = collection(this.firestore, enlace);
    const newDocRef = doc(itemCollection).withConverter(converter<T>());
    await setDoc(newDocRef, data);
  }

  async updateDocument<T>(data: UpdateData<T>, enlace: string, idDoc: string): Promise<void> {
    const document = docWithConverter<T>(this.firestore, `${enlace}/${idDoc}`);
    return updateDoc(document, data);
  }

  deleteDocumentID(enlace: string, idDoc: string): Promise<void> {
    const document = doc(this.firestore, `${enlace}/${idDoc}`);
    return deleteDoc(document);
  }

  deleteDocFromRef(ref: DocumentReference): Promise<void> {
    return deleteDoc(ref);
  }

  // createIdDoc(): string {
  //   // return uuidv4();
  // }

  async getAuthUser() {
    return { uid: '05OTLvPNICH5Gs9ZsW0k' };
  }

  async createUserWithSubcollections(userData: any, userId: string): Promise<void> {
    const userRef = doc(this.firestore, `Usuarios/${userId}`);
    await setDoc(userRef, userData);

    // Create subcollections
    const subcollections = ['certIngreso', 'declaracionJurada', 'facturacion', 'infoPersonal', 'planPago', 'AFIP'];
    for (const subcollection of subcollections) {
      const subcollectionRef = doc(collection(userRef, subcollection));
      await setDoc(subcollectionRef, { initialized: true }); // Puedes añadir datos por defecto aquí
    }
  }

  async getDocumentIdInSubcollection(path: string, subcollection: string): Promise<string | null> {
    const subcollectionRef = collection(this.firestore, `${path}/${subcollection}`);
    const querySnapshot = await getDocs(subcollectionRef);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];  // Suponiendo que solo hay un documento
      return doc.id;
    } else {
      return null;
    }
  }



//obtener el documento del usuario
 public async getDocumentById<T>(collectionPath: string, documentId: string): Promise<DocumentData | undefined> {
    try {
      const docRef = doc(this.firestore, collectionPath, documentId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : undefined;
    } catch (error) {
      console.error("Error al obtener el documento:", error);
      throw error; // Relanza el error para manejarlo en el componente
    }
  }


}
