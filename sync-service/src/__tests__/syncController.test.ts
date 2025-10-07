import { SyncController } from '../syncController';
import { config } from '../config';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock logger
jest.mock('../logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
  logSyncAction: jest.fn(),
}));

describe('SyncController', () => {
  let syncController: SyncController;
  let mockAdminClient: any;
  let mockUserClient: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock axios.create to return mock clients
    mockAdminClient = {
      request: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    };

    mockUserClient = {
      request: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    };

    mockedAxios.create = jest.fn()
      .mockReturnValueOnce(mockAdminClient)
      .mockReturnValueOnce(mockUserClient);

    syncController = new SyncController();
  });

  describe('fetchFromAdmin', () => {
    it('should fetch data from admin API successfully', async () => {
      const mockData = [
        { id: '1', title: 'Article 1', body: 'Content 1' },
        { id: '2', title: 'Article 2', body: 'Content 2' },
      ];

      mockAdminClient.request.mockResolvedValue({ data: mockData });

      const result = await syncController.fetchFromAdmin('/admin/articles', {
        page: 1,
        limit: 10,
      });

      expect(result.data).toEqual(mockData);
      expect(mockAdminClient.request).toHaveBeenCalledWith({
        method: 'GET',
        url: '/admin/articles',
        params: { page: 1, limit: 10 },
      });
    });

    it('should handle paginated response format', async () => {
      const mockResponse = {
        data: [{ id: '1', title: 'Article 1' }],
        page: 1,
        totalPages: 5,
        total: 50,
      };

      mockAdminClient.request.mockResolvedValue({ data: mockResponse });

      const result = await syncController.fetchFromAdmin('/admin/articles');

      expect(result.data).toEqual(mockResponse.data);
      expect(result.meta?.page).toBe(1);
      expect(result.meta?.total).toBe(50);
    });

    it('should handle errors when fetching from admin API', async () => {
      const error = new Error('Network error');
      mockAdminClient.request.mockRejectedValue(error);

      await expect(
        syncController.fetchFromAdmin('/admin/articles')
      ).rejects.toThrow('Network error');
    });
  });

  describe('transformForUser', () => {
    it('should transform user data correctly', () => {
      const mapping = config.mappings.find(m => m.name === 'updateUser')!;
      const adminData = {
        _id: '68e09ac5d30baad87b6d81b0',
        name: 'John Doe',
        email: 'john@example.com',
        level: 'Gold',
        accountBalance: 50000,
        totalEarnings: 25000,
        campaignsCompleted: 15,
        creditScore: 100,
      };

      const result = syncController.transformForUser(adminData, mapping);

      expect(result.name).toBe('John Doe');
      expect(result.level).toBe('Gold');
      expect(result.accountBalance).toBe(50000);
      expect(result.totalEarnings).toBe(25000);
      expect(result.campaignsCompleted).toBe(15);
      expect(result.creditScore).toBe(100);
    });

    it('should transform campaign data correctly', () => {
      const mapping = config.mappings.find(m => m.name === 'syncCampaigns')!;
      const adminData = {
        _id: '68e09adcd30baad87b6d81b4',
        brand: 'Nike',
        logo: '👟',
        description: 'Nike shoe promotion',
        type: 'Social',
        commissionRate: 15,
        commissionAmount: 7500,
        baseAmount: 50000,
        profit: 7500,
        requirements: ['Post on Instagram'],
        duration: 14,
        maxParticipants: 200,
        startDate: '2025-10-05T00:00:00.000Z',
        endDate: '2025-10-19T00:00:00.000Z',
      };

      const result = syncController.transformForUser(adminData, mapping);

      expect(result.brand).toBe('Nike');
      expect(result.type).toBe('Social');
      expect(result.commissionRate).toBe(15);
      expect(result.duration).toBe(14);
    });
  });

  describe('sendToUser', () => {
    it('should send data to user API in sync mode', async () => {
      const mockResponse = { id: 'user-1', success: true };
      mockUserClient.request.mockResolvedValue({ data: mockResponse });

      const payload = { title: 'Test', content: 'Content' };
      const result = await syncController.sendToUser(
        '/api/articles',
        'POST',
        payload,
        'idempotency-key-1',
        false
      );

      expect(result).toEqual(mockResponse);
      expect(mockUserClient.request).toHaveBeenCalledWith({
        method: 'POST',
        url: '/api/articles',
        data: payload,
        headers: { 'x-idempotency-key': 'idempotency-key-1' },
      });
    });

    it('should not send data in dry-run mode', async () => {
      const payload = { title: 'Test', content: 'Content' };
      const result = await syncController.sendToUser(
        '/api/articles',
        'POST',
        payload,
        'idempotency-key-1',
        true
      );

      expect(result.dryRun).toBe(true);
      expect(result.payload).toEqual(payload);
      expect(mockUserClient.request).not.toHaveBeenCalled();
    });
  });

  describe('runBatchSync', () => {
    it('should successfully sync data in dry-run mode', async () => {
      const mockAdminData = [
        { id: '1', title: 'Article 1', body: 'Content 1', authorId: 'author-1' },
        { id: '2', title: 'Article 2', body: 'Content 2', authorId: 'author-2' },
      ];

      mockAdminClient.request.mockResolvedValue({ data: mockAdminData });

      const result = await syncController.runBatchSync('createArticle', {
        mode: 'dry-run',
        limit: 10,
      });

      expect(result.success).toBe(true);
      expect(result.dryRun).toBe(true);
      expect(result.processedCount).toBe(2);
      expect(result.successCount).toBe(2);
      expect(result.failureCount).toBe(0);
      expect(result.actions).toHaveLength(2);
    });

    it('should return error for non-existent mapping', async () => {
      const result = await syncController.runBatchSync('nonExistentMapping');

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toContain('not found');
    });

    it('should handle partial failures gracefully', async () => {
      const mockAdminData = [
        { id: '1', title: 'Article 1', body: 'Content 1', authorId: 'author-1' },
        { id: '2', title: 'Article 2', body: 'Content 2', authorId: 'author-2' },
      ];

      mockAdminClient.request.mockResolvedValue({ data: mockAdminData });
      mockUserClient.request
        .mockResolvedValueOnce({ data: { id: 'user-1' } })
        .mockRejectedValueOnce(new Error('User API error'));

      const result = await syncController.runBatchSync('createArticle', {
        mode: 'sync',
        limit: 10,
      });

      expect(result.processedCount).toBe(2);
      expect(result.successCount).toBe(1);
      expect(result.failureCount).toBe(1);
      expect(result.errors).toHaveLength(1);
    });
  });
});
