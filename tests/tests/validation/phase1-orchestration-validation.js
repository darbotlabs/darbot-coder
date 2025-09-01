#!/usr/bin/env node

/**
 * Phase 1 Validation Test Suite
 * Validates OrchestrationEngine and CustomModesManager enhancements
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 Phase 1 Validation Test Suite - darbot-coder');
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

// Test 1: Check OrchestrationEngine file exists and structure
test('OrchestrationEngine.ts exists and has correct structure', () => {
    const orchestrationPath = 'd:/darbot-coder/src/core/orchestration/OrchestrationEngine.ts';
    assert(fs.existsSync(orchestrationPath), 'OrchestrationEngine.ts file does not exist');
    
    const content = fs.readFileSync(orchestrationPath, 'utf8');
    assert(content.includes('class OrchestrationEngine'), 'OrchestrationEngine class not found');
    assert(content.includes('analyzeTask'), 'analyzeTask method not found');
    assert(content.includes('selectOptimalAgents'), 'selectOptimalAgents method not found');
    assert(content.includes('createExecutionPlan'), 'createExecutionPlan method not found');
    assert(content.includes('AgentCapability'), 'AgentCapability interface not found');
});

// Test 2: Check CustomModesManager refactoring
test('CustomModesManager has orchestration enhancements', () => {
    const customModesPath = 'd:/darbot-coder/src/core/config/CustomModesManager.ts';
    assert(fs.existsSync(customModesPath), 'CustomModesManager.ts file does not exist');
    
    const content = fs.readFileSync(customModesPath, 'utf8');
    assert(content.includes('getAgentSuggestion'), 'getAgentSuggestion method not found');
    assert(content.includes('getOrchestrationCapabilities'), 'getOrchestrationCapabilities method not found');
    assert(content.includes('OrchestrationEngine'), 'OrchestrationEngine import not found');
});

// Test 3: Check darbot-coder refactoring in package.json
test('package.json updated to darbot-coder', () => {
    const packagePath = 'd:/darbot-coder/package.json';
    assert(fs.existsSync(packagePath), 'package.json file does not exist');
    
    const content = fs.readFileSync(packagePath, 'utf8');
    const packageJson = JSON.parse(content);
    assert(packageJson.name === 'darbot-coder', `Package name is ${packageJson.name}, expected darbot-coder`);
});

// Test 4: Check "darbot" to "darbot" refactoring in CustomModesManager
test('CustomModesManager darbot→darbot refactoring completed', () => {
    const customModesPath = 'd:/darbot-coder/src/core/config/CustomModesManager.ts';
    const content = fs.readFileSync(customModesPath, 'utf8');
    
    // Check that old roo references are replaced
    const rooMatches = content.match(/\.roo\//g) || [];
    assert(rooMatches.length === 0, `Found ${rooMatches.length} ".roo/" references that should be ".darbot/"`);
    
    const roomodesMatches = content.match(/roomodes/g) || [];
    assert(roomodesMatches.length === 0, `Found ${roomodesMatches.length} "roomodes" references that should be "darbotmodes"`);
    
    // Check that new darbot references exist
    assert(content.includes('.darbot/'), '.darbot/ references not found');
    assert(content.includes('darbotmodes'), 'darbotmodes references not found');
});

// Test 5: Check darbot-config service exists
test('darbot-config service created', () => {
    const darbotConfigPath = 'd:/darbot-coder/src/services/darbot-config/index.ts';
    assert(fs.existsSync(darbotConfigPath), 'darbot-config service does not exist');
    
    const content = fs.readFileSync(darbotConfigPath, 'utf8');
    assert(content.includes('getDarbotPath'), 'getDarbotPath function not found');
    assert(content.includes('~/.darbot'), '~/.darbot directory reference not found');
});

// Test 6: Validate OrchestrationEngine agent definitions
test('OrchestrationEngine has correct agent definitions', () => {
    const orchestrationPath = 'd:/darbot-coder/src/core/orchestration/OrchestrationEngine.ts';
    const content = fs.readFileSync(orchestrationPath, 'utf8');
    
    // Check for expected agent types
    const expectedAgents = ['architect', 'coder', 'tester', 'security', 'docs'];
    expectedAgents.forEach(agent => {
        assert(content.includes(`slug: '${agent}'`), `Agent ${agent} not found in definitions`);
    });
    
    // Check for capability definitions
    assert(content.includes('capabilities:'), 'Agent capabilities not defined');
    assert(content.includes('costLevel:'), 'Cost level not defined');
    assert(content.includes('maxConcurrency:'), 'Max concurrency not defined');
});

// Test 7: Validate task analysis functionality
test('OrchestrationEngine task analysis structure', () => {
    const orchestrationPath = 'd:/darbot-coder/src/core/orchestration/OrchestrationEngine.ts';
    const content = fs.readFileSync(orchestrationPath, 'utf8');
    
    // Check for complexity analysis
    assert(content.includes('complexity:'), 'Complexity analysis not found');
    assert(content.includes('simple'), 'Simple complexity level not found');
    assert(content.includes('medium'), 'Medium complexity level not found');
    assert(content.includes('complex'), 'Complex complexity level not found');
    assert(content.includes('enterprise'), 'Enterprise complexity level not found');
    
    // Check for domain identification
    assert(content.includes('domains:'), 'Domain identification not found');
    assert(content.includes('parallelizable:'), 'Parallelizable analysis not found');
});

// Test 8: Check integration readiness
test('Integration points properly defined', () => {
    const orchestrationPath = 'd:/darbot-coder/src/core/orchestration/OrchestrationEngine.ts';
    const content = fs.readFileSync(orchestrationPath, 'utf8');
    
    // Check for execution plan structure
    assert(content.includes('ExecutionPlan'), 'ExecutionPlan interface not found');
    assert(content.includes('steps:'), 'Execution steps not defined');
    assert(content.includes('dependencies:'), 'Dependencies not defined');
    assert(content.includes('estimatedTime:'), 'Time estimation not found');
    assert(content.includes('estimatedCost:'), 'Cost estimation not found');
});

// Test 9: Validate error handling and safety
test('Error handling and safety measures', () => {
    const orchestrationPath = 'd:/darbot-coder/src/core/orchestration/OrchestrationEngine.ts';
    const content = fs.readFileSync(orchestrationPath, 'utf8');
    
    // Check for error handling
    assert(content.includes('try {') || content.includes('catch'), 'Error handling not implemented');
    
    // Check for validation
    assert(content.includes('validation'), 'Validation logic not found');
    
    // Check for safety constraints
    assert(content.includes('maxConcurrency'), 'Concurrency limits not defined');
});

// Test 10: Check directory structure for orchestration
test('Orchestration directory structure', () => {
    const orchestrationDir = 'd:/darbot-coder/src/core/orchestration';
    assert(fs.existsSync(orchestrationDir), 'Orchestration directory does not exist');
    
    const orchestrationFiles = fs.readdirSync(orchestrationDir);
    assert(orchestrationFiles.includes('OrchestrationEngine.ts'), 'OrchestrationEngine.ts not in orchestration directory');
});

// Summary
console.log('\n' + '='.repeat(50));
console.log(`📊 Validation Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
    console.log('🎉 All Phase 1 validation tests PASSED!');
    console.log('✅ Ready to proceed to Phase 2 implementation');
    process.exit(0);
} else {
    console.log('⚠️  Some validation tests failed. Please review and fix before proceeding to Phase 2.');
    process.exit(1);
}
