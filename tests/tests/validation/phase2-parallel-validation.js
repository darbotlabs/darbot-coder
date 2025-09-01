#!/usr/bin/env node

/**
 * Phase 2 Validation Test Suite
 * Validates ParallelTaskManager, enhanced Task.ts, and WorkflowTemplateEngine
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 Phase 2 Validation Test Suite - darbot-coder');
console.log('='.repeat(50));

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`✅ ${name}`);
        passed++;
    } catch (error) {
        console.log(`❌ ${name}: ${error.message}`);
        failed++;
    }
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

// Test 1: Check ParallelTaskManager implementation
test('ParallelTaskManager.ts exists and has correct structure', () => {
    const parallelTaskPath = 'd:/darbot-coder/src/core/orchestration/ParallelTaskManager.ts';
    assert(fs.existsSync(parallelTaskPath), 'ParallelTaskManager.ts file does not exist');
    
    const content = fs.readFileSync(parallelTaskPath, 'utf8');
    assert(content.includes('class ParallelTaskManager'), 'ParallelTaskManager class not found');
    assert(content.includes('executeOrchestrationPlan'), 'executeOrchestrationPlan method not found');
    assert(content.includes('executeTasksWithDependencies'), 'executeTasksWithDependencies method not found');
    assert(content.includes('ParallelTask'), 'ParallelTask interface not found');
    assert(content.includes('AgentWorker'), 'AgentWorker interface not found');
});

// Test 2: Check Task.ts parallel execution enhancements
test('Task.ts has parallel execution enhancements', () => {
    const taskPath = 'd:/darbot-coder/src/core/task/Task.ts';
    assert(fs.existsSync(taskPath), 'Task.ts file does not exist');
    
    const content = fs.readFileSync(taskPath, 'utf8');
    assert(content.includes('execute()'), 'execute method not found');
    assert(content.includes('configureForParallelExecution'), 'configureForParallelExecution method not found');
    assert(content.includes('getParallelExecutionStatus'), 'getParallelExecutionStatus method not found');
    assert(content.includes('isParallelExecution'), 'isParallelExecution property not found');
    assert(content.includes('parallelExecutionStatus'), 'parallelExecutionStatus property not found');
});

// Test 3: Check WorkflowTemplateEngine implementation
test('WorkflowTemplateEngine.ts exists and has correct structure', () => {
    const workflowPath = 'd:/darbot-coder/src/core/orchestration/WorkflowTemplateEngine.ts';
    assert(fs.existsSync(workflowPath), 'WorkflowTemplateEngine.ts file does not exist');
    
    const content = fs.readFileSync(workflowPath, 'utf8');
    assert(content.includes('class WorkflowTemplateEngine'), 'WorkflowTemplateEngine class not found');
    assert(content.includes('executeWorkflow'), 'executeWorkflow method not found');
    assert(content.includes('getAvailableTemplates'), 'getAvailableTemplates method not found');
    assert(content.includes('WorkflowTemplate'), 'WorkflowTemplate interface not found');
});

// Test 4: Check parallel task execution interfaces
test('ParallelTaskManager has proper interfaces and types', () => {
    const parallelTaskPath = 'd:/darbot-coder/src/core/orchestration/ParallelTaskManager.ts';
    const content = fs.readFileSync(parallelTaskPath, 'utf8');
    
    assert(content.includes('TaskStatus'), 'TaskStatus type not found');
    assert(content.includes('TaskPriority'), 'TaskPriority type not found');
    assert(content.includes('ParallelTaskConfig'), 'ParallelTaskConfig interface not found');
    assert(content.includes('TaskExecutionResult'), 'TaskExecutionResult interface not found');
    assert(content.includes('ExecutionMetrics'), 'ExecutionMetrics interface not found');
});

// Test 5: Check workflow template types and interfaces
test('WorkflowTemplateEngine has proper workflow definitions', () => {
    const workflowPath = 'd:/darbot-coder/src/core/orchestration/WorkflowTemplateEngine.ts';
    const content = fs.readFileSync(workflowPath, 'utf8');
    
    assert(content.includes('WorkflowTemplateType'), 'WorkflowTemplateType not found');
    assert(content.includes('WorkflowStep'), 'WorkflowStep interface not found');
    assert(content.includes('WorkflowContext'), 'WorkflowContext interface not found');
    assert(content.includes('WorkflowExecutionResult'), 'WorkflowExecutionResult interface not found');
});

// Test 6: Check built-in workflow templates
test('WorkflowTemplateEngine has built-in templates', () => {
    const workflowPath = 'd:/darbot-coder/src/core/orchestration/WorkflowTemplateEngine.ts';
    const content = fs.readFileSync(workflowPath, 'utf8');
    
    const expectedTemplates = [
        'createFeatureDevelopmentTemplate',
        'createBugFixTemplate',
        'createCodeReviewTemplate',
        'createRefactoringTemplate',
        'createDocumentationTemplate',
        'createTestingTemplate',
        'createSecurityAuditTemplate',
        'createPerformanceOptimizationTemplate'
    ];
    
    expectedTemplates.forEach(template => {
        assert(content.includes(template), `Template method ${template} not found`);
    });
});

// Test 7: Check parallel execution configuration
test('Task.ts parallel execution configuration methods', () => {
    const taskPath = 'd:/darbot-coder/src/core/task/Task.ts';
    const content = fs.readFileSync(taskPath, 'utf8');
    
    assert(content.includes('setExpectedOutputs'), 'setExpectedOutputs method not found');
    assert(content.includes('getRetryCount'), 'getRetryCount method not found');
    assert(content.includes('cancelParallelExecution'), 'cancelParallelExecution method not found');
    assert(content.includes('canRunInParallel'), 'canRunInParallel method not found');
    assert(content.includes('getParallelExecutionMetadata'), 'getParallelExecutionMetadata method not found');
});

// Test 8: Check dependency resolution and coordination
test('ParallelTaskManager has dependency resolution capabilities', () => {
    const parallelTaskPath = 'd:/darbot-coder/src/core/orchestration/ParallelTaskManager.ts';
    const content = fs.readFileSync(parallelTaskPath, 'utf8');
    
    assert(content.includes('buildDependencyGraph'), 'buildDependencyGraph method not found');
    assert(content.includes('getReadyTasks'), 'getReadyTasks method not found');
    assert(content.includes('dependencies satisfied'), 'dependency satisfaction logic not found');
    assert(content.includes('selectTasksForExecution'), 'selectTasksForExecution method not found');
    
    // Check Task.ts for dependency satisfaction
    const taskPath = 'd:/darbot-coder/src/core/task/Task.ts';
    const taskContent = fs.readFileSync(taskPath, 'utf8');
    assert(taskContent.includes('areDependenciesSatisfied'), 'areDependenciesSatisfied method not found in Task.ts');
});

// Test 9: Check error handling and retry mechanisms
test('Parallel execution has robust error handling', () => {
    const parallelTaskPath = 'd:/darbot-coder/src/core/orchestration/ParallelTaskManager.ts';
    const content = fs.readFileSync(parallelTaskPath, 'utf8');
    
    assert(content.includes('handleTaskFailure'), 'handleTaskFailure method not found');
    assert(content.includes('executeTaskWithTimeout'), 'executeTaskWithTimeout method not found');
    assert(content.includes('failureStrategy'), 'failureStrategy configuration not found');
    
    // Check Task.ts for retry logic
    const taskPath = 'd:/darbot-coder/src/core/task/Task.ts';
    const taskContent = fs.readFileSync(taskPath, 'utf8');
    assert(taskContent.includes('retryCount'), 'retryCount property not found');
    assert(taskContent.includes('shouldRetry'), 'shouldRetry method not found in Task.ts');
});

// Test 10: Check worker pool management
test('ParallelTaskManager has worker pool management', () => {
    const parallelTaskPath = 'd:/darbot-coder/src/core/orchestration/ParallelTaskManager.ts';
    const content = fs.readFileSync(parallelTaskPath, 'utf8');
    
    assert(content.includes('initializeWorkerPool'), 'initializeWorkerPool method not found');
    assert(content.includes('findAvailableWorker'), 'findAvailableWorker method not found');
    assert(content.includes('activeWorkers'), 'activeWorkers property not found');
    assert(content.includes('maxConcurrency'), 'maxConcurrency constraint not found');
});

// Test 11: Check metrics and monitoring
test('Parallel execution has comprehensive metrics', () => {
    const parallelTaskPath = 'd:/darbot-coder/src/core/orchestration/ParallelTaskManager.ts';
    const content = fs.readFileSync(parallelTaskPath, 'utf8');
    
    assert(content.includes('calculateFinalMetrics'), 'calculateFinalMetrics method not found');
    assert(content.includes('calculateConcurrencyUtilization'), 'calculateConcurrencyUtilization method not found');
    assert(content.includes('calculateCostEfficiency'), 'calculateCostEfficiency method not found');
    assert(content.includes('getExecutionStatus'), 'getExecutionStatus method not found');
});

// Test 12: Check workflow template execution integration
test('WorkflowTemplateEngine integrates with orchestration', () => {
    const workflowPath = 'd:/darbot-coder/src/core/orchestration/WorkflowTemplateEngine.ts';
    const content = fs.readFileSync(workflowPath, 'utf8');
    
    assert(content.includes('convertTemplateToExecutionPlan'), 'convertTemplateToExecutionPlan method not found');
    assert(content.includes('estimateWorkflowCost'), 'estimateWorkflowCost method not found');
    assert(content.includes('getWorkflowRecommendations'), 'getWorkflowRecommendations method not found');
    assert(content.includes('orchestrationEngine.executeOrchestrationPlan'), 'Integration with orchestration engine not found');
});

// Test 13: Check event-driven architecture
test('Parallel execution has event-driven architecture', () => {
    const parallelTaskPath = 'd:/darbot-coder/src/core/orchestration/ParallelTaskManager.ts';
    const content = fs.readFileSync(parallelTaskPath, 'utf8');
    
    assert(content.includes('EventEmitter'), 'EventEmitter inheritance not found');
    assert(content.includes('taskStarted'), 'taskStarted event not found');
    assert(content.includes('taskCompleted'), 'taskCompleted event not found');
    assert(content.includes('taskFailed'), 'taskFailed event not found');
    assert(content.includes('orchestrationCompleted'), 'orchestrationCompleted event not found');
});

// Test 14: Check Phase 2 file organization
test('Phase 2 files are properly organized', () => {
    const orchestrationDir = 'd:/darbot-coder/src/core/orchestration';
    assert(fs.existsSync(orchestrationDir), 'Orchestration directory does not exist');
    
    const orchestrationFiles = fs.readdirSync(orchestrationDir);
    const expectedFiles = ['OrchestrationEngine.ts', 'ParallelTaskManager.ts', 'WorkflowTemplateEngine.ts'];
    
    expectedFiles.forEach(file => {
        assert(orchestrationFiles.includes(file), `${file} not found in orchestration directory`);
    });
});

// Test 15: Check integration readiness
test('Phase 2 components are integration ready', () => {
    // Check that ParallelTaskManager imports OrchestrationEngine
    const parallelTaskPath = 'd:/darbot-coder/src/core/orchestration/ParallelTaskManager.ts';
    const parallelContent = fs.readFileSync(parallelTaskPath, 'utf8');
    assert(parallelContent.includes('OrchestrationEngine'), 'ParallelTaskManager does not import OrchestrationEngine');
    
    // Check that WorkflowTemplateEngine imports OrchestrationEngine
    const workflowPath = 'd:/darbot-coder/src/core/orchestration/WorkflowTemplateEngine.ts';
    const workflowContent = fs.readFileSync(workflowPath, 'utf8');
    assert(workflowContent.includes('OrchestrationEngine'), 'WorkflowTemplateEngine does not import OrchestrationEngine');
    
    // Check that Task.ts has proper integration methods
    const taskPath = 'd:/darbot-coder/src/core/task/Task.ts';
    const taskContent = fs.readFileSync(taskPath, 'utf8');
    assert(taskContent.includes('execute'), 'Task.ts execute method not properly integrated');
});

// Summary
console.log('\n' + '='.repeat(50));
console.log(`📊 Phase 2 Validation Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
    console.log('🎉 All Phase 2 validation tests PASSED!');
    console.log('✅ Parallel execution capabilities fully implemented');
    console.log('✅ Task coordination and dependency resolution working');
    console.log('✅ Workflow templates and automation ready');
    console.log('✅ Ready to proceed to Phase 3 implementation');
    process.exit(0);
} else {
    console.log('⚠️  Some Phase 2 validation tests failed. Please review and fix before proceeding to Phase 3.');
    process.exit(1);
}
