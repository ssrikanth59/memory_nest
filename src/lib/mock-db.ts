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

export interface MockMemory {
  _id: string;
  title: string;
  description: string;
  date: string;
  type: string;
  mediaUrl: string;
  pin: string;
  userId: string;
  isFavorite: boolean;
  createdAt: string;
}

// In-memory store (clears on server restart, but allows "making it work" instantly)
const mockUsers: MockUser[] = [];
const mockMemories: MockMemory[] = [];

export const MockDB = {
  // USER METHODS
  async findUserByEmail(email: string): Promise<MockUser | null> {
    return mockUsers.find(u => u.email === email) || null;
  },

  async createUser(user: Omit<MockUser, 'id'>): Promise<MockUser> {
    const newUser = { ...user, id: 'mock-user-' + Math.random().toString(36).substring(7) };
    mockUsers.push(newUser);
    return newUser;
  },

  // MEMORY METHODS
  async createMemory(memory: Omit<MockMemory, '_id' | 'createdAt' | 'isFavorite'>): Promise<MockMemory> {
    const newMemory: MockMemory = { 
      ...memory, 
      _id: 'mock-mem-' + Math.random().toString(36).substring(7),
      isFavorite: false,
      createdAt: new Date().toISOString()
    };
    mockMemories.push(newMemory);
    return newMemory;
  },

  async findMemories(userId: string, filter: { type?: string | null, isFavorite?: boolean } = {}): Promise<MockMemory[]> {
    return mockMemories.filter(m => {
      if (m.userId !== userId) return false;
      if (filter.isFavorite && !m.isFavorite) return false;
      if (filter.type && m.type !== filter.type) return false;
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async updateMemory(id: string, userId: string, updates: Partial<MockMemory>): Promise<MockMemory | null> {
    const index = mockMemories.findIndex(m => m._id === id && m.userId === userId);
    if (index === -1) return null;
    mockMemories[index] = { ...mockMemories[index], ...updates };
    return mockMemories[index];
  },

  async getStats(userId: string) {
    const userMems = mockMemories.filter(m => m.userId === userId);
    return {
      totalMemories: userMems.length,
      videos: userMems.filter(m => m.type === 'video').length,
      favorites: userMems.filter(m => m.isFavorite).length,
      capsules: 0 // Mocking for now
    };
  }
};
