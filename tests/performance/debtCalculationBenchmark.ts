/**
 * Performance Benchmarking Suite for Debt Calculation Optimizations
 *
 * Tests the performance improvements from O(n³) to O(n²) complexity
 * and validates caching, async processing, and other optimizations.
 *
 * TEST SCENARIOS:
 * - Small groups (5-10 members, 10-50 transactions)
 * - Medium groups (10-15 members, 50-200 transactions)
 * - Large groups (15-25 members, 200-1000 transactions)
 * - Very large groups (25+ members, 1000+ transactions)
 *
 * PERFORMANCE TARGETS:
 * - 70-90% improvement for large groups
 * - Sub-100ms for typical groups (5-15 members)
 * - Progressive enhancement for very large groups
 */

import {Transaction, GroupMember} from '../../src/types';
import {calculateGroupBalance} from '../../src/utils/groupBalanceUtils';
import {calculateGroupBalanceOptimized as calculateGroupBalanceOptimizedNew} from '../../src/utils/groupBalanceUtils.optimized';
import {PerformanceUtils} from '../../src/utils/groupBalanceUtils.optimized';
import {debtCalculationWorkerService} from '../../src/services/debtCalculationWorkerService';

interface BenchmarkResult {
  algorithm: string;
  memberCount: number;
  transactionCount: number;
  executionTime: number;
  memoryUsage: number;
  complexityScore: number;
  cacheHitRate: number;
  isCached: boolean;
  success: boolean;
  error?: string;
}

interface BenchmarkReport {
  testName: string;
  timestamp: Date;
  results: BenchmarkResult[];
  summary: {
    totalTests: number;
    successfulTests: number;
    failedTests: number;
    averageImprovement: number;
    maxImprovement: number;
    minImprovement: number;
  };
  recommendations: string[];
}

class DebtCalculationBenchmark {
  private results: BenchmarkResult[] = [];

  /**
   * Generate test data for benchmarking
   */
  private generateTestData(
    memberCount: number,
    transactionCount: number,
  ): {
    transactions: Transaction[];
    members: GroupMember[];
  } {
    const members: GroupMember[] = [];

    // Generate members
    for (let i = 0; i < memberCount; i++) {
      members.push({
        id: `member_${i}`,
        name: `Member ${i}`,
        balance: 0,
        totalPaid: 0,
        totalOwed: 0,
        joinedAt: new Date(),
        isActive: true,
        role: 'member',
      });
    }

    const transactions: Transaction[] = [];

    // Generate transactions with realistic patterns
    for (let i = 0; i < transactionCount; i++) {
      const paidByIndex = Math.floor(Math.random() * memberCount);
      const paidBy = members[paidByIndex].id;

      const amount = Math.round((Math.random() * 500 + 10) * 100) / 100; // $10-$510

      // Generate split details with various patterns
      const splitMembers: string[] = [];
      const splitAmounts: Record<string, number> = {};

      if (Math.random() < 0.3) {
        // Custom split
        const splitCount = Math.floor(Math.random() * memberCount) + 1;
        for (let j = 0; j < splitCount; j++) {
          const memberIndex = Math.floor(Math.random() * memberCount);
          if (!splitMembers.includes(members[memberIndex].id)) {
            splitMembers.push(members[memberIndex].id);
          }
        }

        // Distribute amount randomly among selected members
        const totalSplit = splitMembers.length;
        for (const memberId of splitMembers) {
          splitAmounts[memberId] = Math.round((amount / totalSplit) * 100) / 100;
        }
      } else {
        // Equal split among all or some members
        const splitCount =
          Math.random() < 0.5 ? memberCount : Math.floor(Math.random() * memberCount) + 1;
        const selectedMembers = members.slice(0, splitCount);
        const amountPerMember = Math.round((amount / splitCount) * 100) / 100;

        for (const member of selectedMembers) {
          splitAmounts[member.id] = amountPerMember;
        }
      }

      transactions.push({
        id: `transaction_${i}`,
        amount,
        category: 'Food',
        description: `Test Transaction ${i}`,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
        type: 'expense' as const,
        paidBy,
        splitMethod: 'equal',
        splitAmounts,
        isSettlement: false,
        settledDebts: [],
      });
    }

    return {transactions, members};
  }

  /**
   * Run benchmark for specific scenario
   */
  private async runBenchmark(
    algorithm: string,
    memberCount: number,
    transactionCount: number,
    iterations: number = 3,
  ): Promise<BenchmarkResult[]> {
    const testResults: BenchmarkResult[] = [];

    for (let i = 0; i < iterations; i++) {
      const {transactions, members} = this.generateTestData(memberCount, transactionCount);

      const startMemory = this.getMemoryUsage();
      const startTime = performance.now();

      try {
        let result: any;

        switch (algorithm) {
          case 'original':
            result = calculateGroupBalance(transactions, members);
            break;
          case 'optimized':
            result = await calculateGroupBalanceOptimizedNew(transactions, members);
            break;
          case 'worker':
            await debtCalculationWorkerService.initialize();
            result = await debtCalculationWorkerService.calculateGroupBalance(
              transactions,
              members,
            );
            break;
          default:
            throw new Error(`Unknown algorithm: ${algorithm}`);
        }

        const endTime = performance.now();
        const executionTime = endTime - startTime;
        const memoryUsage = this.getMemoryUsage() - startMemory;
        const complexityScore = transactionCount * memberCount + memberCount * memberCount;

        testResults.push({
          algorithm,
          memberCount,
          transactionCount,
          executionTime,
          memoryUsage,
          complexityScore,
          cacheHitRate: result.performanceMetrics?.cacheHitRate || 0,
          isCached: result.isCached || false,
          success: true,
        });
      } catch (error) {
        testResults.push({
          algorithm,
          memberCount,
          transactionCount,
          executionTime: 0,
          memoryUsage: 0,
          complexityScore: 0,
          cacheHitRate: 0,
          isCached: false,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return testResults;
  }

  /**
   * Get current memory usage (approximate)
   */
  private getMemoryUsage(): number {
    // @ts-ignore - performance.memory is not in all TypeScript environments
    if (performance.memory && performance.memory.usedJSHeapSize) {
      // @ts-ignore
      return performance.memory.usedJSHeapSize;
    }
    return 0;
  }

  /**
   * Run comprehensive benchmark suite
   */
  async runComprehensiveBenchmark(): Promise<BenchmarkReport> {
    console.log('🚀 Starting Comprehensive Debt Calculation Benchmark');

    // Clear any existing cache
    PerformanceUtils.clearCache();

    const testScenarios = [
      // Small groups
      {name: 'Small Group 1', members: 5, transactions: 10},
      {name: 'Small Group 2', members: 8, transactions: 25},
      {name: 'Small Group 3', members: 10, transactions: 50},

      // Medium groups
      {name: 'Medium Group 1', members: 12, transactions: 75},
      {name: 'Medium Group 2', members: 15, transactions: 100},
      {name: 'Medium Group 3', members: 15, transactions: 150},

      // Large groups
      {name: 'Large Group 1', members: 18, transactions: 200},
      {name: 'Large Group 2', members: 20, transactions: 300},
      {name: 'Large Group 3', members: 25, transactions: 500},

      // Very large groups
      {name: 'Very Large Group 1', members: 30, transactions: 750},
      {name: 'Very Large Group 2', members: 35, transactions: 1000},
    ];

    const algorithms = ['original', 'optimized', 'worker'];
    const results: BenchmarkResult[] = [];

    for (const scenario of testScenarios) {
      console.log(
        `📊 Testing ${scenario.name} (${scenario.members} members, ${scenario.transactions} transactions)`,
      );

      for (const algorithm of algorithms) {
        try {
          const scenarioResults = await this.runBenchmark(
            algorithm,
            scenario.members,
            scenario.transactions,
            3, // 3 iterations per scenario
          );
          results.push(...scenarioResults);

          // Clear cache between different algorithms
          if (algorithm !== 'original') {
            PerformanceUtils.clearCache();
          }
        } catch (error) {
          console.error(`❌ Error testing ${algorithm} on ${scenario.name}:`, error);
        }
      }
    }

    // Generate report
    const report = this.generateReport(results);
    this.logReport(report);

    return report;
  }

  /**
   * Generate benchmark report
   */
  private generateReport(results: BenchmarkResult[]): BenchmarkReport {
    const successfulResults = results.filter((r) => r.success);
    const failedResults = results.filter((r) => !r.success);

    // Calculate improvement statistics
    const improvements = this.calculateImprovements(results);
    const averageImprovement =
      improvements.length > 0
        ? improvements.reduce((sum, imp) => sum + imp, 0) / improvements.length
        : 0;

    const maxImprovement = improvements.length > 0 ? Math.max(...improvements) : 0;
    const minImprovement = improvements.length > 0 ? Math.min(...improvements) : 0;

    // Generate recommendations
    const recommendations = this.generateRecommendations(successfulResults, {
      averageImprovement,
      maxImprovement,
      minImprovement,
    });

    return {
      testName: 'Debt Calculation Performance Benchmark',
      timestamp: new Date(),
      results,
      summary: {
        totalTests: results.length,
        successfulTests: successfulResults.length,
        failedTests: failedResults.length,
        averageImprovement,
        maxImprovement,
        minImprovement,
      },
      recommendations,
    };
  }

  /**
   * Calculate performance improvements
   */
  private calculateImprovements(results: BenchmarkResult[]): number[] {
    const improvements: number[] = [];
    const originalResults = results.filter((r) => r.algorithm === 'original' && r.success);

    for (const originalResult of originalResults) {
      const optimizedResult = results.find(
        (r) =>
          r.algorithm === 'optimized' &&
          r.success &&
          r.memberCount === originalResult.memberCount &&
          r.transactionCount === originalResult.transactionCount,
      );

      if (optimizedResult) {
        const improvement =
          ((originalResult.executionTime - optimizedResult.executionTime) /
            originalResult.executionTime) *
          100;
        if (improvement > 0) {
          improvements.push(improvement);
        }
      }

      const workerResult = results.find(
        (r) =>
          r.algorithm === 'worker' &&
          r.success &&
          r.memberCount === originalResult.memberCount &&
          r.transactionCount === originalResult.transactionCount,
      );

      if (workerResult) {
        const improvement =
          ((originalResult.executionTime - workerResult.executionTime) /
            originalResult.executionTime) *
          100;
        if (improvement > 0) {
          improvements.push(improvement);
        }
      }
    }

    return improvements;
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(
    results: BenchmarkResult[],
    stats: {
      averageImprovement: number;
      maxImprovement: number;
      minImprovement: number;
    },
  ): string[] {
    const recommendations: string[] = [];

    if (stats.averageImprovement > 70) {
      recommendations.push(
        '✅ Excellent performance improvements achieved! The optimizations are working well.',
      );
    } else if (stats.averageImprovement > 50) {
      recommendations.push(
        '✅ Good performance improvements. Consider fine-tuning for edge cases.',
      );
    } else if (stats.averageImprovement > 30) {
      recommendations.push('⚠️ Moderate improvements. Further optimization may be needed.');
    } else {
      recommendations.push(
        '❌ Low performance improvements. Review algorithm complexity and implementation.',
      );
    }

    // Analyze specific patterns
    const largeGroupResults = results.filter((r) => r.memberCount > 20);
    if (largeGroupResults.length > 0) {
      const avgLargeGroupImprovement = this.calculateImprovements(largeGroupResults);
      if (avgLargeGroupImprovement.length > 0) {
        const avg =
          avgLargeGroupImprovement.reduce((sum, imp) => sum + imp, 0) /
          avgLargeGroupImprovement.length;
        if (avg < 40) {
          recommendations.push(
            '💡 Large group performance needs improvement. Consider more aggressive chunking.',
          );
        }
      }
    }

    // Check cache effectiveness
    const cachedResults = results.filter((r) => r.isCached && r.algorithm === 'optimized');
    if (cachedResults.length > 0) {
      const avgCacheHitRate =
        cachedResults.reduce((sum, r) => sum + r.cacheHitRate, 0) / cachedResults.length;
      if (avgCacheHitRate > 0) {
        recommendations.push(
          `✅ Cache is effective with ${avgCacheHitRate.toFixed(1)}% hit rate on cached results.`,
        );
      }
    }

    // Check memory usage
    const highMemoryResults = results.filter((r) => r.memoryUsage > 10 * 1024 * 1024); // > 10MB
    if (highMemoryResults.length > 0) {
      recommendations.push(
        '💡 High memory usage detected. Consider implementing memory management optimizations.',
      );
    }

    return recommendations;
  }

  /**
   * Log benchmark report
   */
  private logReport(report: BenchmarkReport): void {
    console.log('\n' + '='.repeat(80));
    console.log('📊 DEBT CALCULATION PERFORMANCE BENCHMARK REPORT');
    console.log('='.repeat(80));

    console.log(`\n🕒 Test Timestamp: ${report.timestamp.toISOString()}`);
    console.log(`📋 Test Name: ${report.testName}`);

    console.log('\n📈 SUMMARY:');
    console.log(`   Total Tests: ${report.summary.totalTests}`);
    console.log(`   Successful: ${report.summary.successfulTests}`);
    console.log(`   Failed: ${report.summary.failedTests}`);
    console.log(`   Average Improvement: ${report.summary.averageImprovement.toFixed(2)}%`);
    console.log(`   Maximum Improvement: ${report.summary.maxImprovement.toFixed(2)}%`);
    console.log(`   Minimum Improvement: ${report.summary.minImprovement.toFixed(2)}%`);

    console.log('\n🔧 DETAILED RESULTS:');

    // Group results by algorithm
    const algorithms = ['original', 'optimized', 'worker'];
    for (const algorithm of algorithms) {
      const algorithmResults = report.results.filter((r) => r.algorithm === algorithm && r.success);
      if (algorithmResults.length === 0) continue;

      console.log(`\n   ${algorithm.toUpperCase()} ALGORITHM:`);

      // Group by scenario
      const scenarios = new Map<string, BenchmarkResult[]>();
      algorithmResults.forEach((result) => {
        const key = `${result.memberCount}_${result.transactionCount}`;
        if (!scenarios.has(key)) {
          scenarios.set(key, []);
        }
        scenarios.get(key)!.push(result);
      });

      for (const [key, results] of scenarios) {
        const [members, transactions] = key.split('_').map(Number);
        const avgTime = results.reduce((sum, r) => sum + r.executionTime, 0) / results.length;
        console.log(
          `     ${members} members, ${transactions} transactions: ${avgTime.toFixed(2)}ms avg`,
        );
      }
    }

    console.log('\n💡 RECOMMENDATIONS:');
    report.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });

    console.log('\n' + '='.repeat(80));
  }

  /**
   * Run specific stress test
   */
  async runStressTest(): Promise<void> {
    console.log('🔥 Running Stress Test - Maximum Load Scenario');

    const {transactions, members} = this.generateTestData(50, 2000);

    console.log(`Testing with ${members.length} members and ${transactions.length} transactions`);

    const testScenarios = [
      {name: 'Original Algorithm', algorithm: 'original' as const},
      {name: 'Optimized Algorithm', algorithm: 'optimized' as const},
      {name: 'Worker Algorithm', algorithm: 'worker' as const},
    ];

    for (const scenario of testScenarios) {
      try {
        const startTime = performance.now();

        if (scenario.algorithm === 'original') {
          calculateGroupBalance(transactions, members);
        } else if (scenario.algorithm === 'optimized') {
          await calculateGroupBalanceOptimizedNew(transactions, members);
        } else {
          await debtCalculationWorkerService.calculateGroupBalance(transactions, members);
        }

        const executionTime = performance.now() - startTime;
        console.log(`✅ ${scenario.name}: ${executionTime.toFixed(2)}ms`);
      } catch (error) {
        console.log(
          `❌ ${scenario.name}: Failed - ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }
  }
}

// Export for use in tests
export {DebtCalculationBenchmark};

// Run benchmark if executed directly
if (require.main === module) {
  const benchmark = new DebtCalculationBenchmark();

  benchmark
    .runComprehensiveBenchmark()
    .then((report) => {
      console.log('\n🎉 Benchmark completed successfully!');
      console.log('Check the report above for detailed results and recommendations.');

      // Run stress test
      return benchmark.runStressTest();
    })
    .catch((error) => {
      console.error('❌ Benchmark failed:', error);
      process.exit(1);
    });
}
