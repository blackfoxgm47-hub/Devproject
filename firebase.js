// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZwYUxZDwCHVl2Fg84ZXmMpIUFHeDW1hA",
  authDomain: "chicken-hatching.firebaseapp.com",
  projectId: "chicken-hatching",
  storageBucket: "chicken-hatching.firebasestorage.app",
  messagingSenderId: "1092926585096",
  appId: "1:1092926585096:web:b358a675cc3eda96bd94bd",
  measurementId: "G-2KG56LRXBB"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// Firebase API wrapper
const firebaseApi = {
    // Get all records from Firestore
    async getRecords() {
        try {
            const snapshot = await db.collection('hatching_records')
                .orderBy('timestamp', 'desc')
                .limit(50)
                .get();
            
            const records = [];
            snapshot.forEach(doc => {
                records.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            return records;
        } catch (error) {
            console.error('Error fetching records:', error);
            throw error;
        }
    },

    // Get a specific record by ID
    async getRecord(id) {
        try {
            const doc = await db.collection('hatching_records').doc(id).get();
            if (doc.exists) {
                return {
                    id: doc.id,
                    ...doc.data()
                };
            }
            return null;
        } catch (error) {
            console.error('Error fetching record:', error);
            throw error;
        }
    },

    // Create a new record
    async createRecord(record) {
        try {
            // Get current sequence number
            const sequenceDoc = await db.collection('sequence_counter').doc('counter').get();
            let nextSequence = 1;
            
            if (sequenceDoc.exists) {
                nextSequence = sequenceDoc.data().last_sequence + 1;
            }
            
            // Add sequence number to record
            record.sequence_number = nextSequence;
            
            // Create record
            const docRef = await db.collection('hatching_records').add(record);
            
            // Update sequence counter
            await db.collection('sequence_counter').doc('counter').set({
                last_sequence: nextSequence
            });
            
            return {
                id: docRef.id,
                ...record
            };
        } catch (error) {
            console.error('Error creating record:', error);
            throw error;
        }
    },

    // Delete a specific record
    async deleteRecord(id) {
        try {
            await db.collection('hatching_records').doc(id).delete();
        } catch (error) {
            console.error('Error deleting record:', error);
            throw error;
        }
    },

    // Delete all records
    async deleteAllRecords() {
        try {
            const snapshot = await db.collection('hatching_records').get();
            const batch = db.batch();
            
            snapshot.forEach(doc => {
                batch.delete(doc.ref);
            });
            
            await batch.commit();
            
            // Reset sequence counter
            await db.collection('sequence_counter').doc('counter').set({
                last_sequence: 0
            });
        } catch (error) {
            console.error('Error deleting all records:', error);
            throw error;
        }
    },

    // Add record (alias for createRecord)
    async addRecord(record) {
        return this.createRecord(record);
    },

    // Sync data to Firebase
    async syncData(records) {
        try {
            const batch = db.batch();
            const collectionRef = db.collection('hatching_records');
            
            for (const record of records) {
                if (record.id) {
                    // Update existing record
                    const docRef = collectionRef.doc(record.id);
                    batch.set(docRef, record, { merge: true });
                } else {
                    // Create new record
                    const docRef = collectionRef.doc();
                    batch.set(docRef, record);
                }
            }
            
            await batch.commit();
            return { success: true, synced: records.length };
        } catch (error) {
            console.error('Error syncing data:', error);
            throw error;
        }
    },

    // Add activity log
    async addActivityLog(logEntry) {
        try {
            await db.collection('activity_logs').add(logEntry);
            return { success: true };
        } catch (error) {
            console.error('Error adding activity log:', error);
            throw error;
        }
    }
};
