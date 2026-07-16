// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// API Functions
const api = {
    // Get all records
    async getRecords() {
        try {
            const response = await fetch(`${API_BASE_URL}/records`);
            if (!response.ok) throw new Error('Failed to fetch records');
            return await response.json();
        } catch (error) {
            console.error('Error fetching records:', error);
            return [];
        }
    },

    // Get single record by ID
    async getRecord(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/records/${id}`);
            if (!response.ok) throw new Error('Failed to fetch record');
            return await response.json();
        } catch (error) {
            console.error('Error fetching record:', error);
            return null;
        }
    },

    // Create new record
    async createRecord(data) {
        try {
            const response = await fetch(`${API_BASE_URL}/records`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to create record');
            return await response.json();
        } catch (error) {
            console.error('Error creating record:', error);
            throw error;
        }
    },

    // Update record
    async updateRecord(id, data) {
        try {
            const response = await fetch(`${API_BASE_URL}/records/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to update record');
            return await response.json();
        } catch (error) {
            console.error('Error updating record:', error);
            throw error;
        }
    },

    // Delete record
    async deleteRecord(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/records/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete record');
            return await response.json();
        } catch (error) {
            console.error('Error deleting record:', error);
            throw error;
        }
    },

    // Delete all records
    async deleteAllRecords() {
        try {
            const response = await fetch(`${API_BASE_URL}/records`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete all records');
            return await response.json();
        } catch (error) {
            console.error('Error deleting all records:', error);
            throw error;
        }
    }
};
