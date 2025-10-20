import { create } from 'zustand';
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { firestore, storage } from '../config/firebase';
import {
  Expense,
  ExpenseFilter,
  ExpenseSort,
  ExpensePagination,
  ExpenseVerification,
  ExpenseApproval,
  ExpensePayment,
  EXPENSE_CONFIG,
} from '../types/expense';

interface ExpenseState {
  expenses: Expense[];
  selectedExpense: Expense | null;
  loading: boolean;
  error: string | null;
  filter: ExpenseFilter;
  sort: ExpenseSort;
  pagination: ExpensePagination;

  // Actions
  setFilter: (filter: ExpenseFilter) => void;
  setSort: (sort: ExpenseSort) => void;
  setPagination: (pagination: ExpensePagination) => void;

  // CRUD Operations
  fetchExpenses: () => Promise<void>;
  fetchExpenseById: (id: string) => Promise<void>;
  createExpense: (data: Omit<Expense, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateExpense: (id: string, data: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  // Receipt Operations
  uploadReceipt: (expenseId: string, file: File) => Promise<string>;
  deleteReceipt: (expenseId: string) => Promise<void>;

  // Verification Operations
  verifyExpense: (verification: ExpenseVerification) => Promise<void>;
  rejectExpense: (expenseId: string, reason: string) => Promise<void>;

  // Approval Operations
  approveExpense: (approval: ExpenseApproval) => Promise<void>;

  // Payment Operations
  recordPayment: (payment: ExpensePayment) => Promise<void>;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  selectedExpense: null,
  loading: false,
  error: null,
  filter: {},
  sort: {
    field: 'createdAt',
    direction: 'desc',
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },

  setFilter: (filter) => set({ filter }),
  setSort: (sort) => set({ sort }),
  setPagination: (pagination) => set({ pagination }),

  fetchExpenses: async () => {
    try {
      set({ loading: true, error: null });
      const { filter, sort, pagination } = get();

      let q = collection(firestore, 'expenses');

      // Apply filters
      if (filter.applicantId) {
        q = query(q, where('applicantId', '==', filter.applicantId));
      }
      if (filter.branchId) {
        q = query(q, where('branchId', '==', filter.branchId));
      }
      if (filter.expenseType) {
        q = query(q, where('expenseType', '==', filter.expenseType));
      }
      if (filter.status) {
        q = query(q, where('status', '==', filter.status));
      }
      if (filter.currency) {
        q = query(q, where('currency', '==', filter.currency));
      }

      // Apply sorting
      q = query(q, orderBy(sort.field, sort.direction));

      // Apply pagination
      q = query(q, limit(pagination.limit));
      if (pagination.page > 1 && get().expenses.length > 0) {
        const lastDoc = get().expenses[get().expenses.length - 1];
        q = query(q, startAfter(lastDoc[sort.field]));
      }

      const snapshot = await getDocs(q);
      let expenses = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          expenseDate: data.expenseDate?.toDate ? data.expenseDate.toDate() : data.expenseDate ? new Date(data.expenseDate) : new Date(),
          verifiedAt: data.verifiedAt?.toDate ? data.verifiedAt.toDate() : data.verifiedAt ? new Date(data.verifiedAt) : null,
          approvedAt: data.approvedAt?.toDate ? data.approvedAt.toDate() : data.approvedAt ? new Date(data.approvedAt) : null,
          paidAt: data.paidAt?.toDate ? data.paidAt.toDate() : data.paidAt ? new Date(data.paidAt) : null,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt ? new Date(data.createdAt) : new Date(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt ? new Date(data.updatedAt) : new Date(),
        };
      }) as Expense[];

      // Sort by status priority: pending → verified → approved → rejected
      const statusPriority: Record<string, number> = {
        'pending': 1,
        'verified': 2,
        'approved': 3,
        'rejected': 4,
      };

      expenses.sort((a, b) => {
        const priorityA = statusPriority[a.status] || 99;
        const priorityB = statusPriority[b.status] || 99;
        
        if (priorityA !== priorityB) {
          return priorityA - priorityB; // Sort by status priority first
        }
        
        // If same status, sort by createdAt (newest first)
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      set({ expenses, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch expenses',
        loading: false,
      });
    }
  },

  fetchExpenseById: async (id) => {
    try {
      set({ loading: true, error: null });
      const docRef = doc(firestore, 'expenses', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        set({
          selectedExpense: {
            id: docSnap.id,
            ...data,
            expenseDate: data.expenseDate?.toDate ? data.expenseDate.toDate() : data.expenseDate ? new Date(data.expenseDate) : new Date(),
            verifiedAt: data.verifiedAt?.toDate ? data.verifiedAt.toDate() : data.verifiedAt ? new Date(data.verifiedAt) : null,
            approvedAt: data.approvedAt?.toDate ? data.approvedAt.toDate() : data.approvedAt ? new Date(data.approvedAt) : null,
            paidAt: data.paidAt?.toDate ? data.paidAt.toDate() : data.paidAt ? new Date(data.paidAt) : null,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt ? new Date(data.createdAt) : new Date(),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt ? new Date(data.updatedAt) : new Date(),
          } as Expense,
          loading: false,
        });
      } else {
        set({
          error: 'Expense not found',
          loading: false,
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch expense',
        loading: false,
      });
    }
  },

  createExpense: async (data) => {
    try {
      set({ loading: true, error: null });
      
      // Check authentication
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      // Get and log custom claims
      const tokenResult = await currentUser.getIdTokenResult(true); // Force refresh
      console.log('🔐 Authentication Check:', {
        userId: currentUser.uid,
        email: currentUser.email,
        customClaims: tokenResult.claims,
        role: tokenResult.claims.role,
        branchId: tokenResult.claims.branchId,
      });
      
      const docRef = doc(collection(firestore, 'expenses'));
      const timestamp = serverTimestamp();

      // Clean undefined values - Firestore doesn't accept undefined
      const cleanData: any = {};
      Object.keys(data).forEach(key => {
        const value = (data as any)[key];
        if (value !== undefined) {
          cleanData[key] = value;
        }
      });

      const expenseData = {
        ...cleanData,
        status: 'pending',
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      console.log('🔥 Firestore Write Attempt:', {
        docId: docRef.id,
        expenseData: { ...expenseData, createdAt: '[serverTimestamp]', updatedAt: '[serverTimestamp]' },
        hasBranchId: !!expenseData.branchId,
        hasEnteredBy: !!expenseData.enteredBy,
      });

      await setDoc(docRef, expenseData);

      // Create audit log
      await setDoc(doc(collection(firestore, 'audit_logs')), {
        action: 'expense_created',
        entityId: docRef.id,
        entityType: 'expense',
        performedBy: data.enteredBy,
        performedAt: timestamp,
        details: cleanData,
      });

      // Send notifications
      try {
        const notificationsRef = collection(firestore, 'notifications');
        const recipients: string[] = [];

        // Notify HO Accountant
        const accountantQuery = query(
          collection(firestore, 'users'),
          where('role', '==', 'ho_accountant')
        );
        const accountantSnapshot = await getDocs(accountantQuery);
        accountantSnapshot.docs.forEach(doc => recipients.push(doc.id));

        // Notify all admins
        const adminQuery = query(
          collection(firestore, 'users'),
          where('role', '==', 'admin')
        );
        const adminSnapshot = await getDocs(adminQuery);
        adminSnapshot.docs.forEach(doc => recipients.push(doc.id));

        // Get applicant name
        let applicantName = 'Unknown Applicant';
        if (data.applicantId && data.applicantId.trim() !== '') {
          const applicantDoc = await getDoc(doc(firestore, 'applicants', data.applicantId));
          if (applicantDoc.exists()) {
            applicantName = applicantDoc.data().fullName || applicantName;
          }
        }

        // Create notifications
        const uniqueRecipients = [...new Set(recipients)];
        for (const recipientId of uniqueRecipients) {
          // Filter out undefined values from metadata
          const metadata: any = {
            expenseId: docRef.id,
          };
          
          if (data.applicantId && data.applicantId.trim() !== '') metadata.applicantId = data.applicantId;
          if (applicantName && applicantName !== 'Unknown Applicant') metadata.applicantName = applicantName;
          if (data.category) metadata.category = data.category;
          if (data.amount !== undefined) metadata.amount = data.amount;
          if (data.enteredBy) metadata.enteredBy = data.enteredBy;
          
          await addDoc(notificationsRef, {
            type: 'expense_created',
            title: 'New Expense Submitted',
            body: `New ${data.category || 'expense'} expense of ₱${data.amount?.toLocaleString() || '0'} submitted${data.applicantId && data.applicantId.trim() !== '' ? ` for ${applicantName}` : ''}`,
            priority: 'medium',
            status: 'unread',
            recipientId: recipientId,
            recipientEmail: '',
            icon: '📝',
            metadata,
            createdAt: Timestamp.now(),
          });
        }

        console.log(`✅ Sent ${uniqueRecipients.length} notifications for new expense`);
      } catch (notifError) {
        console.error('Error sending expense creation notifications:', notifError);
      }

      return docRef.id;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create expense',
        loading: false,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateExpense: async (id, data) => {
    try {
      set({ loading: true, error: null });
      const docRef = doc(firestore, 'expenses', id);
      const timestamp = serverTimestamp();

      await updateDoc(docRef, {
        ...data,
        updatedAt: timestamp,
      });

      // Create audit log
      await setDoc(doc(collection(firestore, 'audit_logs')), {
        action: 'expense_updated',
        entityId: id,
        entityType: 'expense',
        performedBy: 'system',
        performedAt: timestamp,
        details: {
          changes: data,
        },
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update expense',
        loading: false,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteExpense: async (id) => {
    try {
      set({ loading: true, error: null });
      const expense = get().selectedExpense;

      if (expense?.receiptUrl) {
        // Delete receipt from storage
        const storageRef = ref(storage, expense.receiptUrl);
        await deleteObject(storageRef);
      }

      // Delete expense from Firestore
      await deleteDoc(doc(firestore, 'expenses', id));

      set({
        expenses: get().expenses.filter((e) => e.id !== id),
        selectedExpense: null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete expense',
        loading: false,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  uploadReceipt: async (expenseId, file) => {
    try {
      set({ loading: true, error: null });
      
      // Get expense to retrieve branchId
      const expenseDoc = await getDoc(doc(firestore, 'expenses', expenseId));
      if (!expenseDoc.exists()) {
        throw new Error('Expense not found');
      }
      
      const expenseData = expenseDoc.data();
      const branchId = expenseData.branchId;
      
      if (!branchId) {
        throw new Error('Expense does not have a branch ID');
      }
      
      const timestamp = Date.now();
      // Use expense_receipts path with branchId which matches storage.rules line 149
      const storageRef = ref(
        storage,
        `expense_receipts/${branchId}/${expenseId}/${timestamp}_${file.name}`
      );

      await uploadBytes(storageRef, file);
      const receiptUrl = await getDownloadURL(storageRef);

      await updateDoc(doc(firestore, 'expenses', expenseId), {
        receiptUrl,
        updatedAt: serverTimestamp(),
      });

      return receiptUrl;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to upload receipt',
        loading: false,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteReceipt: async (expenseId) => {
    try {
      set({ loading: true, error: null });
      const expense = get().selectedExpense;

      if (expense?.receiptUrl) {
        const storageRef = ref(storage, expense.receiptUrl);
        await deleteObject(storageRef);

        await updateDoc(doc(firestore, 'expenses', expenseId), {
          receiptUrl: null,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete receipt',
        loading: false,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  verifyExpense: async (verification) => {
    try {
      set({ loading: true, error: null });
      const timestamp = serverTimestamp();

      // Get expense data first
      const expenseDoc = await getDoc(doc(firestore, 'expenses', verification.expenseId));
      const expenseData = expenseDoc.data();

      // Update expense status
      await updateDoc(doc(firestore, 'expenses', verification.expenseId), {
        status: verification.status,
        verifiedBy: verification.verifiedBy,
        verifiedAt: timestamp,
        updatedAt: timestamp,
      });

      // Create verification record
      await setDoc(doc(collection(firestore, 'expense_verifications')), {
        ...verification,
        verifiedAt: timestamp,
      });

      // Create audit log
      await setDoc(doc(collection(firestore, 'audit_logs')), {
        action: 'expense_verified',
        entityId: verification.expenseId,
        entityType: 'expense',
        performedBy: verification.verifiedBy,
        performedAt: timestamp,
        details: verification,
      });

      // Send notifications
      if (expenseData) {
        try {
          const notificationsRef = collection(firestore, 'notifications');
          const recipients: string[] = [];

          // Notify HO Accountant who needs to approve after verification
          const accountantQuery = query(
            collection(firestore, 'users'),
            where('role', '==', 'ho_accountant')
          );
          const accountantSnapshot = await getDocs(accountantQuery);
          accountantSnapshot.docs.forEach(doc => recipients.push(doc.id));

          // Notify all admins
          const adminQuery = query(
            collection(firestore, 'users'),
            where('role', '==', 'admin')
          );
          const adminSnapshot = await getDocs(adminQuery);
          adminSnapshot.docs.forEach(doc => recipients.push(doc.id));

          // Get applicant name
          let applicantName = 'Unknown Applicant';
          if (expenseData.applicantId) {
            const applicantDoc = await getDoc(doc(firestore, 'applicants', expenseData.applicantId));
            if (applicantDoc.exists()) {
              applicantName = applicantDoc.data().fullName || applicantName;
            }
          }

          // Create notifications
          const uniqueRecipients = [...new Set(recipients)];
          for (const recipientId of uniqueRecipients) {
            await addDoc(notificationsRef, {
              type: 'expense_verified',
              title: 'Expense Verified - Pending Approval',
              body: `${expenseData.category} expense of ₱${expenseData.amount?.toLocaleString() || '0'} for ${applicantName} has been verified and needs approval`,
              priority: 'medium',
              status: 'unread',
              recipientId: recipientId,
              recipientEmail: '',
              icon: '✓',
              metadata: {
                expenseId: verification.expenseId,
                applicantId: expenseData.applicantId,
                applicantName,
                category: expenseData.category,
                amount: expenseData.amount,
                verifiedBy: verification.verifiedBy,
              },
              createdAt: Timestamp.now(),
            });
          }

          console.log(`✅ Sent ${uniqueRecipients.length} notifications for expense verification`);
        } catch (notifError) {
          console.error('Error sending expense verification notifications:', notifError);
        }
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to verify expense',
        loading: false,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  rejectExpense: async (expenseId, reason) => {
    try {
      set({ loading: true, error: null });
      const timestamp = serverTimestamp();

      // Get expense data first
      const expenseDoc = await getDoc(doc(firestore, 'expenses', expenseId));
      const expenseData = expenseDoc.data();

      await updateDoc(doc(firestore, 'expenses', expenseId), {
        status: 'rejected',
        notes: reason,
        updatedAt: timestamp,
      });

      // Create audit log
      await setDoc(doc(collection(firestore, 'audit_logs')), {
        action: 'expense_rejected',
        entityId: expenseId,
        entityType: 'expense',
        performedBy: 'system',
        performedAt: timestamp,
        details: {
          reason,
        },
      });

      // Send notifications
      if (expenseData) {
        try {
          const notificationsRef = collection(firestore, 'notifications');
          const recipients: string[] = [];

          // Notify the expense creator
          if (expenseData.enteredBy) {
            recipients.push(expenseData.enteredBy);
          }

          // Notify all admins
          const adminQuery = query(
            collection(firestore, 'users'),
            where('role', '==', 'admin')
          );
          const adminSnapshot = await getDocs(adminQuery);
          adminSnapshot.docs.forEach(doc => recipients.push(doc.id));

          // Get applicant name
          let applicantName = 'Unknown Applicant';
          if (expenseData.applicantId) {
            const applicantDoc = await getDoc(doc(firestore, 'applicants', expenseData.applicantId));
            if (applicantDoc.exists()) {
              applicantName = applicantDoc.data().fullName || applicantName;
            }
          }

          // Create notifications
          const uniqueRecipients = [...new Set(recipients)];
          for (const recipientId of uniqueRecipients) {
            await addDoc(notificationsRef, {
              type: 'expense_rejected',
              title: 'Expense Rejected',
              body: `${expenseData.category} expense of ₱${expenseData.amount?.toLocaleString() || '0'} for ${applicantName} has been rejected. Reason: ${reason}`,
              priority: 'high',
              status: 'unread',
              recipientId: recipientId,
              recipientEmail: '',
              icon: '❌',
              metadata: {
                expenseId,
                applicantId: expenseData.applicantId,
                applicantName,
                category: expenseData.category,
                amount: expenseData.amount,
                reason,
              },
              createdAt: Timestamp.now(),
            });
          }

          console.log(`✅ Sent ${uniqueRecipients.length} notifications for expense rejection`);
        } catch (notifError) {
          console.error('Error sending expense rejection notifications:', notifError);
        }
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to reject expense',
        loading: false,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  approveExpense: async (approval) => {
    try {
      set({ loading: true, error: null });
      const timestamp = serverTimestamp();

      // Get expense data first
      const expenseDoc = await getDoc(doc(firestore, 'expenses', approval.expenseId));
      const expenseData = expenseDoc.data();

      // Update expense status
      await updateDoc(doc(firestore, 'expenses', approval.expenseId), {
        status: approval.status,
        approvedBy: approval.approvedBy,
        approvedAt: timestamp,
        updatedAt: timestamp,
      });

      // Create approval record
      await setDoc(doc(collection(firestore, 'expense_approvals')), {
        ...approval,
        approvedAt: timestamp,
      });

      // Create audit log
      await setDoc(doc(collection(firestore, 'audit_logs')), {
        action: 'expense_approved',
        entityId: approval.expenseId,
        entityType: 'expense',
        performedBy: approval.approvedBy,
        performedAt: timestamp,
        details: approval,
      });

      // Send notifications
      if (expenseData) {
        try {
          const notificationsRef = collection(firestore, 'notifications');
          const recipients: string[] = [];

          // Notify the expense creator
          if (expenseData.enteredBy) {
            recipients.push(expenseData.enteredBy);
          }

          // Notify HO Accountant
          const accountantQuery = query(
            collection(firestore, 'users'),
            where('role', '==', 'ho_accountant')
          );
          const accountantSnapshot = await getDocs(accountantQuery);
          accountantSnapshot.docs.forEach(doc => recipients.push(doc.id));

          // Notify all admins
          const adminQuery = query(
            collection(firestore, 'users'),
            where('role', '==', 'admin')
          );
          const adminSnapshot = await getDocs(adminQuery);
          adminSnapshot.docs.forEach(doc => recipients.push(doc.id));

          // Get applicant name
          let applicantName = 'Unknown Applicant';
          if (expenseData.applicantId) {
            const applicantDoc = await getDoc(doc(firestore, 'applicants', expenseData.applicantId));
            if (applicantDoc.exists()) {
              applicantName = applicantDoc.data().fullName || applicantName;
            }
          }

          // Create notifications
          const uniqueRecipients = [...new Set(recipients)];
          for (const recipientId of uniqueRecipients) {
            await addDoc(notificationsRef, {
              type: 'expense_approved',
              title: 'Expense Approved',
              body: `${expenseData.category} expense of ₱${expenseData.amount?.toLocaleString() || '0'} for ${applicantName} has been approved`,
              priority: 'high',
              status: 'unread',
              recipientId: recipientId,
              recipientEmail: '',
              icon: '✅',
              metadata: {
                expenseId: approval.expenseId,
                applicantId: expenseData.applicantId,
                applicantName,
                category: expenseData.category,
                amount: expenseData.amount,
                approvedBy: approval.approvedBy,
              },
              createdAt: Timestamp.now(),
            });
          }

          console.log(`✅ Sent ${uniqueRecipients.length} notifications for expense approval`);
        } catch (notifError) {
          console.error('Error sending expense approval notifications:', notifError);
        }
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to approve expense',
        loading: false,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  recordPayment: async (payment) => {
    try {
      set({ loading: true, error: null });
      const timestamp = serverTimestamp();

      // Update expense status
      await updateDoc(doc(firestore, 'expenses', payment.expenseId), {
        status: 'paid',
        paidBy: payment.paidBy,
        paidAt: timestamp,
        updatedAt: timestamp,
      });

      // Create payment record
      await setDoc(doc(collection(firestore, 'expense_payments')), {
        ...payment,
        paidAt: timestamp,
      });

      // Create audit log
      await setDoc(doc(collection(firestore, 'audit_logs')), {
        action: 'expense_paid',
        entityId: payment.expenseId,
        entityType: 'expense',
        performedBy: payment.paidBy,
        performedAt: timestamp,
        details: payment,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to record payment',
        loading: false,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
