"""
Script pour uploader automatiquement les documents médicaux de test
dans le système DocQA
"""
import os
import requests
import glob
import time

# Configuration
API_GATEWAY_URL = "http://localhost:8000"
MEDICAL_DATA_DIR = "./medical_data"

def upload_document(filepath: str, patient_id: str = None, document_type: str = "rapport_medical"):
    """Upload un document vers le système"""
    filename = os.path.basename(filepath)
    
    try:
        with open(filepath, 'rb') as f:
            files = {'file': (filename, f, 'application/pdf')}
            data = {
                'document_type': document_type  # Champ requis
            }
            if patient_id:
                data['patient_id'] = patient_id
            
            response = requests.post(
                f"{API_GATEWAY_URL}/api/documents/upload",
                files=files,
                data=data,
                timeout=60
            )
            
            if response.status_code in [200, 201]:
                print(f"✅ {filename} - Uploadé avec succès")
                return True
            else:
                print(f"❌ {filename} - Erreur {response.status_code}: {response.text[:100]}")
                return False
                
    except requests.exceptions.ConnectionError:
        print(f"❌ {filename} - Erreur de connexion au serveur")
        return False
    except Exception as e:
        print(f"❌ {filename} - Erreur: {e}")
        return False


def main():
    print("=" * 60)
    print("   DocQA - Upload des Documents Médicaux de Test")
    print("=" * 60)
    print()
    
    # Vérifier la connexion au serveur
    print("🔍 Vérification de la connexion au serveur...")
    try:
        response = requests.get(f"{API_GATEWAY_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Serveur API Gateway accessible\n")
        else:
            print(f"⚠️ Serveur répond avec status: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Impossible de se connecter à l'API Gateway")
        print("   Assurez-vous que les services Docker sont démarrés.")
        return
    
    # Lister les fichiers PDF
    pdf_files = glob.glob(os.path.join(MEDICAL_DATA_DIR, "*.pdf"))
    
    if not pdf_files:
        print(f"❌ Aucun fichier PDF trouvé dans {MEDICAL_DATA_DIR}")
        return
    
    print(f"📁 {len(pdf_files)} documents PDF trouvés\n")
    
    # Upload de chaque document
    success_count = 0
    error_count = 0
    
    for i, filepath in enumerate(pdf_files, 1):
        print(f"[{i}/{len(pdf_files)}] ", end="")
        
        # Générer un patient_id basé sur le nom du fichier
        filename = os.path.basename(filepath)
        if "_" in filename:
            # Extraire un ID patient du nom de fichier (ex: CR_Cardio_Benali_001.pdf -> P001)
            parts = filename.replace(".pdf", "").split("_")
            patient_id = f"P{parts[-1]}" if parts[-1].isdigit() else None
        else:
            patient_id = None
        
        if upload_document(filepath, patient_id):
            success_count += 1
        else:
            error_count += 1
        
        # Petit délai entre les uploads
        time.sleep(0.5)
    
    print()
    print("=" * 60)
    print(f"   Résumé: {success_count} réussis, {error_count} échecs")
    print("=" * 60)
    
    if success_count > 0:
        print()
        print("🎉 Les documents ont été uploadés!")
        print("   Vous pouvez maintenant poser des questions sur:")
        print("   http://localhost:3000")
        print()
        print("   Exemple de question:")
        print('   "Quels sont les symptômes du patient atteint de diabète?"')


if __name__ == "__main__":
    main()
