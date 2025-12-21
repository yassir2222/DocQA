# DocQA-MS - Guide Complet des Tests et Analyse de Qualité

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Tests Unitaires](#tests-unitaires)
3. [Tests d'Intégration](#tests-dintégration)
4. [Tests E2E (Cypress)](#tests-e2e-cypress)
5. [SonarQube](#sonarqube)
6. [JMeter - Tests de Performance](#jmeter---tests-de-performance)
7. [CI/CD Integration](#cicd-integration)

---

## Vue d'ensemble

### Structure des Tests

```
DocQA-MS/
├── tests/
│   ├── unit/                    # Tests unitaires
│   │   ├── api_gateway/
│   │   ├── doc_ingestor/
│   │   ├── deid_service/
│   │   ├── indexeur_semantique/
│   │   ├── llm_qa_module/
│   │   ├── synthese_comparative/
│   │   └── audit_logger/
│   ├── integration/             # Tests d'intégration
│   ├── e2e/                     # Tests End-to-End (Cypress)
│   │   └── cypress/
│   └── performance/             # Tests JMeter
│       └── jmeter/
├── pytest.ini                   # Configuration pytest
├── sonar-project.properties     # Configuration SonarQube
├── docker-compose.sonar.yml     # Docker SonarQube
├── requirements-test.txt        # Dépendances tests Python
└── run-tests.bat               # Script exécution tests
```

---

## Tests Unitaires

### Python (pytest)

#### Installation
```bash
pip install -r requirements-test.txt
```

#### Exécution
```bash
# Tous les tests unitaires
pytest tests/unit/ -v

# Tests d'un service spécifique
pytest tests/unit/api_gateway/ -v

# Avec couverture de code
pytest tests/unit/ --cov=microservices --cov-report=html

# Mode parallèle (plus rapide)
pytest tests/unit/ -n auto
```

#### Rapport de couverture
Après exécution avec `--cov-report=html`, ouvrir `htmlcov/index.html`

### Java (JUnit) - Audit Logger

#### Exécution
```bash
cd microservices/audit-logger
./mvnw test
```

#### Avec couverture (JaCoCo)
```bash
./mvnw verify
# Rapport dans target/site/jacoco/index.html
```

### React (Jest)

#### Exécution
```bash
cd microservices/interface-clinique
npm test -- --coverage
```

---

## Tests d'Intégration

### Prérequis
- Tous les services Docker doivent être démarrés
```bash
docker-compose up -d
```

### Exécution
```bash
pytest tests/integration/ -v -s
```

### Tests inclus
- Health check de tous les services
- Workflow complet d'upload de documents
- Flow Question-Réponse avec LLM
- Génération de synthèse
- Enregistrement des logs d'audit

---

## Tests E2E (Cypress)

### Installation
```bash
cd tests/e2e
npm install cypress
```

### Exécution

#### Mode interactif (GUI)
```bash
npx cypress open
```

#### Mode headless (CI)
```bash
npx cypress run
```

### Tests inclus
- Navigation entre pages
- Command Palette (Ctrl+K)
- Dashboard
- Documents
- Assistant IA
- Analytics
- Aide
- Toggle thème sombre/clair

---

## SonarQube

### Démarrage du serveur
```bash
docker-compose -f docker-compose.sonar.yml up -d
```

Accès: http://localhost:9000
- Login: admin
- Password: admin (à changer)

### Configuration du projet

1. Créer un nouveau projet dans SonarQube
2. Générer un token d'authentification
3. Mettre à jour `sonar-project.properties` avec le token

### Scanner le code
```bash
# Installer sonar-scanner (une fois)
# Télécharger depuis: https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/

# Lancer le scan
sonar-scanner -Dsonar.login=<YOUR_TOKEN>
```

### Métriques analysées
- Bugs et vulnérabilités
- Code smells
- Couverture de tests
- Duplication de code
- Complexité cyclomatique
- Dette technique

---

## JMeter - Tests de Performance

### Installation
Télécharger Apache JMeter: https://jmeter.apache.org/download_jmeter.cgi

### Exécution

#### Mode GUI (développement)
```bash
jmeter -t tests/performance/jmeter/docqa-performance-test.jmx
```

#### Mode CLI (CI/CD)
```bash
jmeter -n -t tests/performance/jmeter/docqa-performance-test.jmx -l results.jtl -e -o report/
```

### Scénarios de test
| Scénario | Threads | Loops | Description |
|----------|---------|-------|-------------|
| Health Check | 50 | 10 | Test de charge basique |
| Documents API | 20 | 5 | Récupération des documents |
| Audit Logs | 30 | 5 | Logs d'audit |
| Q&A API | 10 | 2 | Questions LLM (charge lourde) |

### Rapport HTML
Après exécution en CLI, ouvrir `report/index.html`

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: DocQA-MS Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: pip install -r requirements-test.txt
      
      - name: Run unit tests
        run: pytest tests/unit/ --cov --cov-report=xml
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v3
      
      - name: Start services
        run: docker-compose up -d
      
      - name: Wait for services
        run: sleep 30
      
      - name: Run integration tests
        run: pytest tests/integration/ -v

  e2e-tests:
    runs-on: ubuntu-latest
    needs: integration-tests
    steps:
      - uses: actions/checkout@v3
      
      - name: Start services
        run: docker-compose up -d
      
      - name: Cypress E2E
        uses: cypress-io/github-action@v6
        with:
          working-directory: tests/e2e
          wait-on: 'http://localhost:3000'

  sonarqube:
    runs-on: ubuntu-latest
    needs: unit-tests
    steps:
      - uses: actions/checkout@v3
      
      - name: SonarQube Scan
        uses: sonarsource/sonarqube-scan-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
```

---

## Commandes Rapides

| Action | Commande |
|--------|----------|
| Tous les tests Python | `pytest tests/ -v` |
| Tests unitaires seulement | `pytest tests/unit/ -v` |
| Tests d'intégration | `pytest tests/integration/ -v` |
| Tests avec couverture | `pytest --cov --cov-report=html` |
| Cypress interactif | `npx cypress open` |
| Cypress headless | `npx cypress run` |
| JMeter GUI | `jmeter -t test.jmx` |
| JMeter CLI | `jmeter -n -t test.jmx -l results.jtl` |
| SonarQube scan | `sonar-scanner` |
| Lancer tous les tests | `run-tests.bat` |

---

## Métriques de Qualité Cibles

| Métrique | Cible |
|----------|-------|
| Couverture de code | > 80% |
| Bugs (SonarQube) | 0 |
| Vulnérabilités | 0 |
| Code Smells | < 50 |
| Duplication | < 3% |
| Temps réponse (P95) | < 2s |
| Taux d'erreur | < 0.1% |
