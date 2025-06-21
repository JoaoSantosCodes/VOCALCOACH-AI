const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '..', 'config', 'env', 'staging.env') });

// Configurações
const DNS_RECORDS_PATH = path.join(__dirname, '..', 'config', 'dns', 'dns-records.json');
const CLOUDFLARE_API = 'https://api.cloudflare.com/client/v4';
const ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;
const API_TOKEN = process.env.DNS_API_TOKEN;

if (!ZONE_ID || !API_TOKEN) {
    console.error('❌ CLOUDFLARE_ZONE_ID e DNS_API_TOKEN são obrigatórios');
    process.exit(1);
}

// Cliente Cloudflare
const cloudflare = axios.create({
    baseURL: CLOUDFLARE_API,
    headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
    }
});

async function loadDNSRecords() {
    try {
        const data = await fs.readFile(DNS_RECORDS_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('❌ Erro ao carregar registros DNS:', error);
        process.exit(1);
    }
}

async function getExistingRecords() {
    try {
        const response = await cloudflare.get(`/zones/${ZONE_ID}/dns_records`);
        return response.data.result;
    } catch (error) {
        console.error('❌ Erro ao buscar registros existentes:', error);
        throw error;
    }
}

async function createDNSRecord(record) {
    try {
        const response = await cloudflare.post(`/zones/${ZONE_ID}/dns_records`, {
            type: record.type,
            name: record.name,
            content: record.value,
            ttl: 1, // Auto TTL
            proxied: false
        });
        return response.data.result;
    } catch (error) {
        console.error(`❌ Erro ao criar registro ${record.name}:`, error.response?.data || error);
        throw error;
    }
}

async function updateDNSRecord(recordId, record) {
    try {
        const response = await cloudflare.put(`/zones/${ZONE_ID}/dns_records/${recordId}`, {
            type: record.type,
            name: record.name,
            content: record.value,
            ttl: 1,
            proxied: false
        });
        return response.data.result;
    } catch (error) {
        console.error(`❌ Erro ao atualizar registro ${record.name}:`, error.response?.data || error);
        throw error;
    }
}

async function setupDNSRecords() {
    console.log('🚀 Iniciando configuração dos registros DNS...\n');

    try {
        // Carregar registros do arquivo
        const records = await loadDNSRecords();
        console.log('📝 Registros carregados:', Object.keys(records));

        // Buscar registros existentes
        const existingRecords = await getExistingRecords();
        console.log('🔍 Registros existentes encontrados:', existingRecords.length);

        // Processar cada registro
        for (const [type, record] of Object.entries(records)) {
            console.log(`\nProcessando registro ${type.toUpperCase()}...`);

            // Procurar registro existente
            const existing = existingRecords.find(r => 
                r.type === record.type && r.name === record.name
            );

            if (existing) {
                if (existing.content !== record.value) {
                    console.log(`📝 Atualizando registro ${record.name}...`);
                    await updateDNSRecord(existing.id, record);
                    console.log('✅ Registro atualizado com sucesso');
                } else {
                    console.log('✅ Registro já está atualizado');
                }
            } else {
                console.log(`📝 Criando novo registro ${record.name}...`);
                await createDNSRecord(record);
                console.log('✅ Registro criado com sucesso');
            }
        }

        console.log('\n🎉 Configuração DNS concluída com sucesso!');
        console.log('\n⚠️ Nota: A propagação dos registros DNS pode levar até 48 horas.');
        console.log('📋 Execute npm run beta:verify-dns para verificar o status dos registros');

    } catch (error) {
        console.error('\n❌ Erro durante a configuração DNS:', error);
        process.exit(1);
    }
}

// Executar configuração
setupDNSRecords(); 