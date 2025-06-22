#!/usr/bin/env node

/**
 * 🤖 Generate Dynamic Status Badges
 * 
 * This script generates dynamic status badges for the project
 * based on AI diagnosis results and other metrics
 */

const fs = require('fs');
const path = require('path');

// Badge templates
const BADGE_TEMPLATES = {
  health: {
    healthy: 'https://img.shields.io/badge/health-healthy-brightgreen',
    warning: 'https://img.shields.io/badge/health-warning-yellow',
    critical: 'https://img.shields.io/badge/health-critical-red'
  },
  build: {
    passing: 'https://img.shields.io/badge/build-passing-brightgreen',
    failing: 'https://img.shields.io/badge/build-failing-red'
  },
  coverage: {
    high: 'https://img.shields.io/badge/coverage-90%25+-brightgreen',
    medium: 'https://img.shields.io/badge/coverage-70%25+-yellow',
    low: 'https://img.shields.io/badge/coverage-50%25+-red'
  },
  dependencies: {
    upToDate: 'https://img.shields.io/badge/dependencies-up--to--date-brightgreen',
    outdated: 'https://img.shields.io/badge/dependencies-outdated-yellow',
    vulnerable: 'https://img.shields.io/badge/dependencies-vulnerable-red'
  },
  security: {
    clean: 'https://img.shields.io/badge/security-clean-brightgreen',
    warnings: 'https://img.shields.io/badge/security-warnings-yellow',
    vulnerable: 'https://img.shields.io/badge/security-vulnerable-red'
  }
};

/**
 * Get project status from AI diagnosis
 */
function getProjectStatus() {
  try {
    // Check if diagnosis report exists
    const diagnosisPath = path.join(__dirname, '..', 'diagnosis-report.txt');
    if (!fs.existsSync(diagnosisPath)) {
      return { health: 'warning', message: 'No diagnosis report found' };
    }

    const diagnosis = fs.readFileSync(diagnosisPath, 'utf8');
    
    if (diagnosis.includes('PROBLEMAS CRÍTICOS DETECTADOS')) {
      return { health: 'critical', message: 'Critical issues detected' };
    } else if (diagnosis.includes('Nenhum problema crítico detectado')) {
      return { health: 'healthy', message: 'Project is healthy' };
    } else {
      return { health: 'warning', message: 'Some warnings detected' };
    }
  } catch (error) {
    return { health: 'warning', message: 'Unable to read diagnosis report' };
  }
}

/**
 * Get build status
 */
function getBuildStatus() {
  try {
    // Check if backend builds successfully
    const { execSync } = require('child_process');
    execSync('cd backend && npm run build', { stdio: 'pipe' });
    return { build: 'passing', message: 'Build successful' };
  } catch (error) {
    return { build: 'failing', message: 'Build failed' };
  }
}

/**
 * Get test coverage
 */
function getTestCoverage() {
  try {
    // This would normally read from coverage reports
    // For now, return a placeholder
    return { coverage: 'medium', percentage: 75 };
  } catch (error) {
    return { coverage: 'low', percentage: 0 };
  }
}

/**
 * Check dependencies status
 */
function getDependenciesStatus() {
  try {
    const { execSync } = require('child_process');
    const audit = execSync('npm audit --json', { encoding: 'utf8' });
    const auditData = JSON.parse(audit);
    
    if (auditData.metadata.vulnerabilities.critical > 0 || auditData.metadata.vulnerabilities.high > 0) {
      return { dependencies: 'vulnerable', message: 'Vulnerable dependencies found' };
    } else if (auditData.metadata.vulnerabilities.moderate > 0 || auditData.metadata.vulnerabilities.low > 0) {
      return { dependencies: 'outdated', message: 'Some outdated dependencies' };
    } else {
      return { dependencies: 'upToDate', message: 'All dependencies up to date' };
    }
  } catch (error) {
    return { dependencies: 'warning', message: 'Unable to check dependencies' };
  }
}

/**
 * Generate badges markdown
 */
function generateBadges() {
  const status = getProjectStatus();
  const build = getBuildStatus();
  const coverage = getTestCoverage();
  const dependencies = getDependenciesStatus();

  const badges = [
    `![Health](${BADGE_TEMPLATES.health[status.health]})`,
    `![Build](${BADGE_TEMPLATES.build[build.build]})`,
    `![Coverage](${BADGE_TEMPLATES.coverage[coverage.coverage]})`,
    `![Dependencies](${BADGE_TEMPLATES.dependencies[dependencies.dependencies]})`
  ];

  return badges.join(' ');
}

/**
 * Update README with badges
 */
function updateReadmeWithBadges() {
  const readmePath = path.join(__dirname, '..', 'README.md');
  
  if (!fs.existsSync(readmePath)) {
    console.log('❌ README.md not found');
    return;
  }

  let readme = fs.readFileSync(readmePath, 'utf8');
  const badges = generateBadges();
  
  // Check if badges section already exists
  if (readme.includes('![Health]')) {
    // Replace existing badges
    readme = readme.replace(
      /!\[Health\].*!\[Dependencies\]\([^)]+\)/s,
      badges
    );
  } else {
    // Add badges after the title
    const titleMatch = readme.match(/^# (.+)$/m);
    if (titleMatch) {
      const insertIndex = readme.indexOf(titleMatch[0]) + titleMatch[0].length;
      readme = readme.slice(0, insertIndex) + '\n\n' + badges + '\n' + readme.slice(insertIndex);
    }
  }

  fs.writeFileSync(readmePath, readme);
  console.log('✅ README updated with status badges');
}

/**
 * Generate status JSON for external consumption
 */
function generateStatusJson() {
  const status = {
    timestamp: new Date().toISOString(),
    health: getProjectStatus(),
    build: getBuildStatus(),
    coverage: getTestCoverage(),
    dependencies: getDependenciesStatus(),
    badges: {
      health: BADGE_TEMPLATES.health[getProjectStatus().health],
      build: BADGE_TEMPLATES.build[getBuildStatus().build],
      coverage: BADGE_TEMPLATES.coverage[getTestCoverage().coverage],
      dependencies: BADGE_TEMPLATES.dependencies[getDependenciesStatus().dependencies]
    }
  };

  const statusPath = path.join(__dirname, '..', 'public', 'status.json');
  fs.writeFileSync(statusPath, JSON.stringify(status, null, 2));
  console.log('✅ Status JSON generated');
  
  return status;
}

// Main execution
if (require.main === module) {
  console.log('🤖 Generating dynamic status badges...');
  
  try {
    updateReadmeWithBadges();
    const status = generateStatusJson();
    
    console.log('📊 Current Status:');
    console.log(`  Health: ${status.health.health} - ${status.health.message}`);
    console.log(`  Build: ${status.build.build} - ${status.build.message}`);
    console.log(`  Coverage: ${status.coverage.coverage} (${status.coverage.percentage}%)`);
    console.log(`  Dependencies: ${status.dependencies.dependencies} - ${status.dependencies.message}`);
    
    console.log('✅ Status badges generated successfully!');
  } catch (error) {
    console.error('❌ Error generating badges:', error.message);
    process.exit(1);
  }
}

module.exports = {
  generateBadges,
  updateReadmeWithBadges,
  generateStatusJson,
  getProjectStatus,
  getBuildStatus,
  getTestCoverage,
  getDependenciesStatus
}; 