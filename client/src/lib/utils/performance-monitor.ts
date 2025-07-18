/**
 * Performance Monitoring Utility for Bengali News App
 * Tracks API performance, error rates, and user experience metrics
 */

interface PerformanceMetric {
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  error?: string;
  metadata?: any;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000; // Keep last 1000 metrics
  
  startOperation(operation: string, metadata?: any): string {
    const operationId = `${operation}-${Date.now()}-${Math.random()}`;
    
    this.metrics.push({
      operation: operationId,
      startTime: performance.now(),
      success: false,
      metadata
    });
    
    return operationId;
  }
  
  endOperation(operationId: string, success: boolean = true, error?: string): void {
    const metric = this.metrics.find(m => m.operation === operationId);
    
    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
      metric.success = success;
      metric.error = error;
      
      // Log slow operations (> 2 seconds)
      if (metric.duration > 2000) {
        console.warn(`[Performance] Slow operation: ${operationId} took ${metric.duration.toFixed(2)}ms`);
      }
      
      // Log errors
      if (!success && error) {
        console.error(`[Performance] Operation failed: ${operationId} - ${error}`);
      }
    }
    
    // Cleanup old metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }
  
  getMetrics(operation?: string): PerformanceMetric[] {
    const completedMetrics = this.metrics.filter(m => m.endTime !== undefined);
    
    if (operation) {
      return completedMetrics.filter(m => m.operation.includes(operation));
    }
    
    return completedMetrics;
  }
  
  getAverageTime(operation: string): number {
    const operationMetrics = this.getMetrics(operation).filter(m => m.success);
    
    if (operationMetrics.length === 0) return 0;
    
    const totalTime = operationMetrics.reduce((sum, metric) => sum + (metric.duration || 0), 0);
    return totalTime / operationMetrics.length;
  }
  
  getErrorRate(operation: string): number {
    const operationMetrics = this.getMetrics(operation);
    
    if (operationMetrics.length === 0) return 0;
    
    const errorCount = operationMetrics.filter(m => !m.success).length;
    return (errorCount / operationMetrics.length) * 100;
  }
  
  getPerformanceReport(): {
    totalOperations: number;
    averageResponseTime: number;
    errorRate: number;
    slowOperations: PerformanceMetric[];
    operationStats: { [key: string]: { avg: number; errors: number; count: number } };
  } {
    const completed = this.getMetrics();
    const slowOperations = completed.filter(m => (m.duration || 0) > 2000);
    
    // Group by operation type
    const operationStats: { [key: string]: { avg: number; errors: number; count: number } } = {};
    
    completed.forEach(metric => {
      const operationType = metric.operation.split('-')[0];
      
      if (!operationStats[operationType]) {
        operationStats[operationType] = { avg: 0, errors: 0, count: 0 };
      }
      
      operationStats[operationType].count++;
      operationStats[operationType].avg = 
        (operationStats[operationType].avg * (operationStats[operationType].count - 1) + (metric.duration || 0)) / 
        operationStats[operationType].count;
      
      if (!metric.success) {
        operationStats[operationType].errors++;
      }
    });
    
    const totalTime = completed.reduce((sum, metric) => sum + (metric.duration || 0), 0);
    const errorCount = completed.filter(m => !m.success).length;
    
    return {
      totalOperations: completed.length,
      averageResponseTime: completed.length > 0 ? totalTime / completed.length : 0,
      errorRate: completed.length > 0 ? (errorCount / completed.length) * 100 : 0,
      slowOperations,
      operationStats
    };
  }
  
  logReport(): void {
    const report = this.getPerformanceReport();
    
    console.group('📊 Performance Report');
    console.log(`Total Operations: ${report.totalOperations}`);
    console.log(`Average Response Time: ${report.averageResponseTime.toFixed(2)}ms`);
    console.log(`Error Rate: ${report.errorRate.toFixed(2)}%`);
    
    if (report.slowOperations.length > 0) {
      console.warn(`Slow Operations (${report.slowOperations.length}):`);
      report.slowOperations.forEach(op => {
        console.warn(`  - ${op.operation}: ${op.duration?.toFixed(2)}ms`);
      });
    }
    
    console.log('Operation Statistics:');
    Object.entries(report.operationStats).forEach(([type, stats]) => {
      console.log(`  ${type}: ${stats.avg.toFixed(2)}ms avg, ${stats.errors} errors, ${stats.count} total`);
    });
    
    console.groupEnd();
  }
  
  clear(): void {
    this.metrics = [];
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Helper function for measuring API calls
export function measureApiCall<T>(
  operation: string, 
  apiCall: () => Promise<T>,
  metadata?: any
): Promise<T> {
  const operationId = performanceMonitor.startOperation(operation, metadata);
  
  return apiCall()
    .then(result => {
      performanceMonitor.endOperation(operationId, true);
      return result;
    })
    .catch(error => {
      performanceMonitor.endOperation(operationId, false, error.message);
      throw error;
    });
}

// Auto-log performance report every 5 minutes
setInterval(() => {
  performanceMonitor.logReport();
}, 5 * 60 * 1000);

export default performanceMonitor;