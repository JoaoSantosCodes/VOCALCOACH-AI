#!/usr/bin/env node

/**
 * 📡 Discord Notifications System
 * 
 * Sends automated notifications to Discord based on AI diagnosis results
 * and project status changes
 */

const fs = require('fs');
const path = require('path');

// Discord webhook configuration
const DISCORD_CONFIG = {
  webhookUrl: process.env.DISCORD_WEBHOOK_URL || '',
  botName: 'VocalCoach AI Bot',
  botAvatar: 'https://img.icons8.com/color/96/000000/microphone.png',
  colors: {
    success: 0x00ff00,
    warning: 0xffaa00,
    error: 0xff0000,
    info: 0x0099ff
  }
};

/**
 * Send Discord notification
 */
async function sendDiscordNotification(embed) {
  if (!DISCORD_CONFIG.webhookUrl) {
    console.log('⚠️ Discord webhook URL not configured');
    return;
  }

  try {
    const payload = {
      username: DISCORD_CONFIG.botName,
      avatar_url: DISCORD_CONFIG.botAvatar,
      embeds: [embed]
    };

    const response = await fetch(DISCORD_CONFIG.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log('✅ Discord notification sent successfully');
    } else {
      console.error('❌ Failed to send Discord notification:', response.statusText);
    }
  } catch (error) {
    console.error('❌ Error sending Discord notification:', error.message);
  }
}

/**
 * Create diagnosis notification
 */
function createDiagnosisNotification(diagnosisResult) {
  const { status, criticalIssues, warnings, recommendations } = diagnosisResult;
  
  let color = DISCORD_CONFIG.colors.success;
  let title = '✅ Project Health Check - All Good!';
  
  if (status === 'critical') {
    color = DISCORD_CONFIG.colors.error;
    title = '🚨 Critical Issues Detected!';
  } else if (status === 'warning') {
    color = DISCORD_CONFIG.colors.warning;
    title = '⚠️ Warnings Detected';
  }

  const embed = {
    title,
    color,
    timestamp: new Date().toISOString(),
    fields: []
  };

  if (criticalIssues && criticalIssues.length > 0) {
    embed.fields.push({
      name: '🚨 Critical Issues',
      value: criticalIssues.slice(0, 5).join('\n') + (criticalIssues.length > 5 ? '\n...' : ''),
      inline: false
    });
  }

  if (warnings && warnings.length > 0) {
    embed.fields.push({
      name: '⚠️ Warnings',
      value: warnings.slice(0, 3).join('\n') + (warnings.length > 3 ? '\n...' : ''),
      inline: false
    });
  }

  if (recommendations && recommendations.length > 0) {
    embed.fields.push({
      name: '🎯 Recommendations',
      value: recommendations.slice(0, 3).join('\n') + (recommendations.length > 3 ? '\n...' : ''),
      inline: false
    });
  }

  embed.fields.push({
    name: '📊 Status',
    value: status.toUpperCase(),
    inline: true
  });

  return embed;
}

/**
 * Create build notification
 */
function createBuildNotification(buildResult) {
  const { success, errors, warnings, duration } = buildResult;
  
  const color = success ? DISCORD_CONFIG.colors.success : DISCORD_CONFIG.colors.error;
  const title = success ? '✅ Build Successful' : '❌ Build Failed';

  const embed = {
    title,
    color,
    timestamp: new Date().toISOString(),
    fields: [
      {
        name: '📊 Status',
        value: success ? 'SUCCESS' : 'FAILED',
        inline: true
      },
      {
        name: '⏱️ Duration',
        value: `${duration}s`,
        inline: true
      }
    ]
  };

  if (errors && errors.length > 0) {
    embed.fields.push({
      name: '❌ Errors',
      value: errors.slice(0, 3).join('\n') + (errors.length > 3 ? '\n...' : ''),
      inline: false
    });
  }

  if (warnings && warnings.length > 0) {
    embed.fields.push({
      name: '⚠️ Warnings',
      value: warnings.slice(0, 3).join('\n') + (warnings.length > 3 ? '\n...' : ''),
      inline: false
    });
  }

  return embed;
}

/**
 * Create deployment notification
 */
function createDeploymentNotification(deploymentResult) {
  const { environment, success, version, duration } = deploymentResult;
  
  const color = success ? DISCORD_CONFIG.colors.success : DISCORD_CONFIG.colors.error;
  const title = success ? '🚀 Deployment Successful' : '💥 Deployment Failed';

  const embed = {
    title,
    color,
    timestamp: new Date().toISOString(),
    fields: [
      {
        name: '🌍 Environment',
        value: environment.toUpperCase(),
        inline: true
      },
      {
        name: '📦 Version',
        value: version,
        inline: true
      },
      {
        name: '⏱️ Duration',
        value: `${duration}s`,
        inline: true
      }
    ]
  };

  return embed;
}

/**
 * Create security alert
 */
function createSecurityAlert(securityResult) {
  const { vulnerabilities, severity, packageName } = securityResult;
  
  const color = DISCORD_CONFIG.colors.error;
  const title = '🔒 Security Alert';

  const embed = {
    title,
    color,
    timestamp: new Date().toISOString(),
    fields: [
      {
        name: '🚨 Severity',
        value: severity.toUpperCase(),
        inline: true
      },
      {
        name: '📦 Package',
        value: packageName,
        inline: true
      },
      {
        name: '📊 Vulnerabilities',
        value: vulnerabilities.toString(),
        inline: true
      }
    ]
  };

  return embed;
}

/**
 * Send diagnosis notification
 */
async function notifyDiagnosis(diagnosisResult) {
  const embed = createDiagnosisNotification(diagnosisResult);
  await sendDiscordNotification(embed);
}

/**
 * Send build notification
 */
async function notifyBuild(buildResult) {
  const embed = createBuildNotification(buildResult);
  await sendDiscordNotification(embed);
}

/**
 * Send deployment notification
 */
async function notifyDeployment(deploymentResult) {
  const embed = createDeploymentNotification(deploymentResult);
  await sendDiscordNotification(embed);
}

/**
 * Send security alert
 */
async function notifySecurityAlert(securityResult) {
  const embed = createSecurityAlert(securityResult);
  await sendDiscordNotification(embed);
}

/**
 * Send daily status report
 */
async function sendDailyReport() {
  try {
    // Read diagnosis report
    const diagnosisPath = path.join(__dirname, '..', 'diagnosis-report.txt');
    let diagnosis = 'No diagnosis report available';
    
    if (fs.existsSync(diagnosisPath)) {
      diagnosis = fs.readFileSync(diagnosisPath, 'utf8');
    }

    const embed = {
      title: '📊 Daily Status Report',
      color: DISCORD_CONFIG.colors.info,
      timestamp: new Date().toISOString(),
      description: 'Daily health check summary for VocalCoach AI project',
      fields: [
        {
          name: '📅 Date',
          value: new Date().toLocaleDateString(),
          inline: true
        },
        {
          name: '🤖 AI Diagnosis',
          value: diagnosis.includes('PROBLEMAS CRÍTICOS') ? '🔴 Critical' : 
                 diagnosis.includes('Nenhum problema crítico') ? '✅ Healthy' : '⚠️ Warnings',
          inline: true
        }
      ]
    };

    await sendDiscordNotification(embed);
  } catch (error) {
    console.error('❌ Error sending daily report:', error.message);
  }
}

/**
 * Test Discord webhook
 */
async function testDiscordWebhook() {
  const embed = {
    title: '🧪 Discord Webhook Test',
    description: 'This is a test notification from the VocalCoach AI Discord bot',
    color: DISCORD_CONFIG.colors.info,
    timestamp: new Date().toISOString(),
    fields: [
      {
        name: '✅ Status',
        value: 'Webhook is working correctly',
        inline: true
      }
    ]
  };

  await sendDiscordNotification(embed);
}

// Main execution
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'test':
      testDiscordWebhook();
      break;
    case 'daily':
      sendDailyReport();
      break;
    case 'diagnosis':
      // Read from diagnosis report
      const diagnosisPath = path.join(__dirname, '..', 'diagnosis-report.txt');
      if (fs.existsSync(diagnosisPath)) {
        const diagnosis = fs.readFileSync(diagnosisPath, 'utf8');
        const result = {
          status: diagnosis.includes('PROBLEMAS CRÍTICOS') ? 'critical' : 
                  diagnosis.includes('Nenhum problema crítico') ? 'healthy' : 'warning',
          criticalIssues: diagnosis.match(/🚨 ([^\n]+)/g) || [],
          warnings: diagnosis.match(/⚠️ ([^\n]+)/g) || [],
          recommendations: diagnosis.match(/🎯 ([^\n]+)/g) || []
        };
        notifyDiagnosis(result);
      }
      break;
    default:
      console.log('Usage: node discord-notifications.js [test|daily|diagnosis]');
  }
}

module.exports = {
  sendDiscordNotification,
  notifyDiagnosis,
  notifyBuild,
  notifyDeployment,
  notifySecurityAlert,
  sendDailyReport,
  testDiscordWebhook
}; 