# Tests & Quality Assurance - DocQA-MS

## Structure des Tests

```
tests/
├── unit/                    # Tests unitaires
│   ├── api-gateway/
│   ├── doc-ingestor/
│   ├── deid-service/
│   ├── indexeur-semantique/
│   ├── llm-qa-module/
│   ├── synthese-comparative/
│   ├── audit-logger/
│   └── interface-clinique/
├── integration/             # Tests d'intégration
│   ├── api-gateway/
│   └── end-to-end-flow/
├── e2e/                     # Tests End-to-End (Cypress)
│   └── interface-clinique/
├── performance/             # Tests JMeter
│   └── jmeter/
└── sonarqube/              # Configuration SonarQube
```

## 1. Tests Unitaires

### Python Services (pytest)
```bash
cd microservices/<service>
pip install pytest pytest-cov pytest-asyncio httpx
pytest tests/ -v --cov=app --cov-report=html
```

### Java Service - audit-logger (JUnit)
```bash
cd microservices/audit-logger
./mvnw test
```

### React Frontend (Jest)
```bash
cd microservices/interface-clinique
npm test -- --coverage
```

## 2. Tests d'Intégration

```bash
# Lancer tous les services
docker-compose up -d

# Exécuter les tests d'intégration
pytest tests/integration/ -v
```

## 3. Tests E2E (Cypress)

```bash
cd microservices/interface-clinique
npx cypress open
# ou
npx cypress run
```

## 4. SonarQube

```bash
# Démarrer SonarQube
docker-compose -f docker-compose.sonar.yml up -d

# Scanner le projet
sonar-scanner
```

## 5. JMeter

```bash
# GUI Mode
jmeter -t tests/performance/jmeter/docqa-performance-test.jmx

# CLI Mode (pour CI/CD)
jmeter -n -t tests/performance/jmeter/docqa-performance-test.jmx -l results.jtl -e -o report/
```

## Commandes Rapides

| Action | Commande |
|--------|----------|
| Tests unitaires Python | `pytest tests/unit/<service>/ -v` |
| Tests unitaires Java | `./mvnw test` |
| Tests unitaires React | `npm test` |
| Tests d'intégration | `pytest tests/integration/ -v` |
| Tests E2E | `npx cypress run` |
| Couverture de code | `pytest --cov --cov-report=html` |
| SonarQube scan | `sonar-scanner` |
| JMeter performance | `jmeter -n -t test.jmx -l results.jtl` |
