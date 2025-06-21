# 📧 Configuração do Sistema de Email

## 1. Configuração DNS

### SPF (Sender Policy Framework)
Adicione o seguinte registro TXT no seu DNS:
```
v=spf1 include:_spf.google.com include:_spf.vocalcoach.ai ~all
```

### DKIM (DomainKeys Identified Mail)
1. Gere as chaves DKIM:
```bash
openssl genrsa -out dkim-private.key 2048
openssl rsa -in dkim-private.key -pubout -out dkim-public.key
```

2. Adicione o registro TXT no DNS:
```
Selector: default._domainkey.vocalcoach.ai
Valor: v=DKIM1; k=rsa; p=[CHAVE_PUBLICA]
```

## 2. Configuração SMTP

### Variáveis de Ambiente
```env
# Configuração SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@vocalcoach.ai
SMTP_PASS=sua-senha-de-app

# Configuração de Email
EMAIL_FROM=noreply@vocalcoach.ai
EMAIL_REPLY_TO=support@vocalcoach.ai
```

### Gmail (Recomendado para Beta)
1. Ative autenticação de 2 fatores
2. Gere uma senha de aplicativo
3. Use a senha gerada em `SMTP_PASS`

### Servidor SMTP Próprio
1. Configure o Postfix:
```bash
sudo apt-get install postfix
sudo postfix start
```

2. Configure o arquivo main.cf:
```
smtpd_banner = $myhostname ESMTP $mail_name
biff = no
append_dot_mydomain = no
readme_directory = no
smtpd_tls_cert_file=/etc/ssl/certs/ssl-cert-snakeoil.pem
smtpd_tls_key_file=/etc/ssl/private/ssl-cert-snakeoil.key
smtpd_use_tls=yes
smtpd_tls_session_cache_database = btree:${data_directory}/smtpd_scache
smtp_tls_session_cache_database = btree:${data_directory}/smtp_scache
smtpd_relay_restrictions = permit_mynetworks permit_sasl_authenticated defer_unauth_destination
myhostname = vocalcoach.ai
alias_maps = hash:/etc/aliases
alias_database = hash:/etc/aliases
myorigin = /etc/mailname
mydestination = $myhostname, localhost.$mydomain, localhost
relayhost =
mynetworks = 127.0.0.0/8 [::ffff:127.0.0.0]/104 [::1]/128
mailbox_size_limit = 0
recipient_delimiter = +
inet_interfaces = all
inet_protocols = all
```

## 3. Teste de Configuração

Execute o script de validação:
```bash
npm run beta:validate-email
```

### Resolução de Problemas

#### SPF Falhou
- Verifique se o registro TXT foi propagado (pode levar até 48h)
- Confirme se o formato está correto
- Use ferramentas online de verificação SPF

#### DKIM Falhou
- Verifique se o selector está correto
- Confirme se a chave pública está no formato correto
- Aguarde a propagação DNS

#### SMTP Falhou
- Verifique as credenciais
- Teste a porta com telnet: `telnet smtp.gmail.com 587`
- Verifique firewalls e regras de rede

## 4. Monitoramento

### Métricas a Monitorar
- Taxa de entrega
- Taxa de abertura
- Taxa de rejeição
- Tempo de entrega
- Bounce rate

### Ferramentas de Monitoramento
- Postmark
- SendGrid
- MailGun
- Amazon SES

## 5. Boas Práticas

### Envio em Massa
- Use filas de envio
- Implemente rate limiting
- Monitore bounces
- Limpe lista de emails regularmente

### Templates
- Use templates HTML responsivos
- Inclua versão texto plano
- Teste em diferentes clientes de email
- Evite palavras que disparam spam

### Segurança
- Implemente DMARC
- Use TLS para SMTP
- Rotacione senhas regularmente
- Monitore atividades suspeitas

## 6. Checklist Final

- [ ] DNS configurado
  - [ ] SPF
  - [ ] DKIM
  - [ ] MX Records
  - [ ] DMARC (opcional)

- [ ] SMTP configurado
  - [ ] Credenciais seguras
  - [ ] Porta correta
  - [ ] TLS ativo

- [ ] Templates prontos
  - [ ] Convite beta
  - [ ] Recuperação de senha
  - [ ] Notificações
  - [ ] Relatórios

- [ ] Monitoramento
  - [ ] Métricas configuradas
  - [ ] Alertas configurados
  - [ ] Dashboard pronto

- [ ] Testes
  - [ ] Validação de email
  - [ ] Teste de carga
  - [ ] Teste de templates
  - [ ] Teste de bounce 