import { 
  users, warehouses, dataSources, queryHistory, charts, dashboards, aiConversations, companies,
  type User, type InsertUser, type Warehouse, type InsertWarehouse,
  type DataSource, type InsertDataSource, type QueryHistory, type InsertQueryHistory,
  type Chart, type InsertChart, type Dashboard, type InsertDashboard,
  type AIConversation, type InsertAIConversation, type Company, type InsertCompany
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createUserWithPassword(username: string, email: string, passwordHash: string): Promise<User>;

  // Warehouse operations
  getUserWarehouses(userId: number): Promise<Warehouse[]>;
  getWarehouse(id: number): Promise<Warehouse | undefined>;
  createWarehouse(warehouse: InsertWarehouse): Promise<Warehouse>;
  updateWarehouse(id: number, updates: Partial<Warehouse>): Promise<Warehouse | undefined>;
  deleteWarehouse(id: number): Promise<boolean>;

  // Data source operations
  getUserDataSources(userId: number): Promise<DataSource[]>;
  getDataSource(id: number): Promise<DataSource | undefined>;
  createDataSource(dataSource: InsertDataSource): Promise<DataSource>;
  updateDataSource(id: number, updates: Partial<DataSource>): Promise<DataSource | undefined>;
  deleteDataSource(id: number): Promise<boolean>;

  // Query history operations
  getUserQueryHistory(userId: number): Promise<QueryHistory[]>;
  createQueryHistory(query: InsertQueryHistory): Promise<QueryHistory>;

  // Chart operations
  getUserCharts(userId: number): Promise<Chart[]>;
  getChart(id: number): Promise<Chart | undefined>;
  createChart(chart: InsertChart): Promise<Chart>;
  updateChart(id: number, updates: Partial<Chart>): Promise<Chart | undefined>;
  deleteChart(id: number): Promise<boolean>;

  // Dashboard operations
  getUserDashboards(userId: number): Promise<Dashboard[]>;
  getDashboard(id: number): Promise<Dashboard | undefined>;
  createDashboard(dashboard: InsertDashboard): Promise<Dashboard>;
  updateDashboard(id: number, updates: Partial<Dashboard>): Promise<Dashboard | undefined>;
  deleteDashboard(id: number): Promise<boolean>;

  // AI conversation operations
  getUserConversations(userId: number): Promise<AIConversation[]>;
  getConversation(id: number): Promise<AIConversation | undefined>;
  createConversation(conversation: InsertAIConversation): Promise<AIConversation>;
  updateConversation(id: number, updates: Partial<AIConversation>): Promise<AIConversation | undefined>;

  // Company operations
  getUserCompanies(userId: number): Promise<Company[]>;
  getCompany(id: number): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, updates: Partial<Company>): Promise<Company | undefined>;
  deleteCompany(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private warehouses: Map<number, Warehouse> = new Map();
  private dataSources: Map<number, DataSource> = new Map();
  private queryHistory: Map<number, QueryHistory> = new Map();
  private charts: Map<number, Chart> = new Map();
  private dashboards: Map<number, Dashboard> = new Map();
  private aiConversations: Map<number, AIConversation> = new Map();
  private companies: Map<number, Company> = new Map();
  
  private currentId: { [key: string]: number } = {
    users: 1,
    warehouses: 1,
    dataSources: 1,
    queryHistory: 1,
    charts: 1,
    dashboards: 1,
    aiConversations: 1,
    companies: 1,
  };

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default user
    const defaultUser: User = {
      id: 1,
      username: "admin",
      email: "admin@dataflow.com",
      passwordHash: "$2b$10$dummy.hash.for.testing",
      firstName: "John",
      lastName: "Smith",
      role: "admin",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(1, defaultUser);
    this.currentId.users = 2;

    // Create default warehouses
    const defaultWarehouses: Warehouse[] = [
      {
        id: 1,
        name: "ANALYTICS_WH",
        size: "Large",
        status: "running",
        creditsPerHour: "8.000",
        nodes: 8,
        autoSuspend: true,
        userId: 1,
        createdAt: new Date(),
      },
      {
        id: 2,
        name: "ETL_WH",
        size: "X-Large",
        status: "suspended",
        creditsPerHour: "16.000",
        nodes: 16,
        autoSuspend: true,
        userId: 1,
        createdAt: new Date(),
      },
    ];
    defaultWarehouses.forEach(wh => this.warehouses.set(wh.id, wh));
    this.currentId.warehouses = 3;

    // Create sample companies
    const sampleCompanies: Company[] = [
      {
        id: 1,
        name: "TechCorp",
        sector: "Technology",
        region: "North America",
        foundedDate: new Date("2015-01-01"),
        employees: 250,
        revenue: "45200000",
        ebitda: "12500000",
        netIncome: "8300000",
        totalAssets: "65000000",
        totalDebt: "15000000",
        equity: "50000000",
        marketCap: "180000000",
        description: "Leading software solutions provider",
        stage: "growth",
        userId: 1,
        createdAt: new Date(),
      },
      {
        id: 2,
        name: "GreenSolutions",
        sector: "Energy",
        region: "Europe",
        foundedDate: new Date("2018-03-15"),
        employees: 180,
        revenue: "38900000",
        ebitda: "9200000",
        netIncome: "6100000",
        totalAssets: "52000000",
        totalDebt: "12000000",
        equity: "40000000",
        marketCap: "145000000",
        description: "Renewable energy solutions",
        stage: "growth",
        userId: 1,
        createdAt: new Date(),
      },
      {
        id: 3,
        name: "FinanceInc",
        sector: "Financial",
        region: "North America",
        foundedDate: new Date("2012-06-01"),
        employees: 320,
        revenue: "52100000",
        ebitda: "15800000",
        netIncome: "11200000",
        totalAssets: "85000000",
        totalDebt: "18000000",
        equity: "67000000",
        marketCap: "220000000",
        description: "Financial technology services",
        stage: "mature",
        userId: 1,
        createdAt: new Date(),
      },
    ];
    sampleCompanies.forEach(company => this.companies.set(company.id, company));
    this.currentId.companies = 4;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUserWithPassword(username: string, email: string, passwordHash: string): Promise<User> {
    const id = ++this.currentId.users;
    const user: User = {
      id,
      username,
      email,
      passwordHash,
      firstName: null,
      lastName: null,
      role: "user",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = { 
      ...insertUser, 
      id,
      email: insertUser.email || null,
      firstName: null,
      lastName: null,
      role: "user",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Warehouse operations
  async getUserWarehouses(userId: number): Promise<Warehouse[]> {
    return Array.from(this.warehouses.values()).filter(wh => wh.userId === userId);
  }

  async getWarehouse(id: number): Promise<Warehouse | undefined> {
    return this.warehouses.get(id);
  }

  async createWarehouse(insertWarehouse: InsertWarehouse): Promise<Warehouse> {
    const id = this.currentId.warehouses++;
    const warehouse: Warehouse = {
      ...insertWarehouse,
      id,
      createdAt: new Date(),
      status: insertWarehouse.status || 'running',
      autoSuspend: insertWarehouse.autoSuspend ?? true,
      userId: insertWarehouse.userId || 1
    };
    this.warehouses.set(id, warehouse);
    return warehouse;
  }

  async updateWarehouse(id: number, updates: Partial<Warehouse>): Promise<Warehouse | undefined> {
    const warehouse = this.warehouses.get(id);
    if (!warehouse) return undefined;
    
    const updated = { ...warehouse, ...updates };
    this.warehouses.set(id, updated);
    return updated;
  }

  async deleteWarehouse(id: number): Promise<boolean> {
    return this.warehouses.delete(id);
  }

  // Data source operations
  async getUserDataSources(userId: number): Promise<DataSource[]> {
    return Array.from(this.dataSources.values()).filter(ds => ds.userId === userId);
  }

  async getDataSource(id: number): Promise<DataSource | undefined> {
    return this.dataSources.get(id);
  }

  async createDataSource(insertDataSource: InsertDataSource): Promise<DataSource> {
    const id = this.currentId.dataSources++;
    const dataSource: DataSource = {
      ...insertDataSource,
      id,
      createdAt: new Date(),
      status: insertDataSource.status || 'ready',
      userId: insertDataSource.userId || 1,
      schema: insertDataSource.schema || {},
      fileName: insertDataSource.fileName || null,
      filePath: insertDataSource.filePath || null,
      rowCount: insertDataSource.rowCount || 0
    };
    this.dataSources.set(id, dataSource);
    return dataSource;
  }

  async updateDataSource(id: number, updates: Partial<DataSource>): Promise<DataSource | undefined> {
    const dataSource = this.dataSources.get(id);
    if (!dataSource) return undefined;
    
    const updated = { ...dataSource, ...updates };
    this.dataSources.set(id, updated);
    return updated;
  }

  async deleteDataSource(id: number): Promise<boolean> {
    return this.dataSources.delete(id);
  }

  // Query history operations
  async getUserQueryHistory(userId: number): Promise<QueryHistory[]> {
    return Array.from(this.queryHistory.values())
      .filter(qh => qh.userId === userId)
      .sort((a, b) => (b.executedAt?.getTime() || 0) - (a.executedAt?.getTime() || 0));
  }

  async createQueryHistory(insertQuery: InsertQueryHistory): Promise<QueryHistory> {
    const id = this.currentId.queryHistory++;
    const query: QueryHistory = {
      ...insertQuery,
      id,
      executedAt: new Date(),
      userId: insertQuery.userId || 1,
      warehouseId: insertQuery.warehouseId || 1,
      duration: insertQuery.duration || null,
      rowsReturned: insertQuery.rowsReturned || null,
      creditsUsed: insertQuery.creditsUsed || null
    };
    this.queryHistory.set(id, query);
    return query;
  }

  // Chart operations
  async getUserCharts(userId: number): Promise<Chart[]> {
    return Array.from(this.charts.values()).filter(chart => chart.userId === userId);
  }

  async getChart(id: number): Promise<Chart | undefined> {
    return this.charts.get(id);
  }

  async createChart(insertChart: InsertChart): Promise<Chart> {
    const id = this.currentId.charts++;
    const chart: Chart = {
      ...insertChart,
      id,
      createdAt: new Date(),
      userId: insertChart.userId || 1,
      dataSourceId: insertChart.dataSourceId || null
    };
    this.charts.set(id, chart);
    return chart;
  }

  async updateChart(id: number, updates: Partial<Chart>): Promise<Chart | undefined> {
    const chart = this.charts.get(id);
    if (!chart) return undefined;
    
    const updated = { ...chart, ...updates };
    this.charts.set(id, updated);
    return updated;
  }

  async deleteChart(id: number): Promise<boolean> {
    return this.charts.delete(id);
  }

  // Dashboard operations
  async getUserDashboards(userId: number): Promise<Dashboard[]> {
    return Array.from(this.dashboards.values()).filter(dashboard => dashboard.userId === userId);
  }

  async getDashboard(id: number): Promise<Dashboard | undefined> {
    return this.dashboards.get(id);
  }

  async createDashboard(insertDashboard: InsertDashboard): Promise<Dashboard> {
    const id = this.currentId.dashboards++;
    const dashboard: Dashboard = {
      ...insertDashboard,
      id,
      createdAt: new Date(),
      userId: insertDashboard.userId || 1
    };
    this.dashboards.set(id, dashboard);
    return dashboard;
  }

  async updateDashboard(id: number, updates: Partial<Dashboard>): Promise<Dashboard | undefined> {
    const dashboard = this.dashboards.get(id);
    if (!dashboard) return undefined;
    
    const updated = { ...dashboard, ...updates };
    this.dashboards.set(id, updated);
    return updated;
  }

  async deleteDashboard(id: number): Promise<boolean> {
    return this.dashboards.delete(id);
  }

  // AI conversation operations
  async getUserConversations(userId: number): Promise<AIConversation[]> {
    return Array.from(this.aiConversations.values()).filter(conversation => conversation.userId === userId);
  }

  async getConversation(id: number): Promise<AIConversation | undefined> {
    return this.aiConversations.get(id);
  }

  async createConversation(insertConversation: InsertAIConversation): Promise<AIConversation> {
    const id = this.currentId.aiConversations++;
    const conversation: AIConversation = {
      ...insertConversation,
      id,
      createdAt: new Date(),
      userId: insertConversation.userId || 1,
      context: insertConversation.context || null
    };
    this.aiConversations.set(id, conversation);
    return conversation;
  }

  async updateConversation(id: number, updates: Partial<AIConversation>): Promise<AIConversation | undefined> {
    const conversation = this.aiConversations.get(id);
    if (!conversation) return undefined;
    
    const updated = { ...conversation, ...updates };
    this.aiConversations.set(id, updated);
    return updated;
  }

  // Company operations
  async getUserCompanies(userId: number): Promise<Company[]> {
    return Array.from(this.companies.values()).filter(company => company.userId === userId);
  }

  async getCompany(id: number): Promise<Company | undefined> {
    return this.companies.get(id);
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const id = this.currentId.companies++;
    const company: Company = {
      ...insertCompany,
      id,
      createdAt: new Date(),
      userId: insertCompany.userId || 1,
      description: insertCompany.description || null,
      foundedDate: insertCompany.foundedDate || null,
      employees: insertCompany.employees || null,
      revenue: insertCompany.revenue || null,
      ebitda: insertCompany.ebitda || null,
      totalAssets: insertCompany.totalAssets || null,
      totalDebt: insertCompany.totalDebt || null,
      marketCap: insertCompany.marketCap || null,
      netIncome: insertCompany.netIncome || null,
      equity: insertCompany.equity || null,
      stage: insertCompany.stage || null
    };
    this.companies.set(id, company);
    return company;
  }

  async updateCompany(id: number, updates: Partial<Company>): Promise<Company | undefined> {
    const company = this.companies.get(id);
    if (!company) return undefined;
    
    const updated = { ...company, ...updates };
    this.companies.set(id, updated);
    return updated;
  }

  async deleteCompany(id: number): Promise<boolean> {
    return this.companies.delete(id);
  }
}

export const storage = new MemStorage();
