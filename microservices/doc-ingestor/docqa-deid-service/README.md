# DocQA De-Identification Service

This microservice anonymizes personal and sensitive data in clinical documents using Named Entity Recognition (NER) with OpenNLP. It replaces identified entities with pseudonyms stored in PostgreSQL, ensuring consistent de-identification across documents while maintaining data relationships.

## 🚀 Service Configuration

- **Port**: 8002
- **Base URL**: `http://localhost:8002`
- **API Documentation**: `http://localhost:8002/swagger-ui.html`
- **Technologies**: Java 11, Spring Boot 2.5.4, OpenNLP 1.9.3, PostgreSQL
- **Database**: PostgreSQL (port 5433, database: `docqa_deid`)

## ✨ Features

- **Named Entity Recognition**: Detects person names using OpenNLP pre-trained models
- **Pseudonym Management**: Generates and stores unique pseudonyms for each identified entity
- **RESTful API**: Simple POST endpoint for document anonymization
- **Swagger UI**: Interactive API documentation and testing interface
- **Database Persistence**: Maintains pseudonym mappings in PostgreSQL for consistency

## 🔧 Prerequisites

- **Java 11** or higher
- **Maven 3.6+**
- **Docker and Docker Compose** (for PostgreSQL and RabbitMQ)
- **OpenNLP Model**: `en-ner-person.bin` for person name recognition

**⚠️ Important**: Before running the service, download the OpenNLP model:
1. Download `en-ner-person.bin` from [OpenNLP Models](https://opennlp.apache.org/models.html)
2. Place it in `src/main/resources/models/` directory
3. See `src/main/resources/models/README.md` for detailed instructions

## 📦 Installation & Setup

### 1. Start PostgreSQL Database

Ensure the PostgreSQL database is running:

```bash
docker-compose up -d docqa-postgres
```

### 2. Build the Service

```bash
cd microservices/doc-ingestor/docqa-deid-service
mvn clean package -DskipTests
```

### 3. Run the Service

```bash
java -jar target/docqa-deid-service-1.0-SNAPSHOT.jar
```

Or run in the background (Windows PowerShell):

```powershell
Start-Process java -ArgumentList '-jar','target\docqa-deid-service-1.0-SNAPSHOT.jar' -WindowStyle Hidden
```

### 4. Verify Service is Running

```bash
curl http://localhost:8002/actuator/health
```

Expected response:
```json
{"status":"UP"}
```

## 📖 How It Works

The de-identification service uses a multi-step process:

### 1. **Entity Extraction**
   - OpenNLP's Named Entity Recognition model scans the input text
   - Identifies person names using pre-trained `en-ner-person.bin` model
   - Extracts all detected entities into a list

### 2. **Pseudonym Generation**
   - For each identified entity, generates a unique pseudonym
   - Format: `PERSON_` + 8-character UUID (e.g., `PERSON_3c97b791`)
   - Ensures pseudonyms are unique across all documents

### 3. **Database Storage**
   - Stores the mapping: `original_entity → pseudonym` in PostgreSQL
   - Table: `deid_mappings` in `docqa_deid` database
   - Enables consistent de-identification across multiple documents

### 4. **Text Replacement**
   - Replaces all occurrences of the original entity with its pseudonym
   - Returns the anonymized text while preserving document structure

### Architecture Flow

```
Input Document → NER Service → Extract Entities → Generate Pseudonyms 
                                                          ↓
                                                   Store in Database
                                                          ↓
Anonymized Document ← Replace Entities ← Retrieve Pseudonyms
```

## 🌐 API Endpoints

### POST `/api/deid/anonymize`

Anonymizes a document by replacing person names with pseudonyms.

**Request:**
```json
{
  "documentContent": "Your document text with sensitive information"
}
```

**Response:**
```
Anonymized text with pseudonyms replacing person names
```

### Example 1: Medical Record

**Request:**
```bash
curl -X POST http://localhost:8002/api/deid/anonymize \
  -H "Content-Type: application/json" \
  -d '{"documentContent": "Patient John Doe was admitted on 2023-05-15. Dr. Sarah Johnson provided treatment at Boston General Hospital."}'
```

**PowerShell Alternative:**
```powershell
$body = @{documentContent='Patient John Doe was admitted on 2023-05-15. Dr. Sarah Johnson provided treatment at Boston General Hospital.'} | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:8002/api/deid/anonymize' -Method Post -Body $body -ContentType 'application/json'
```

**Response:**
```
Patient John Doe was admitted on 2023-05-15. Dr. PERSON_3c97b791 provided treatment at Boston General Hospital.
```

### Example 2: Clinical Notes

**Request:**
```json
{
  "documentContent": "Dr. Michael Chen examined patient Emily Roberts. Consultation with Dr. Lisa Wong scheduled for next week."
}
```

**Response:**
```
Dr. PERSON_a1b2c3d4 examined patient PERSON_e5f6g7h8. Consultation with Dr. PERSON_i9j0k1l2 scheduled for next week.
```

### Example 3: Multiple Mentions

**Request:**
```json
{
  "documentContent": "Jane Smith visited on Monday. Dr. Brown referred Jane Smith to a specialist. Jane Smith's follow-up is scheduled."
}
```

**Response:**
```
PERSON_m3n4o5p6 visited on Monday. Dr. PERSON_q7r8s9t0 referred PERSON_m3n4o5p6 to a specialist. PERSON_m3n4o5p6's follow-up is scheduled.
```

*Note: The same person receives the same pseudonym across all occurrences.*

### Example 4: Contact Information

**Request:**
```json
{
  "documentContent": "Contact Dr. Robert Williams at robert.williams@hospital.com or call (555) 123-4567. Patient: Amanda Taylor, DOB: 05/15/1985."
}
```

**Response:**
```
Contact Dr. PERSON_u1v2w3x4 at robert.williams@hospital.com or call (555) 123-4567. Patient: PERSON_y5z6a7b8, DOB: 05/15/1985.
```

*Note: Currently only person names are anonymized. Future versions will include phone numbers, emails, and dates.*

## 🧪 Testing with Swagger UI

1. Open your browser to `http://localhost:8002/swagger-ui.html`
2. Navigate to the **deid-controller** section
3. Click on **POST /api/deid/anonymize**
4. Click **"Try it out"**
5. Enter your test document in the request body:
   ```json
   {
     "documentContent": "Patient John Smith was treated by Dr. Jane Doe."
   }
   ```
6. Click **"Execute"**
7. View the anonymized response in the **Response body** section

## 🗄️ Database Schema

The service uses the `docqa_deid` database with the following tables:

### `deid_mappings`
Stores pseudonym mappings for consistent de-identification.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| original_value | VARCHAR(255) | Original entity text |
| pseudonym | VARCHAR(255) | Generated pseudonym |
| entity_type | VARCHAR(50) | Type of entity (e.g., PERSON) |
| created_at | TIMESTAMP | When mapping was created |

### `deid_documents`
Tracks processed documents (optional, for auditing).

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| document_id | UUID | Original document identifier |
| processed_at | TIMESTAMP | Processing timestamp |

## 🔍 Health & Monitoring

### Health Check
```bash
curl http://localhost:8002/actuator/health
```

### Application Info
```bash
curl http://localhost:8002/actuator/info
```

## 🛠️ Development

### Running Tests
```bash
mvn test
```

### Building without Tests
```bash
mvn clean package -DskipTests
```

### Rebuilding and Restarting
```bash
# Stop the service (PowerShell)
Get-Process -Name java | Where-Object {$_.Path -like "*docqa-deid-service*"} | Stop-Process -Force

# Rebuild
mvn clean package -DskipTests

# Restart
java -jar target/docqa-deid-service-1.0-SNAPSHOT.jar
```

## 🐛 Troubleshooting

### Service won't start
- Check if port 8002 is already in use: `netstat -ano | findstr :8002`
- Verify PostgreSQL is running: `docker ps | findstr postgres`
- Check database connection in `application.yml`

### No entities detected
- Ensure `en-ner-person.bin` model exists in `src/main/resources/models/`
- Verify the model file is not corrupted (should be ~4.5 MB)

### Database connection errors
- Confirm PostgreSQL port is 5433 (not default 5432)
- Verify database `docqa_deid` exists
- Check credentials in `application.yml`

## 📝 Future Enhancements

- [ ] Add support for additional entity types (dates, locations, organizations)
- [ ] Implement phone number and email anonymization
- [ ] Add RabbitMQ message consumer for async processing
- [ ] Support for multiple languages and NER models
- [ ] Configurable anonymization strategies
- [ ] Audit logging for compliance tracking

## 🤝 Contributing

Contributions are welcome! Please submit a pull request or open an issue for enhancements or bug fixes.

## 📄 License

This project is licensed under the MIT License.