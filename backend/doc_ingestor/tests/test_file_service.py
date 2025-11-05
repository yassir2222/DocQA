"""
Tests pour le service de gestion des fichiers.
"""
import pytest
from pathlib import Path
from io import BytesIO
from fastapi import UploadFile, HTTPException
from services.file_service import FileService


class TestFileService:
    """Tests pour FileService."""
    
    @pytest.mark.asyncio
    async def test_save_upload_file_pdf(self, tmp_path):
        """Test sauvegarde fichier PDF."""
        # Créer un fichier PDF de test
        content = b"%PDF-1.4\nTest content"
        upload_file = UploadFile(
            filename="test.pdf",
            file=BytesIO(content)
        )
        
        # Sauvegarder (utiliser tmp_path pour les tests)
        with pytest.MonkeyPatch.context() as m:
            m.setattr("config.settings.TEMP_FOLDER", str(tmp_path))
            
            file_path, file_type, file_size = await FileService.save_upload_file(
                upload_file
            )
        
        assert Path(file_path).exists()
        assert file_type == "pdf"
        assert file_size == len(content)
        assert file_path.endswith(".pdf")
    
    @pytest.mark.asyncio
    async def test_save_upload_file_invalid_extension(self):
        """Test rejet fichier extension invalide."""
        content = b"Test"
        upload_file = UploadFile(
            filename="test.exe",
            file=BytesIO(content)
        )
        
        with pytest.raises(HTTPException) as exc_info:
            await FileService.save_upload_file(upload_file)
        
        assert exc_info.value.status_code == 400
        assert "non autorisée" in exc_info.value.detail.lower()
    
    @pytest.mark.asyncio
    async def test_save_upload_file_too_large(self, tmp_path):
        """Test rejet fichier trop volumineux."""
        # Créer un fichier > MAX_FILE_SIZE_MB
        large_content = b"A" * (51 * 1024 * 1024)  # 51 MB
        upload_file = UploadFile(
            filename="large.pdf",
            file=BytesIO(large_content)
        )
        
        with pytest.MonkeyPatch.context() as m:
            m.setattr("config.settings.TEMP_FOLDER", str(tmp_path))
            m.setattr("config.settings.MAX_FILE_SIZE_MB", 50)
            
            with pytest.raises(HTTPException) as exc_info:
                await FileService.save_upload_file(upload_file)
        
        assert exc_info.value.status_code == 413
        assert "volumineux" in exc_info.value.detail.lower()
    
    def test_delete_file(self, tmp_path):
        """Test suppression fichier."""
        # Créer un fichier temporaire
        test_file = tmp_path / "test.pdf"
        test_file.write_text("test content")
        
        assert test_file.exists()
        
        # Supprimer
        FileService.delete_file(str(test_file))
        
        assert not test_file.exists()
    
    def test_delete_nonexistent_file(self):
        """Test suppression fichier inexistant (ne doit pas crasher)."""
        # Ne doit pas lever d'exception
        FileService.delete_file("/nonexistent/file.pdf")
    
    def test_cleanup_temp_folder(self, tmp_path):
        """Test nettoyage dossier temporaire."""
        import time
        from datetime import datetime, timedelta
        
        with pytest.MonkeyPatch.context() as m:
            m.setattr("config.settings.TEMP_FOLDER", str(tmp_path))
            
            # Créer fichiers anciens (> 24h)
            old_file = tmp_path / "old.pdf"
            old_file.write_text("old")
            
            # Modifier le timestamp pour simuler ancien fichier
            old_time = (datetime.now() - timedelta(hours=25)).timestamp()
            Path(old_file).touch()
            import os
            os.utime(old_file, (old_time, old_time))
            
            # Créer fichier récent
            recent_file = tmp_path / "recent.pdf"
            recent_file.write_text("recent")
            
            # Nettoyer
            FileService.cleanup_temp_folder(older_than_hours=24)
            
            # Vérifier
            assert not old_file.exists()
            assert recent_file.exists()
