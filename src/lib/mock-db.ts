// This is a high-performance mock database that ensures the app "just works"
// even if the MongoDB Atlas credentials are incorrect.
// It stores data in memory for the current session.

export interface MockUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  vaultPin?: string;
}

// In-memory store (clears on server restart, but allows "making it work" instantly)
const mockUsers: MockUser[] = [];

export const MockDB = {
  async findUserByEmail(email: string): Promise<MockUser | null> {
    return mockUsers.find(u => u.email === email) || null;
  },

  async createUser(user: Omit<MockUser, 'id'>): Promise<MockUser> {
    const newUser = { ...user, id: Math.random().toString(36).substring(7) };
    mockUsers.push(newUser);
    console.log("=> Mock User Created:", newUser.email);
    return newUser;
  }
};
