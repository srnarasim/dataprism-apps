/**
 * Sample data generators for DataPrism Analytics Demo
 */

import type { SampleDataSet } from '@/types/data';

// Utility functions for data generation
const randomFromArray = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomDate = (start: Date, end: Date): Date => 
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const randomFloat = (min: number, max: number, decimals = 2): number =>
  parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// Sales Dataset Generator
const generateSalesData = async (): Promise<any[]> => {
  const products = ['Laptop', 'Desktop', 'Monitor', 'Keyboard', 'Mouse', 'Headphones', 'Tablet', 'Phone'];
  const regions = ['North', 'South', 'East', 'West', 'Central'];
  const salesPeople = ['Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson', 'Eva Brown', 'Frank Miller'];
  const channels = ['Online', 'Retail', 'Partner', 'Direct'];
  
  const data = [];
  const startDate = new Date('2023-01-01');
  const endDate = new Date('2024-12-31');
  
  for (let i = 0; i < 5000; i++) {
    const product = randomFromArray(products);
    const basePrice = product === 'Laptop' ? 1200 : product === 'Desktop' ? 800 : 
                     product === 'Monitor' ? 300 : product === 'Tablet' ? 500 : 
                     product === 'Phone' ? 700 : 50;
    
    data.push({
      id: i + 1,
      date: randomDate(startDate, endDate).toISOString().split('T')[0],
      product,
      region: randomFromArray(regions),
      salesperson: randomFromArray(salesPeople),
      channel: randomFromArray(channels),
      quantity: randomInt(1, 20),
      unit_price: randomFloat(basePrice * 0.8, basePrice * 1.2),
      discount_percent: randomFloat(0, 25),
      customer_type: randomFromArray(['New', 'Existing', 'Premium']),
      is_fulfilled: Math.random() > 0.1,
    });
  }
  
  return data.map(row => ({
    ...row,
    total_amount: parseFloat((row.quantity * row.unit_price * (1 - row.discount_percent / 100)).toFixed(2))
  }));
};

// Financial Dataset Generator
const generateFinancialData = async (): Promise<any[]> => {
  const companies = [
    'Apple Inc', 'Microsoft Corp', 'Amazon.com', 'Alphabet Inc', 'Tesla Inc',
    'Meta Platforms', 'NVIDIA Corp', 'Netflix Inc', 'Adobe Inc', 'Salesforce'
  ];
  
  const metrics = ['Revenue', 'Net Income', 'Total Assets', 'Total Liabilities', 'Cash Flow'];
  const data = [];
  
  for (const company of companies) {
    for (let year = 2019; year <= 2024; year++) {
      for (let quarter = 1; quarter <= 4; quarter++) {
        const baseRevenue = randomFloat(10000, 100000);
        
        data.push({
          company,
          year,
          quarter,
          period: `${year}-Q${quarter}`,
          revenue: randomFloat(baseRevenue * 0.9, baseRevenue * 1.1),
          net_income: randomFloat(baseRevenue * 0.1, baseRevenue * 0.3),
          total_assets: randomFloat(baseRevenue * 2, baseRevenue * 5),
          total_liabilities: randomFloat(baseRevenue * 0.8, baseRevenue * 2),
          operating_expenses: randomFloat(baseRevenue * 0.6, baseRevenue * 0.8),
          rd_expenses: randomFloat(baseRevenue * 0.05, baseRevenue * 0.2),
          market_cap: randomFloat(baseRevenue * 10, baseRevenue * 50),
          pe_ratio: randomFloat(10, 40),
          debt_to_equity: randomFloat(0.1, 2.0),
          growth_rate: randomFloat(-10, 25),
        });
      }
    }
  }
  
  return data;
};

// Employee Dataset Generator
const generateEmployeeData = async (): Promise<any[]> => {
  const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations', 'Legal'];
  const positions = [
    'Manager', 'Senior', 'Junior', 'Lead', 'Director', 'VP', 'Analyst', 'Specialist'
  ];
  const locations = ['New York', 'San Francisco', 'Seattle', 'Austin', 'Boston', 'Chicago', 'Remote'];
  
  const firstNames = [
    'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
    'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica'
  ];
  
  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas'
  ];
  
  const data = [];
  const startDate = new Date('2020-01-01');
  const endDate = new Date('2024-01-01');
  
  for (let i = 0; i < 2500; i++) {
    const hireDate = randomDate(startDate, endDate);
    const department = randomFromArray(departments);
    const baseSalary = department === 'Engineering' ? 95000 : 
                     department === 'Sales' ? 70000 :
                     department === 'Marketing' ? 65000 : 60000;
    
    data.push({
      employee_id: i + 1001,
      first_name: randomFromArray(firstNames),
      last_name: randomFromArray(lastNames),
      email: `employee${i + 1}@company.com`,
      department,
      position: randomFromArray(positions),
      location: randomFromArray(locations),
      hire_date: hireDate.toISOString().split('T')[0],
      salary: randomInt(baseSalary * 0.7, baseSalary * 1.5),
      bonus_percent: randomFloat(0, 20),
      years_experience: randomInt(1, 25),
      performance_rating: randomFloat(2.5, 5.0),
      is_manager: Math.random() > 0.8,
      is_remote: randomFromArray(locations) === 'Remote',
      education_level: randomFromArray(['High School', 'Bachelor', 'Master', 'PhD']),
      gender: randomFromArray(['Male', 'Female', 'Other']),
      age: randomInt(22, 65),
    });
  }
  
  return data;
};

// Inventory Dataset Generator
const generateInventoryData = async (): Promise<any[]> => {
  const categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Automotive'];
  const suppliers = ['Supplier A', 'Supplier B', 'Supplier C', 'Global Corp', 'Local Supply', 'Direct Import'];
  const warehouses = ['Warehouse 1', 'Warehouse 2', 'Warehouse 3', 'Distribution Center A', 'DC-West', 'DC-East'];
  
  const data = [];
  
  for (let i = 0; i < 3000; i++) {
    const category = randomFromArray(categories);
    const unitCost = randomFloat(5, 500);
    const stock = randomInt(0, 1000);
    const reorderLevel = randomInt(10, 100);
    
    data.push({
      sku: `SKU${String(i + 1).padStart(6, '0')}`,
      product_name: `Product ${i + 1}`,
      category,
      supplier: randomFromArray(suppliers),
      warehouse: randomFromArray(warehouses),
      unit_cost: unitCost,
      selling_price: randomFloat(unitCost * 1.2, unitCost * 3),
      current_stock: stock,
      reorder_level: reorderLevel,
      max_stock: randomInt(reorderLevel * 2, reorderLevel * 10),
      last_restock_date: randomDate(new Date('2024-01-01'), new Date()).toISOString().split('T')[0],
      expiry_date: category === 'Electronics' ? null : randomDate(new Date(), new Date('2025-12-31')).toISOString().split('T')[0],
      weight_kg: randomFloat(0.1, 50),
      dimensions_cm: `${randomInt(5, 100)}x${randomInt(5, 100)}x${randomInt(5, 100)}`,
      is_active: Math.random() > 0.05,
      needs_reorder: stock < reorderLevel,
      total_value: parseFloat((stock * unitCost).toFixed(2)),
    });
  }
  
  return data;
};

// Web Analytics Dataset Generator
const generateWebAnalyticsData = async (): Promise<any[]> => {
  const pages = ['/home', '/products', '/about', '/contact', '/blog', '/pricing', '/features', '/support'];
  const devices = ['Desktop', 'Mobile', 'Tablet'];
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'];
  const countries = ['USA', 'Canada', 'UK', 'Germany', 'France', 'Japan', 'Australia', 'Brazil'];
  const sources = ['Organic', 'Direct', 'Social', 'Email', 'Paid Search', 'Referral'];
  
  const data = [];
  const startDate = new Date('2024-01-01');
  const endDate = new Date();
  
  for (let i = 0; i < 10000; i++) {
    const sessionDate = randomDate(startDate, endDate);
    const sessionDuration = randomInt(30, 1800); // 30 seconds to 30 minutes
    
    data.push({
      session_id: `session_${i + 1}`,
      user_id: `user_${randomInt(1, 5000)}`,
      date: sessionDate.toISOString().split('T')[0],
      time: sessionDate.toTimeString().split(' ')[0],
      page: randomFromArray(pages),
      device_type: randomFromArray(devices),
      browser: randomFromArray(browsers),
      country: randomFromArray(countries),
      traffic_source: randomFromArray(sources),
      page_views: randomInt(1, 15),
      session_duration_seconds: sessionDuration,
      bounce_rate: sessionDuration < 60 ? 1 : 0,
      conversion: Math.random() > 0.95 ? 1 : 0,
      revenue: Math.random() > 0.95 ? randomFloat(10, 500) : 0,
      is_new_visitor: Math.random() > 0.7,
      utm_campaign: Math.random() > 0.5 ? `campaign_${randomInt(1, 10)}` : null,
      exit_page: Math.random() > 0.3 ? randomFromArray(pages) : null,
    });
  }
  
  return data;
};

// IoT Sensor Dataset Generator
const generateIoTSensorData = async (): Promise<any[]> => {
  const sensorTypes = ['Temperature', 'Humidity', 'Pressure', 'Light', 'Motion', 'Air Quality'];
  const locations = ['Building A Floor 1', 'Building A Floor 2', 'Building B Floor 1', 'Warehouse', 'Outdoor North', 'Outdoor South'];
  
  const data = [];
  const startDate = new Date('2024-01-01');
  const now = new Date();
  
  // Generate 24 hours worth of data for multiple sensors
  for (let sensorId = 1; sensorId <= 50; sensorId++) {
    const sensorType = randomFromArray(sensorTypes);
    const location = randomFromArray(locations);
    
    let currentTime = new Date(startDate);
    
    while (currentTime < now) {
      let value: number;
      let unit: string;
      
      switch (sensorType) {
        case 'Temperature':
          value = randomFloat(18, 28);
          unit = '°C';
          break;
        case 'Humidity':
          value = randomFloat(30, 70);
          unit = '%';
          break;
        case 'Pressure':
          value = randomFloat(1000, 1030);
          unit = 'hPa';
          break;
        case 'Light':
          value = randomFloat(0, 1000);
          unit = 'lux';
          break;
        case 'Motion':
          value = Math.random() > 0.8 ? 1 : 0;
          unit = 'detected';
          break;
        case 'Air Quality':
          value = randomFloat(20, 150);
          unit = 'AQI';
          break;
        default:
          value = randomFloat(0, 100);
          unit = 'units';
      }
      
      data.push({
        sensor_id: `sensor_${String(sensorId).padStart(3, '0')}`,
        sensor_type: sensorType,
        location,
        timestamp: currentTime.toISOString(),
        value,
        unit,
        battery_level: randomFloat(20, 100),
        signal_strength: randomInt(-90, -30),
        is_online: Math.random() > 0.02,
        last_calibrated: randomDate(new Date('2024-01-01'), currentTime).toISOString().split('T')[0],
        alert_threshold_min: value * 0.8,
        alert_threshold_max: value * 1.2,
        is_alert: false,
      });
      
      // Move to next reading (every 15 minutes)
      currentTime.setMinutes(currentTime.getMinutes() + 15);
    }
  }
  
  return data.slice(0, 8000); // Limit to 8k records
};

// Sample dataset configurations
export const SAMPLE_DATASETS: SampleDataSet[] = [
  {
    id: 'sales_data',
    name: 'E-commerce Sales',
    description: 'Comprehensive sales data with products, regions, and performance metrics',
    category: 'business',
    size: '5K rows',
    columns: 11,
    rows: 5000,
    tags: ['sales', 'ecommerce', 'revenue', 'regional'],
    previewData: [], // Will be populated on demand
    generator: generateSalesData
  },
  {
    id: 'financial_data',
    name: 'Corporate Financials',
    description: 'Quarterly financial statements for major technology companies',
    category: 'financial',
    size: '240 rows',
    columns: 12,
    rows: 240,
    tags: ['finance', 'quarterly', 'public companies', 'metrics'],
    previewData: [],
    generator: generateFinancialData
  },
  {
    id: 'employee_data',
    name: 'Employee Directory',
    description: 'Human resources data with salaries, departments, and performance',
    category: 'business',
    size: '2.5K rows',
    columns: 15,
    rows: 2500,
    tags: ['hr', 'salary', 'performance', 'demographics'],
    previewData: [],
    generator: generateEmployeeData
  },
  {
    id: 'inventory_data',
    name: 'Inventory Management',
    description: 'Product inventory with suppliers, warehouses, and stock levels',
    category: 'business',
    size: '3K rows',
    columns: 14,
    rows: 3000,
    tags: ['inventory', 'warehouse', 'suppliers', 'stock'],
    previewData: [],
    generator: generateInventoryData
  },
  {
    id: 'web_analytics',
    name: 'Website Analytics',
    description: 'Web traffic data with user sessions, page views, and conversions',
    category: 'demo',
    size: '10K rows',
    columns: 16,
    rows: 10000,
    tags: ['web', 'analytics', 'traffic', 'conversion'],
    previewData: [],
    generator: generateWebAnalyticsData
  },
  {
    id: 'iot_sensors',
    name: 'IoT Sensor Data',
    description: 'Time-series data from various IoT sensors across multiple locations',
    category: 'scientific',
    size: '8K rows',
    columns: 12,
    rows: 8000,
    tags: ['iot', 'sensors', 'time-series', 'monitoring'],
    previewData: [],
    generator: generateIoTSensorData
  }
];

// Generate preview data for sample datasets
export const initializeSampleDataPreviews = async (): Promise<void> => {
  for (const dataset of SAMPLE_DATASETS) {
    if (dataset.previewData.length === 0) {
      try {
        const fullData = await dataset.generator();
        dataset.previewData = fullData.slice(0, 5); // First 5 rows for preview
      } catch (error) {
        console.warn(`Failed to generate preview for ${dataset.name}:`, error);
      }
    }
  }
};