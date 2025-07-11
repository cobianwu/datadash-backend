// Database connection - using memory storage for now
// This would be replaced with actual database connection in production

export const pool = {
  query: () => Promise.resolve({ rows: [] }),
  connect: () => Promise.resolve(),
  end: () => Promise.resolve(),
};

export default pool;
