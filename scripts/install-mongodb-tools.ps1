# Script para instalar MongoDB Database Tools localmente
$ErrorActionPreference = "Stop"

# Configurações
$toolsVersion = "100.9.4"
$toolsDir = "tools\mongodb"
$downloadUrl = "https://fastdl.mongodb.org/tools/db/mongodb-database-tools-windows-x86_64-$toolsVersion.zip"
$zipFile = "$toolsDir\mongodb-tools.zip"
$extractDir = "$toolsDir\mongodb-database-tools-windows-x86_64-$toolsVersion"

Write-Host "Iniciando instalação do MongoDB Database Tools v$toolsVersion..." -ForegroundColor Cyan

# Criar diretório se não existir
if (-not (Test-Path $toolsDir)) {
    Write-Host "Criando diretório $toolsDir..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path $toolsDir | Out-Null
}

# Download do arquivo
Write-Host "Baixando MongoDB Tools..." -ForegroundColor Yellow
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
try {
    Invoke-WebRequest -Uri $downloadUrl -OutFile $zipFile
} catch {
    Write-Host "Erro ao baixar arquivo: $_" -ForegroundColor Red
    exit 1
}

# Extrair arquivo
Write-Host "Extraindo arquivos..." -ForegroundColor Yellow
try {
    Expand-Archive -Path $zipFile -DestinationPath $toolsDir -Force
} catch {
    Write-Host "Erro ao extrair arquivo: $_" -ForegroundColor Red
    exit 1
}

# Adicionar ao PATH
$binPath = Resolve-Path "$extractDir\bin"
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")

if (-not $currentPath.Contains($binPath)) {
    Write-Host "Adicionando ao PATH do usuário..." -ForegroundColor Yellow
    [Environment]::SetEnvironmentVariable(
        "Path",
        "$currentPath;$binPath",
        "User"
    )
    $env:Path = "$env:Path;$binPath"
}

# Verificar instalação
Write-Host "Verificando instalação..." -ForegroundColor Yellow
try {
    $mongodumpPath = Join-Path $binPath "mongodump.exe"
    if (Test-Path $mongodumpPath) {
        Write-Host "MongoDB Database Tools instalado com sucesso!" -ForegroundColor Green
        Write-Host "Local: $binPath" -ForegroundColor Cyan
        
        # Criar arquivo de configuração
        $configContent = @"
MONGODB_TOOLS_PATH=$binPath
MONGODB_TOOLS_VERSION=$toolsVersion
"@
        Set-Content -Path "$toolsDir\config.env" -Value $configContent
        
        Write-Host "Configuração salva em: $toolsDir\config.env" -ForegroundColor Cyan
    } else {
        throw "mongodump.exe não encontrado em $binPath"
    }
} catch {
    Write-Host "Erro ao verificar instalação: $_" -ForegroundColor Red
    exit 1
}

# Limpar arquivos temporários
Write-Host "Limpando arquivos temporários..." -ForegroundColor Yellow
Remove-Item $zipFile -Force

Write-Host "`nInstalação concluída!" -ForegroundColor Green
Write-Host "Para testar, abra um novo terminal e execute: mongodump --version" -ForegroundColor Cyan 