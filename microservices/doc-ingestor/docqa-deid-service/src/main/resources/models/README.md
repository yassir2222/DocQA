# OpenNLP Models

This directory should contain the OpenNLP pre-trained models for Named Entity Recognition (NER).

## Required Model Files

- `en-ner-person.bin` - English Person Name Finder Model

## ⚠️ IMPORTANT: Where to Find NER Models

The page at https://opennlp.apache.org/models.html shows models for:
- ✅ Language Detection
- ✅ Sentence Detection  
- ✅ Tokenization
- ✅ Lemmatization
- ✅ Part of Speech (POS) Tagging

**BUT NOT NER models!** ❌

## How to Download NER Models

### Option 1: Download from SourceForge (Recommended)

Visit: **https://opennlp.sourceforge.net/models-1.5/**

Download these files:
1. **en-ner-person.bin** - For detecting person names (REQUIRED)
2. **en-ner-location.bin** - For detecting locations (optional)
3. **en-ner-organization.bin** - For detecting organizations (optional)

Direct link for person names:
```
https://opennlp.sourceforge.net/models-1.5/en-ner-person.bin
```

### Option 2: Use the Download Script

Run the automated download script:
```batch
download-model.bat
```

### Option 3: Manual Download with PowerShell

```powershell
# Navigate to project directory
cd C:\Users\karzo\OneDrive\Bureau\study\QA\DocQA\microservices\doc-ingestor\docqa-deid-service

# Download the model
Invoke-WebRequest -Uri "https://opennlp.sourceforge.net/models-1.5/en-ner-person.bin" `
  -OutFile "src\main\resources\models\en-ner-person.bin"
```

## Verify the Model

After downloading, verify the file exists:

```batch
dir src\main\resources\models\en-ner-person.bin
```

The file should be approximately 4-5 MB in size.

## Note

The application will fail to start if this model file is not present. Make sure to download and place it in this directory before running the service.

## Alternative Models

If you need to detect additional types of entities, you can download:
- `en-ner-location.bin` - Location names
- `en-ner-organization.bin` - Organization names  
- `en-ner-date.bin` - Dates
- `en-ner-time.bin` - Times
- `en-ner-money.bin` - Monetary values
- `en-ner-percentage.bin` - Percentages

All available at: https://opennlp.sourceforge.net/models-1.5/


