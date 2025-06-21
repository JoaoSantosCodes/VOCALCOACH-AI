# Configuração DNS para Email - VocalCoach AI

## Registros DNS Necessários

1. Registro SPF (TXT):
   - Nome: vocalcoach.ai
   - Tipo: TXT
   - Valor: v=spf1 include:_spf.google.com ~all

2. Registro DKIM (TXT):
   - Nome: beta._domainkey.vocalcoach.ai
   - Tipo: TXT
   - Valor: v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmf7cLRTL+PTmaRdUmW9NO2RIilXvBGB7rKcUfw6OIZ7MOATPkYN8ajWRW91r5V2O1EAgdICaYNldxa35a7jqltE+5WHXtV+VzigAaXIQ4kni7JW00o1ei1W9NNS5xxSzSHITsuGpyYtPJFQL5ftx3YWowSJjakbfZWC8/4KoG/p4QpXBVOxjkXJ6ycExod8jLZQvzIYeSvkGlvYa6yJPFsuvEyg8W0dPy8X2PfgjJQkhlqlRhr+iXfCgIGKuMbTAN0Lw1mG8ljQDUHheKkNq5S6zfKXxAIC53qmiDh+k9jfmQIUVhLJpFJo3lC4I95QDkVRhgS3oChLAtPyO0kqqnQIDAQAB

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