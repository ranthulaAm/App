import { collection, doc, setDoc, getDoc, getDocs, updateDoc, query, where, onSnapshot, Unsubscribe, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";
import { Order, OrderStatus, User } from "../types";

const ORDERS_COLLECTION = 'orders';
const USERS_COLLECTION = 'users';

const sanitizeData = (data: any) => {
  if (data === null || data === undefined) return null;
  const sanitized = JSON.parse(JSON.stringify(data, (key, value) => {
    return value === undefined ? null : value;
  }));
  return sanitized;
};

export const saveUserProfile = async (user: User): Promise<void> => {
  try {
    await setDoc(doc(db, USERS_COLLECTION, user.id), sanitizeData(user), { merge: true });
  } catch (e) {
    console.error("Error saving user profile:", e);
  }
};

export const saveOrder = async (order: Order): Promise<void> => {
  try {
    await setDoc(doc(db, ORDERS_COLLECTION, order.id), sanitizeData(order));
  } catch (e) {
    console.error("Error saving order:", e);
    throw e;
  }
};

export const updateOrder = async (updatedOrder: Order): Promise<void> => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, updatedOrder.id);
    await updateDoc(orderRef, sanitizeData(updatedOrder));
  } catch (e) {
    console.error("Error updating order:", e);
    throw e;
  }
};

export const cancelOrder = async (orderId: string): Promise<void> => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, { status: OrderStatus.CANCELLED });
  } catch (e) {
    console.error("Error cancelling order:", e);
    throw e;
  }
};

export const listenToOrders = (callback: (orders: Order[]) => void): Unsubscribe => {
  const q = query(collection(db, ORDERS_COLLECTION));
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => doc.data() as Order);
    const sorted = orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(sorted);
  });
};

export const listenToOrderById = (id: string, callback: (order: Order | null) => void): Unsubscribe => {
  const docRef = doc(db, ORDERS_COLLECTION, id);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as Order);
    } else {
      callback(null);
    }
  });
};

export const listenToOrdersByClientId = (clientId: string, callback: (orders: Order[]) => void): Unsubscribe => {
  const q = query(collection(db, ORDERS_COLLECTION), where("clientId", "==", clientId));
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => doc.data() as Order);
    const sorted = orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(sorted);
  });
};

export const getOrders = async (): Promise<Order[]> => {
  try {
    const q = query(collection(db, ORDERS_COLLECTION));
    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map(doc => doc.data() as Order);
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (e) {
    console.error("Error fetching orders:", e);
    return [];
  }
};

export const getOrderById = async (id: string): Promise<Order | undefined> => {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Order;
    }
    return undefined;
  } catch (e) {
    console.error("Error fetching order:", e);
    return undefined;
  }
};

export const generateOrderId = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ORD-${code}`;
};