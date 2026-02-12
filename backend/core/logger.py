import logging
import sys
from core.config import settings

# Loglama Formatı
LOG_FORMAT = "%(asctime)s [%(levelname)s] %(name)s: %(message)s"

def configure_logging():
    """
    Python logging modülünü yapılandırır.
    """
    # Root logger ayarı
    logging.basicConfig(
        level=logging.INFO,
        format=LOG_FORMAT,
        handlers=[
            logging.StreamHandler(sys.stdout) # Standart çıktıya (konsol) yaz
        ]
    )
    
    # Kütüphane log seviyelerini ayarla (Gürültüyü azaltmak için)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

# Logger nesnesini oluştur
logger = logging.getLogger("retail_dss")

# Test modu kontrolü (Opsiyonel: Testlerde debug açılabilir)
if settings.TESTING:
    logger.setLevel(logging.DEBUG)
