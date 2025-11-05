# ========================================
# DocQA-MS - Makefile
# Commandes d'automatisation pour le projet
# ========================================

.PHONY: help build start stop restart logs clean test install dev prod status health

# Couleurs pour l'affichage
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

# Variables
DOCKER_COMPOSE := docker-compose
COMPOSE_FILE := infra/docker-compose.yml
PROJECT_NAME := docqa-ms

##@ Aide

help: ## Affiche cette aide
	@echo "$(BLUE)╔═══════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║          DocQA-MS - Commandes Disponibles                ║$(NC)"
	@echo "$(BLUE)╚═══════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf "\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2 } /^##@/ { printf "\n$(YELLOW)%s$(NC)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)
	@echo ""

##@ Développement

install: ## Installe les dépendances Python localement
	@echo "$(BLUE)📦 Installation des dépendances Python...$(NC)"
	cd backend/backend_base && pip install -r requirements.txt

build: ## Build toutes les images Docker
	@echo "$(BLUE)🔨 Construction des images Docker...$(NC)"
	cd infra && $(DOCKER_COMPOSE) build
	@echo "$(GREEN)✅ Images construites avec succès$(NC)"

build-no-cache: ## Build les images sans cache
	@echo "$(BLUE)🔨 Construction des images Docker (sans cache)...$(NC)"
	cd infra && $(DOCKER_COMPOSE) build --no-cache
	@echo "$(GREEN)✅ Images construites avec succès$(NC)"

##@ Gestion des Services

start: ## Démarre tous les services
	@echo "$(BLUE)🚀 Démarrage de tous les services...$(NC)"
	cd infra && $(DOCKER_COMPOSE) up -d
	@echo "$(GREEN)✅ Services démarrés$(NC)"
	@echo "$(YELLOW)📊 Vérifiez le statut avec 'make status'$(NC)"

stop: ## Arrête tous les services
	@echo "$(BLUE)🛑 Arrêt de tous les services...$(NC)"
	cd infra && $(DOCKER_COMPOSE) down
	@echo "$(GREEN)✅ Services arrêtés$(NC)"

restart: ## Redémarre tous les services
	@echo "$(BLUE)🔄 Redémarrage de tous les services...$(NC)"
	cd infra && $(DOCKER_COMPOSE) restart
	@echo "$(GREEN)✅ Services redémarrés$(NC)"

dev: ## Lance l'environnement de développement
	@echo "$(BLUE)💻 Lancement de l'environnement de développement...$(NC)"
	cd infra && $(DOCKER_COMPOSE) up
	@echo "$(GREEN)✅ Environnement de développement lancé$(NC)"

##@ Monitoring & Logs

status: ## Affiche le statut de tous les services
	@echo "$(BLUE)📊 Statut des services:$(NC)"
	@cd infra && $(DOCKER_COMPOSE) ps

logs: ## Affiche les logs de tous les services
	@echo "$(BLUE)📋 Logs des services (Ctrl+C pour quitter):$(NC)"
	cd infra && $(DOCKER_COMPOSE) logs -f

logs-backend: ## Affiche les logs du backend_base
	@cd infra && $(DOCKER_COMPOSE) logs -f backend_base

logs-db: ## Affiche les logs PostgreSQL
	@cd infra && $(DOCKER_COMPOSE) logs -f postgres

logs-rabbitmq: ## Affiche les logs RabbitMQ
	@cd infra && $(DOCKER_COMPOSE) logs -f rabbitmq

logs-minio: ## Affiche les logs MinIO
	@cd infra && $(DOCKER_COMPOSE) logs -f minio

health: ## Vérifie la santé de tous les services
	@echo "$(BLUE)🏥 Vérification de la santé des services...$(NC)"
	@echo ""
	@echo "$(YELLOW)Backend Base:$(NC)"
	@curl -s http://localhost:8000/health || echo "$(RED)❌ Non disponible$(NC)"
	@echo ""
	@echo "$(YELLOW)DocIngestor:$(NC)"
	@curl -s http://localhost:8001/health || echo "$(RED)❌ Non disponible$(NC)"
	@echo ""
	@echo "$(YELLOW)DeID:$(NC)"
	@curl -s http://localhost:8002/health || echo "$(RED)❌ Non disponible$(NC)"
	@echo ""
	@echo "$(YELLOW)Indexeur:$(NC)"
	@curl -s http://localhost:8003/health || echo "$(RED)❌ Non disponible$(NC)"
	@echo ""
	@echo "$(YELLOW)LLMQA:$(NC)"
	@curl -s http://localhost:8004/health || echo "$(RED)❌ Non disponible$(NC)"
	@echo ""
	@echo "$(YELLOW)Synthèse:$(NC)"
	@curl -s http://localhost:8005/health || echo "$(RED)❌ Non disponible$(NC)"
	@echo ""
	@echo "$(YELLOW)AuditLogger:$(NC)"
	@curl -s http://localhost:8006/health || echo "$(RED)❌ Non disponible$(NC)"
	@echo ""

##@ Base de données

db-shell: ## Accède au shell PostgreSQL
	@echo "$(BLUE)🗄️  Connexion à PostgreSQL...$(NC)"
	cd infra && $(DOCKER_COMPOSE) exec postgres psql -U docqa -d docqa_db

db-migrate: ## Exécute les migrations Alembic
	@echo "$(BLUE)🔄 Exécution des migrations...$(NC)"
	cd infra && $(DOCKER_COMPOSE) exec backend_base alembic upgrade head

db-reset: ## Reset la base de données (⚠️  DANGER: efface toutes les données)
	@echo "$(RED)⚠️  ATTENTION: Cette commande va effacer toutes les données!$(NC)"
	@read -p "Êtes-vous sûr? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "$(BLUE)🗑️  Reset de la base de données...$(NC)"; \
		cd infra && $(DOCKER_COMPOSE) down -v; \
		cd infra && $(DOCKER_COMPOSE) up -d postgres; \
		echo "$(GREEN)✅ Base de données réinitialisée$(NC)"; \
	fi

##@ Nettoyage

clean: ## Arrête les services et nettoie les ressources
	@echo "$(BLUE)🧹 Nettoyage des ressources...$(NC)"
	cd infra && $(DOCKER_COMPOSE) down -v --remove-orphans
	@echo "$(GREEN)✅ Nettoyage terminé$(NC)"

clean-all: ## Nettoie tout (volumes, images, networks)
	@echo "$(RED)⚠️  Nettoyage complet...$(NC)"
	cd infra && $(DOCKER_COMPOSE) down -v --rmi all --remove-orphans
	@echo "$(GREEN)✅ Nettoyage complet terminé$(NC)"

prune: ## Nettoie les ressources Docker inutilisées
	@echo "$(BLUE)🧹 Nettoyage des ressources Docker inutilisées...$(NC)"
	docker system prune -f
	@echo "$(GREEN)✅ Nettoyage Docker terminé$(NC)"

##@ Tests

test: ## Lance les tests unitaires
	@echo "$(BLUE)🧪 Exécution des tests...$(NC)"
	cd backend/backend_base && pytest tests/ -v
	@echo "$(GREEN)✅ Tests terminés$(NC)"

test-coverage: ## Lance les tests avec coverage
	@echo "$(BLUE)🧪 Exécution des tests avec coverage...$(NC)"
	cd backend/backend_base && pytest tests/ --cov=app --cov-report=html
	@echo "$(GREEN)✅ Coverage généré dans htmlcov/$(NC)"

##@ Shell & Debug

shell: ## Accède au shell du conteneur backend_base
	@echo "$(BLUE)🐚 Shell backend_base...$(NC)"
	cd infra && $(DOCKER_COMPOSE) exec backend_base bash

shell-ingestor: ## Accède au shell du conteneur doc_ingestor
	@cd infra && $(DOCKER_COMPOSE) exec doc_ingestor bash

shell-deid: ## Accède au shell du conteneur deid
	@cd infra && $(DOCKER_COMPOSE) exec deid bash

##@ URLs Utiles

urls: ## Affiche toutes les URLs importantes
	@echo "$(BLUE)╔═══════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║                   URLs du Projet                          ║$(NC)"
	@echo "$(BLUE)╚═══════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(GREEN)📚 Documentation API:$(NC)"
	@echo "  Backend Base:    http://localhost:8000/docs"
	@echo "  DocIngestor:     http://localhost:8001/docs"
	@echo "  DeID:            http://localhost:8002/docs"
	@echo "  Indexeur:        http://localhost:8003/docs"
	@echo "  LLMQA:           http://localhost:8004/docs"
	@echo "  Synthèse:        http://localhost:8005/docs"
	@echo "  AuditLogger:     http://localhost:8006/docs"
	@echo ""
	@echo "$(GREEN)🔧 Infrastructure:$(NC)"
	@echo "  RabbitMQ:        http://localhost:15672 (admin/admin)"
	@echo "  MinIO Console:   http://localhost:9001 (admin/admin123)"
	@echo "  PostgreSQL:      localhost:5432 (docqa/docqa_pwd)"
	@echo ""

##@ Production

prod-build: ## Build les images pour la production
	@echo "$(BLUE)🏭 Build des images de production...$(NC)"
	cd infra && $(DOCKER_COMPOSE) -f docker-compose.yml -f docker-compose.prod.yml build
	@echo "$(GREEN)✅ Images de production construites$(NC)"

prod-start: ## Démarre en mode production
	@echo "$(BLUE)🚀 Démarrage en mode production...$(NC)"
	cd infra && $(DOCKER_COMPOSE) -f docker-compose.yml -f docker-compose.prod.yml up -d
	@echo "$(GREEN)✅ Services de production démarrés$(NC)"

##@ Backup & Restore

backup-db: ## Sauvegarde la base de données
	@echo "$(BLUE)💾 Sauvegarde de la base de données...$(NC)"
	@mkdir -p backups
	cd infra && $(DOCKER_COMPOSE) exec -T postgres pg_dump -U docqa docqa_db > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✅ Sauvegarde créée dans backups/$(NC)"

restore-db: ## Restaure la base de données (spécifier BACKUP=fichier.sql)
	@echo "$(BLUE)📥 Restauration de la base de données...$(NC)"
	@if [ -z "$(BACKUP)" ]; then \
		echo "$(RED)❌ Erreur: spécifiez le fichier avec BACKUP=fichier.sql$(NC)"; \
		exit 1; \
	fi
	cd infra && $(DOCKER_COMPOSE) exec -T postgres psql -U docqa docqa_db < $(BACKUP)
	@echo "$(GREEN)✅ Base de données restaurée$(NC)"

##@ Info

info: ## Affiche les informations du projet
	@echo "$(BLUE)╔═══════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║              DocQA-MS - Information Projet                ║$(NC)"
	@echo "$(BLUE)╚═══════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(GREEN)Projet:$(NC)         DocQA-MS"
	@echo "$(GREEN)Version:$(NC)        1.0.0"
	@echo "$(GREEN)Description:$(NC)    Assistant Médical Intelligent"
	@echo "$(GREEN)Architecture:$(NC)   Microservices + LLM + RAG"
	@echo ""
	@echo "$(YELLOW)Services Backend:$(NC)  7 microservices"
	@echo "$(YELLOW)Base de données:$(NC)  PostgreSQL"
	@echo "$(YELLOW)Message Broker:$(NC)   RabbitMQ"
	@echo "$(YELLOW)Object Storage:$(NC)   MinIO"
	@echo ""

# Commande par défaut
.DEFAULT_GOAL := help
