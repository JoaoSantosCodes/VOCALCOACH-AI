# Configuração DNS para Email - VocalCoach AI

## Registros DNS Necessários

1. Registro SPF (TXT):
   - Nome: vocalcoach.ai
   - Tipo: TXT
   - Valor: v=spf1 include:_spf.google.com ~all

2. Registro DKIM (TXT):
   - Nome: beta._domainkey.vocalcoach.ai
   - Tipo: TXT
   - Valor: v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEApnbl64zwnvgV1ztjkoDniAw5/yWhui3X0lpn19S4vciMpLsT+JgYLzBebRZynuUSLHtaFDOgBql92zs+OjtByqdg7KlpZ767n0Kxe2QjhYTxRY1ZNp71NdWJcNOYgWrvTV+z7Z2IP/1RFdG33n0HRzeBTqruyUhEOQrdJ6cE/B0HkpPjoOIaqd/9v0J7mOrpVtHQaJK8VeSgIbl2Rq33j5LjZXtGLrzEAWZuHgQfmvu/NKh2aOdwM77TocRhtG8yfv0tMKaeM+7mpcsSCkm4E82G8dhBK8m5VU5XZNppHRj03Fr1bu3Yem3/XV17BYdVeqwrxmKMUvkQZnyp0oMcBQIDAQAB

3. Registro DMARC (TXT):
   - Nome: _dmarc.vocalcoach.ai
   - Tipo: TXT
   - Valor: v=DMARC1; p=quarantine; rua=mailto:dmarc@vocalcoach.ai

## Instruções

1. Adicione os registros acima no seu provedor DNS
2. Aguarde a propagação (pode levar até 48 horas)
3. Use o script de verificação para confirmar a configuração

## Arquivos Gerados

- Chave privada DKIM: ./config/dns/dkim.private.key
- Registros DNS: ./config/dns/dns-records.json

## Próximos Passos

1. Adicione os registros DNS
2. Execute: npm run beta:verify-dns
3. Configure as chaves no servidor SMTP